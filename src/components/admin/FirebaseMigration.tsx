// Firebase Migration Component for Admin Panel
import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { 
  migrateToFirebase, 
  isMigrationNeeded, 
  markMigrationDone, 
  backupLocalStorageData,
  restoreFromBackup,
  clearLocalStorageData
} from '../../utils/firebaseMigration';
import { useNotification } from '../../hooks/useNotification';

interface MigrationStatus {
  isNeeded: boolean;
  isRunning: boolean;
  isCompleted: boolean;
  error: string | null;
  result: any;
}

const FirebaseMigration: React.FC = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  const [status, setStatus] = useState<MigrationStatus>({
    isNeeded: isMigrationNeeded(),
    isRunning: false,
    isCompleted: false,
    error: null,
    result: null
  });

  const handleMigration = async () => {
    try {
      setStatus(prev => ({ ...prev, isRunning: true, error: null }));
      
      // Create backup first
      const backup = backupLocalStorageData();
      showInfo('Backup Created', 'LocalStorage data backed up before migration', 3000);
      
      // Run migration
      const result = await migrateToFirebase();
      
      if (result.success) {
        setStatus(prev => ({ 
          ...prev, 
          isRunning: false, 
          isCompleted: true, 
          result,
          isNeeded: false
        }));
        
        markMigrationDone();
        showSuccess(
          'Migration Successful!', 
          `Successfully migrated ${result.migratedCount} items to Firebase`, 
          5000
        );
      } else {
        setStatus(prev => ({ 
          ...prev, 
          isRunning: false, 
          error: result.message,
          result
        }));
        showError('Migration Failed', result.message, 5000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Migration failed';
      setStatus(prev => ({ 
        ...prev, 
        isRunning: false, 
        error: errorMessage
      }));
      showError('Migration Error', errorMessage, 5000);
    }
  };

  const handleRestoreBackup = () => {
    try {
      const restored = restoreFromBackup();
      if (restored) {
        setStatus(prev => ({ ...prev, isNeeded: true, isCompleted: false }));
        showSuccess('Backup Restored', 'LocalStorage data restored from backup', 3000);
      } else {
        showError('Restore Failed', 'No backup found or restore failed', 3000);
      }
    } catch (error) {
      showError('Restore Error', 'Failed to restore backup', 3000);
    }
  };

  const handleClearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all LocalStorage data? This action cannot be undone.')) {
      try {
        clearLocalStorageData();
        setStatus(prev => ({ ...prev, isNeeded: false }));
        showSuccess('Data Cleared', 'LocalStorage data cleared successfully', 3000);
      } catch (error) {
        showError('Clear Failed', 'Failed to clear LocalStorage data', 3000);
      }
    }
  };

  const handleRefreshStatus = () => {
    setStatus(prev => ({ 
      ...prev, 
      isNeeded: isMigrationNeeded(),
      isCompleted: false,
      error: null
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Firebase Migration</h2>
        <button
          onClick={handleRefreshStatus}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Migration Status Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className={`p-3 rounded-full ${
            status.isNeeded ? 'bg-yellow-100 text-yellow-600' : 
            status.isCompleted ? 'bg-green-100 text-green-600' : 
            'bg-gray-100 text-gray-600'
          }`}>
            {status.isNeeded ? <AlertCircle className="w-6 h-6" /> : 
             status.isCompleted ? <CheckCircle className="w-6 h-6" /> : 
             <Database className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {status.isNeeded ? 'Migration Required' : 
               status.isCompleted ? 'Migration Completed' : 
               'No Migration Needed'}
            </h3>
            <p className="text-gray-600">
              {status.isNeeded ? 'Your data is stored in LocalStorage and needs to be migrated to Firebase' :
               status.isCompleted ? 'All data has been successfully migrated to Firebase' :
               'All data is already in Firebase or no data to migrate'}
            </p>
          </div>
        </div>

        {status.isNeeded && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Migration Required</span>
            </div>
            <p className="text-yellow-700 mt-2">
              Your website is currently using LocalStorage for data storage. 
              To enable real-time updates, cloud storage, and better performance, 
              migrate your data to Firebase.
            </p>
          </div>
        )}

        {status.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Migration Error</span>
            </div>
            <p className="text-red-700 mt-2">{status.error}</p>
          </div>
        )}

        {status.result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Migration Results</span>
            </div>
            <div className="text-green-700 mt-2 space-y-1">
              <p>✅ Items migrated: {status.result.migratedCount}</p>
              <p>✅ Status: {status.result.success ? 'Success' : 'Failed'}</p>
              {status.result.errors && status.result.errors.length > 0 && (
                <p>⚠️ Errors: {status.result.errors.length}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {status.isNeeded && (
          <button
            onClick={handleMigration}
            disabled={status.isRunning}
            className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {status.isRunning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Migrating...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Migrate to Firebase</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={handleRestoreBackup}
          className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Restore Backup</span>
        </button>

        <button
          onClick={handleClearLocalStorage}
          className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          <span>Clear LocalStorage</span>
        </button>

        <a
          href="/FIREBASE_SETUP_GUIDE.md"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Database className="w-5 h-5" />
          <span>Setup Guide</span>
        </a>
      </div>

      {/* Migration Benefits */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Migrate to Firebase?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Real-time updates across all devices</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Cloud storage - never lose data</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Secure authentication system</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">High-quality image uploads</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Offline support with sync</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Analytics and user tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Easy deployment and hosting</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Scalable for thousands of users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseMigration;
