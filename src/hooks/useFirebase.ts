// Firebase Hooks for Tripsera
import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';

// Types
interface FirebaseResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface FirebaseMutation {
  loading: boolean;
  error: string | null;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

// Firebase Query Hook
export function useFirebaseQuery<T>(
  collectionName: string,
  filters?: Record<string, any>,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'asc',
  limitCount?: number
): FirebaseResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let q = query(collection(db, collectionName));

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([field, value]) => {
          if (value !== null && value !== undefined) {
            q = query(q, where(field, '==', value));
          }
        });
      }

      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const result: T[] = [];
      
      querySnapshot.forEach((doc) => {
        result.push({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to JavaScript dates
          created_at: doc.data().created_at?.toDate?.() || doc.data().created_at,
          updated_at: doc.data().updated_at?.toDate?.() || doc.data().updated_at,
        } as T);
      });

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error(`Error fetching ${collectionName}:`, err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [collectionName, filters, orderByField, orderDirection, limitCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Real-time Firebase Query Hook
export function useFirebaseRealtime<T>(
  collectionName: string,
  filters?: Record<string, any>,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'asc'
): FirebaseResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = query(collection(db, collectionName));

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== null && value !== undefined) {
          q = query(q, where(field, '==', value));
        }
      });
    }

    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const result: T[] = [];
        
        querySnapshot.forEach((doc) => {
          result.push({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to JavaScript dates
            created_at: doc.data().created_at?.toDate?.() || doc.data().created_at,
            updated_at: doc.data().updated_at?.toDate?.() || doc.data().updated_at,
          } as T);
        });

        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        console.error(`Error in real-time ${collectionName}:`, err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, filters, orderByField, orderDirection]);

  const refetch = useCallback(async () => {
    // Real-time updates don't need manual refetch
    setLoading(true);
  }, []);

  return { data, loading, error, refetch };
}

// Firebase Mutation Hook
export function useFirebaseMutation(collectionName: string): FirebaseMutation {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      const docData = {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, collectionName), docData);
      return { id: docRef.id, ...docData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create document';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const update = useCallback(async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);

      const docData = {
        ...data,
        updated_at: serverTimestamp()
      };

      await updateDoc(doc(db, collectionName, id), docData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const deleteRecord = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  return {
    loading,
    error,
    create,
    update,
    delete: deleteRecord
  };
}

// Specific hooks for Tripsera collections
export const useBookings = (filters?: Record<string, any>) => 
  useFirebaseRealtime(COLLECTIONS.BOOKINGS, filters, 'created_at', 'desc');

export const useDestinations = () => 
  useFirebaseQuery(COLLECTIONS.DESTINATIONS, undefined, 'name', 'asc');

export const useServices = (filters?: Record<string, any>) => 
  useFirebaseQuery(COLLECTIONS.SERVICES, filters, 'name', 'asc');

export const useAddons = () => 
  useFirebaseQuery(COLLECTIONS.ADDONS, undefined, 'name', 'asc');

export const useGallery = () => 
  useFirebaseQuery(COLLECTIONS.GALLERY, undefined, 'created_at', 'desc');

export const useTestimonials = () => 
  useFirebaseQuery(COLLECTIONS.TESTIMONIALS, undefined, 'created_at', 'desc');

export const useAdvertisements = () => 
  useFirebaseQuery(COLLECTIONS.ADVERTISEMENTS, undefined, 'created_at', 'desc');

export const useOffers = () => 
  useFirebaseQuery(COLLECTIONS.OFFERS, undefined, 'created_at', 'desc');

export const useInquiries = () => 
  useFirebaseRealtime(COLLECTIONS.INQUIRIES, undefined, 'created_at', 'desc');

export const usePayments = (filters?: Record<string, any>) => 
  useFirebaseRealtime(COLLECTIONS.PAYMENTS, filters, 'created_at', 'desc');

// Mutation hooks
export const useBookingMutation = () => useFirebaseMutation(COLLECTIONS.BOOKINGS);
export const useDestinationMutation = () => useFirebaseMutation(COLLECTIONS.DESTINATIONS);
export const useServiceMutation = () => useFirebaseMutation(COLLECTIONS.SERVICES);
export const useAddonMutation = () => useFirebaseMutation(COLLECTIONS.ADDONS);
export const useGalleryMutation = () => useFirebaseMutation(COLLECTIONS.GALLERY);
export const useTestimonialMutation = () => useFirebaseMutation(COLLECTIONS.TESTIMONIALS);
export const useAdvertisementMutation = () => useFirebaseMutation(COLLECTIONS.ADVERTISEMENTS);
export const useOfferMutation = () => useFirebaseMutation(COLLECTIONS.OFFERS);
export const useInquiryMutation = () => useFirebaseMutation(COLLECTIONS.INQUIRIES);
export const usePaymentMutation = () => useFirebaseMutation(COLLECTIONS.PAYMENTS);

// Utility functions
export const getDocumentById = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        created_at: docSnap.data().created_at?.toDate?.() || docSnap.data().created_at,
        updated_at: docSnap.data().updated_at?.toDate?.() || docSnap.data().updated_at,
      };
    } else {
      throw new Error('Document not found');
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

// Statistics and analytics functions
export const getBookingStats = async () => {
  try {
    const bookingsSnapshot = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking: any) => sum + (booking.total_amount || 0), 0);
    const totalTravelers = bookings.reduce((sum, booking: any) => sum + (booking.travelers || 0), 0);
    
    // Group by status
    const statusCounts = bookings.reduce((acc: any, booking: any) => {
      const status = booking.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalBookings,
      totalRevenue,
      totalTravelers,
      statusCounts,
      averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0
    };
  } catch (error) {
    console.error('Error getting booking stats:', error);
    throw error;
  }
};
