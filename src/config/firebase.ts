// Firebase Configuration for Tripsera
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration - ENABLED
// Using the provided Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1rHWoq7zZBK2QrvGbIMfsNh2-PH55PqY",
  authDomain: "tripsera-travel.firebaseapp.com",
  databaseURL: "https://tripsera-travel-default-rtdb.firebaseio.com",
  projectId: "tripsera-travel",
  storageBucket: "tripsera-travel.firebasestorage.app",
  messagingSenderId: "747137912903",
  appId: "1:747137912903:web:e859fb2960ad97a88ca162",
  measurementId: "G-HLL4QQZTXL"
};

// Initialize Firebase with error handling
let app, db, auth, storage, analytics;

try {
  // Only initialize if config is provided
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
    console.log('✅ Firebase initialized successfully');
  } else {
    console.log('⚠️ Firebase not configured - using localStorage only');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.log('📝 App will continue using localStorage only');
}

// Export Firebase services (will be null if not initialized)
export { db, auth, storage, analytics };

// Export the app instance
export default app;

// Firestore Collections
export const COLLECTIONS = {
  BOOKINGS: 'bookings',
  DESTINATIONS: 'destinations',
  SERVICES: 'services',
  ADDONS: 'addons',
  GALLERY: 'gallery',
  TESTIMONIALS: 'testimonials',
  ADVERTISEMENTS: 'advertisements',
  OFFERS: 'offers',
  INQUIRIES: 'inquiries',
  PAYMENTS: 'payments',
  USERS: 'users',
  ADMIN_SETTINGS: 'admin_settings',
  AVAILABILITY: 'availability',
  NOTIFICATIONS: 'notifications'
} as const;

// Storage paths
export const STORAGE_PATHS = {
  DESTINATIONS: 'destinations',
  GALLERY: 'gallery',
  PROFILE_PICS: 'profile-pics',
  DOCUMENTS: 'documents'
} as const;
