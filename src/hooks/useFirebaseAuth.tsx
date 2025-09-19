// Firebase Authentication Hooks for Tripsera
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../config/firebase';

// Check if Firebase is available
const isFirebaseAvailable = auth && db;

// Types
interface AuthUser extends User {
  role?: 'admin' | 'customer';
  displayName?: string;
  phoneNumber?: string;
}

interface UserProfileData {
  displayName?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;
  photoURL?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: 'admin' | 'customer') => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: UserProfileData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAdmin: boolean;
  isCustomer: boolean;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseAvailable) {
      console.log('⚠️ Firebase not available - using mock authentication');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
          const userData = userDoc.data();
          
          setUser({
            ...firebaseUser,
            role: userData?.role || 'customer',
            displayName: userData?.displayName || firebaseUser.displayName,
            phoneNumber: userData?.phoneNumber || firebaseUser.phoneNumber
          } as AuthUser);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(firebaseUser as AuthUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseAvailable) {
      throw new Error('Firebase authentication is not available. Please configure Firebase or use the app without authentication.');
    }
    
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: 'admin' | 'customer' = 'customer'
  ) => {
    if (!isFirebaseAvailable) {
      throw new Error('Firebase authentication is not available. Please configure Firebase or use the app without authentication.');
    }
    
    try {
      setLoading(true);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!isFirebaseAvailable) {
      console.log('⚠️ Firebase not available - clearing local user state');
      setUser(null);
      return;
    }
    
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: UserProfileData) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setLoading(true);
      
      // Update Firebase Auth profile
      const authUpdateData: any = {};
      if (data.displayName) authUpdateData.displayName = data.displayName;
      if (data.photoURL !== undefined) authUpdateData.photoURL = data.photoURL;
      
      if (Object.keys(authUpdateData).length > 0) {
        await updateProfile(user, authUpdateData);
      }
      
      // Update Firestore user document
      const updateData: any = { updatedAt: new Date() };
      if (data.displayName) updateData.displayName = data.displayName;
      if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
      if (data.phone) updateData.phone = data.phone;
      if (data.address) updateData.address = data.address;
      if (data.dateOfBirth) updateData.dateOfBirth = data.dateOfBirth;
      if (data.bio) updateData.bio = data.bio;
      if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;
      
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), updateData);
      
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error('No user logged in');
    
    try {
      setLoading(true);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    resetPassword,
    changePassword,
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer'
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Admin authentication hook
export function useAdminAuth() {
  const { user, isAdmin, loading } = useAuth();
  
  return {
    isAdmin,
    isAuthenticated: !!user,
    loading,
    user
  };
}

// Customer authentication hook
export function useCustomerAuth() {
  const { user, isCustomer, loading } = useAuth();
  
  return {
    isCustomer,
    isAuthenticated: !!user,
    loading,
    user
  };
}
