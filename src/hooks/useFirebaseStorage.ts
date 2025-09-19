// Firebase Storage Hooks for Tripsera
import { useState, useCallback } from 'react';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata
} from 'firebase/storage';
import { storage, STORAGE_PATHS } from '../config/firebase';

// Types
interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

interface StorageHook {
  uploadFile: (file: File, path: string, onProgress?: (progress: number) => void) => Promise<UploadResult>;
  uploadImage: (file: File, folder: string, onProgress?: (progress: number) => void) => Promise<UploadResult>;
  deleteFile: (path: string) => Promise<void>;
  getFileUrl: (path: string) => Promise<string>;
  listFiles: (path: string) => Promise<string[]>;
  loading: boolean;
  error: string | null;
}

// Main storage hook
export function useFirebaseStorage(): StorageHook {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    try {
      setLoading(true);
      setError(null);

      const storageRef = ref(storage, path);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Get file metadata
      const metadata = await getMetadata(snapshot.ref);
      
      const result: UploadResult = {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        name: file.name,
        size: file.size,
        type: file.type
      };

      if (onProgress) {
        onProgress(100);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (
    file: File, 
    folder: string, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    // Validate image file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const path = `${folder}/${fileName}`;

    return uploadFile(file, path, onProgress);
  }, [uploadFile]);

  const deleteFile = useCallback(async (path: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFileUrl = useCallback(async (path: string): Promise<string> => {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get file URL';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const listFiles = useCallback(async (path: string): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);

      const listRef = ref(storage, path);
      const result = await listAll(listRef);
      
      const urls = await Promise.all(
        result.items.map(async (itemRef) => {
          return await getDownloadURL(itemRef);
        })
      );

      return urls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list files';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    uploadFile,
    uploadImage,
    deleteFile,
    getFileUrl,
    listFiles,
    loading,
    error
  };
}

// Specific hooks for different types of uploads
export function useDestinationImageUpload() {
  const { uploadImage, loading, error } = useFirebaseStorage();

  const uploadDestinationImage = useCallback(async (
    file: File, 
    destinationId: string,
    onProgress?: (progress: number) => void
  ) => {
    const folder = `${STORAGE_PATHS.DESTINATIONS}/${destinationId}`;
    return uploadImage(file, folder, onProgress);
  }, [uploadImage]);

  return {
    uploadDestinationImage,
    loading,
    error
  };
}

export function useGalleryImageUpload() {
  const { uploadImage, loading, error } = useFirebaseStorage();

  const uploadGalleryImage = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    const folder = STORAGE_PATHS.GALLERY;
    return uploadImage(file, folder, onProgress);
  }, [uploadImage]);

  return {
    uploadGalleryImage,
    loading,
    error
  };
}

export function useProfileImageUpload() {
  const { uploadImage, loading, error } = useFirebaseStorage();

  const uploadProfileImage = useCallback(async (
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ) => {
    const folder = `${STORAGE_PATHS.PROFILE_PICS}/${userId}`;
    return uploadImage(file, folder, onProgress);
  }, [uploadImage]);

  return {
    uploadProfileImage,
    loading,
    error
  };
}

// Utility functions
export const generateImagePath = (folder: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${folder}/${timestamp}_${sanitizedFileName}`;
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // Check image dimensions (optional - can be added later)
  return { valid: true };
};

export const compressImage = async (
  file: File, 
  maxWidth: number = 800, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
