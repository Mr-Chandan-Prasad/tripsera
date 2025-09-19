import React, { useState, useRef } from 'react';
import { Upload, X, Eye, AlertCircle, Check } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
  multiple?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  maxSize = 20,
  accept = "image/*",
  className = "",
  multiple = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file';
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedFormats.includes(file.type)) {
      return 'Supported formats: JPG, PNG, WEBP, GIF';
    }

    return null;
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        let { width, height } = img;
        const maxWidth = 1920;
        const maxHeight = 1080;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const quality = file.size > 5 * 1024 * 1024 ? 0.7 : 0.9; // Lower quality for larger files
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setUploading(false);
        return;
      }

      // Compress image if needed
      let imageUrl: string;
      if (file.size > 2 * 1024 * 1024) { // Compress if larger than 2MB
        imageUrl = await compressImage(file);
      } else {
        // Convert to base64 for smaller files
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      }

      setPreview(imageUrl);
      onImageUpload(imageUrl);
      console.log('ImageUploader - Image uploaded successfully:', imageUrl ? 'Yes' : 'No');
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Image upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setPreview('');
    setError('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-orange-500 bg-orange-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileSelector}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="text-sm text-gray-600">Processing image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className={`w-8 h-8 ${error ? 'text-red-400' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WEBP up to {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(preview, '_blank');
                }}
                className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">Image uploaded successfully</span>
            </div>
            <button
              onClick={openFileSelector}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        <p>• Supported formats: JPG, PNG, WEBP, GIF</p>
        <p>• Maximum file size: {maxSize}MB</p>
        <p>• Images will be automatically compressed if needed</p>
      </div>
    </div>
  );
};

export default ImageUploader;