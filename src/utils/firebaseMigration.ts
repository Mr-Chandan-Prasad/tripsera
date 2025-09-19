// Firebase Data Migration Script for Tripsera
import { 
  collection, 
  addDoc, 
  setDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';

// Types
interface MigrationResult {
  success: boolean;
  message: string;
  migratedCount: number;
  errors: string[];
}

interface LocalStorageData {
  destinations: any[];
  services: any[];
  bookings: any[];
  addons: any[];
  gallery: any[];
  testimonials: any[];
  advertisements: any[];
  offers: any[];
  inquiries: any[];
  payments: any[];
}

// Get data from localStorage
const getLocalStorageData = (): LocalStorageData => {
  const getData = (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      return [];
    }
  };

  return {
    destinations: getData('destinations'),
    services: getData('services'),
    bookings: getData('bookings'),
    addons: getData('addons'),
    gallery: getData('gallery'),
    testimonials: getData('testimonials'),
    advertisements: getData('advertisements'),
    offers: getData('offers'),
    inquiries: getData('inquiries'),
    payments: getData('payments')
  };
};

// Transform data for Firebase
const transformDataForFirebase = (data: any[], collectionName: string) => {
  return data.map((item, index) => {
    // Remove id if it exists (Firebase will generate new ones)
    const { id, ...itemData } = item;
    
    // Add Firebase-specific fields
    return {
      ...itemData,
      // Preserve original id as legacy_id for reference
      legacy_id: id || `legacy_${index}`,
      // Add timestamps
      created_at: item.created_at ? new Date(item.created_at) : serverTimestamp(),
      updated_at: item.updated_at ? new Date(item.updated_at) : serverTimestamp(),
      // Add migration metadata
      migrated_at: serverTimestamp(),
      migrated_from: 'localStorage'
    };
  });
};

// Migrate a single collection
const migrateCollection = async (
  collectionName: string, 
  data: any[]
): Promise<{ success: boolean; count: number; errors: string[] }> => {
  const errors: string[] = [];
  let successCount = 0;

  if (!data || data.length === 0) {
    return { success: true, count: 0, errors: [] };
  }

  const transformedData = transformDataForFirebase(data, collectionName);

  for (const item of transformedData) {
    try {
      await addDoc(collection(db, collectionName), item);
      successCount++;
    } catch (error) {
      const errorMessage = `Failed to migrate ${collectionName} item: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMessage);
      console.error(errorMessage, item);
    }
  }

  return {
    success: errors.length === 0,
    count: successCount,
    errors
  };
};

// Main migration function
export const migrateToFirebase = async (): Promise<MigrationResult> => {
  console.log('🚀 Starting Firebase migration...');
  
  const errors: string[] = [];
  let totalMigrated = 0;

  try {
    // Get data from localStorage
    const localStorageData = getLocalStorageData();
    console.log('📊 LocalStorage data found:', {
      destinations: localStorageData.destinations.length,
      services: localStorageData.services.length,
      bookings: localStorageData.bookings.length,
      addons: localStorageData.addons.length,
      gallery: localStorageData.gallery.length,
      testimonials: localStorageData.testimonials.length,
      advertisements: localStorageData.advertisements.length,
      offers: localStorageData.offers.length,
      inquiries: localStorageData.inquiries.length,
      payments: localStorageData.payments.length
    });

    // Migrate each collection
    const collections = [
      { name: COLLECTIONS.DESTINATIONS, data: localStorageData.destinations },
      { name: COLLECTIONS.SERVICES, data: localStorageData.services },
      { name: COLLECTIONS.BOOKINGS, data: localStorageData.bookings },
      { name: COLLECTIONS.ADDONS, data: localStorageData.addons },
      { name: COLLECTIONS.GALLERY, data: localStorageData.gallery },
      { name: COLLECTIONS.TESTIMONIALS, data: localStorageData.testimonials },
      { name: COLLECTIONS.ADVERTISEMENTS, data: localStorageData.advertisements },
      { name: COLLECTIONS.OFFERS, data: localStorageData.offers },
      { name: COLLECTIONS.INQUIRIES, data: localStorageData.inquiries },
      { name: COLLECTIONS.PAYMENTS, data: localStorageData.payments }
    ];

    for (const { name, data } of collections) {
      console.log(`📤 Migrating ${name}...`);
      const result = await migrateCollection(name, data);
      
      if (result.success) {
        console.log(`✅ ${name}: ${result.count} items migrated`);
        totalMigrated += result.count;
      } else {
        console.error(`❌ ${name}: ${result.errors.length} errors`);
        errors.push(...result.errors);
      }
    }

    // Create migration record
    try {
      await addDoc(collection(db, 'migrations'), {
        type: 'localStorage_to_firebase',
        total_items_migrated: totalMigrated,
        migrated_at: serverTimestamp(),
        collections_migrated: collections.map(c => c.name),
        errors_count: errors.length,
        success: errors.length === 0
      });
    } catch (error) {
      console.warn('Failed to create migration record:', error);
    }

    const success = errors.length === 0;
    const message = success 
      ? `Successfully migrated ${totalMigrated} items to Firebase`
      : `Migration completed with ${errors.length} errors. ${totalMigrated} items migrated.`;

    console.log(success ? '🎉 Migration completed successfully!' : '⚠️ Migration completed with errors');
    
    return {
      success,
      message,
      migratedCount: totalMigrated,
      errors
    };

  } catch (error) {
    const errorMessage = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage, error);
    
    return {
      success: false,
      message: errorMessage,
      migratedCount: totalMigrated,
      errors: [errorMessage, ...errors]
    };
  }
};

// Check if migration is needed
export const isMigrationNeeded = (): boolean => {
  const localStorageData = getLocalStorageData();
  
  // Check if any collection has data
  const hasData = Object.values(localStorageData).some(data => data.length > 0);
  
  // Check if migration has already been done
  const migrationDone = localStorage.getItem('firebase_migration_done') === 'true';
  
  return hasData && !migrationDone;
};

// Mark migration as done
export const markMigrationDone = (): void => {
  localStorage.setItem('firebase_migration_done', 'true');
  localStorage.setItem('firebase_migration_date', new Date().toISOString());
};

// Backup localStorage data before migration
export const backupLocalStorageData = (): string => {
  const data = getLocalStorageData();
  const backup = {
    timestamp: new Date().toISOString(),
    data
  };
  
  const backupString = JSON.stringify(backup, null, 2);
  localStorage.setItem('localStorage_backup', backupString);
  
  return backupString;
};

// Restore from backup
export const restoreFromBackup = (): boolean => {
  try {
    const backupString = localStorage.getItem('localStorage_backup');
    if (!backupString) return false;
    
    const backup = JSON.parse(backupString);
    
    // Restore each collection
    Object.entries(backup.data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    
    return true;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return false;
  }
};

// Clear localStorage after successful migration
export const clearLocalStorageData = (): void => {
  const collections = [
    'destinations', 'services', 'bookings', 'addons', 'gallery',
    'testimonials', 'advertisements', 'offers', 'inquiries', 'payments'
  ];
  
  collections.forEach(collection => {
    localStorage.removeItem(collection);
  });
  
  console.log('🧹 LocalStorage data cleared after successful migration');
};
