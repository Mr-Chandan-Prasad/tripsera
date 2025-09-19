// Firebase Connection Test
import { auth, db } from '../config/firebase';
import { signInAnonymously, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test Authentication
    console.log('📝 Testing Authentication...');
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Authentication working:', userCredential.user.uid);
    
    // Test Firestore
    console.log('🗄️ Testing Firestore...');
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, {
      message: 'Firebase connection test',
      timestamp: new Date().toISOString(),
      status: 'success'
    });
    
    const docSnap = await getDoc(testDoc);
    if (docSnap.exists()) {
      console.log('✅ Firestore working:', docSnap.data());
    }
    
    // Clean up
    await signOut(auth);
    console.log('🧹 Cleaned up test data');
    
    return {
      success: true,
      message: 'Firebase connection successful!',
      details: {
        auth: 'Working',
        firestore: 'Working',
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return {
      success: false,
      message: 'Firebase connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Test Firebase configuration
export const testFirebaseConfig = () => {
  const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'Not set',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'Not set',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'Not set',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'Not set',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'Not set',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || 'Not set'
  };
  
  console.log('🔧 Firebase Configuration:');
  console.log('API Key:', config.apiKey.substring(0, 20) + '...');
  console.log('Auth Domain:', config.authDomain);
  console.log('Project ID:', config.projectId);
  console.log('Storage Bucket:', config.storageBucket);
  console.log('Messaging Sender ID:', config.messagingSenderId);
  console.log('App ID:', config.appId.substring(0, 20) + '...');
  
  return config;
};
