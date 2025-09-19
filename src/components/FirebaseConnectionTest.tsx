import React, { useState } from 'react';
import { auth, db } from '../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const FirebaseConnectionTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testFirebaseConnection = async () => {
    setTestResults([]);
    
    try {
      // Test 1: Check if Firebase is initialized
      addResult('Testing Firebase initialization...');
      if (auth && db) {
        addResult('✅ Firebase initialized successfully');
      } else {
        addResult('❌ Firebase not initialized');
        return;
      }

      // Test 2: Check current user
      addResult('Testing current user...');
      const currentUser = auth.currentUser;
      if (currentUser) {
        addResult(`✅ Current user: ${currentUser.email}`);
      } else {
        addResult('ℹ️ No current user (this is normal if not logged in)');
      }

      // Test 3: Test Firestore connection
      addResult('Testing Firestore connection...');
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        addResult(`✅ Firestore connected. Found ${snapshot.size} users`);
        
        // List all users
        snapshot.forEach((doc) => {
          const userData = doc.data();
          addResult(`  - User: ${userData.email} (${userData.role})`);
        });
      } catch (error: any) {
        addResult(`❌ Firestore error: ${error.message}`);
      }

    } catch (error: any) {
      addResult(`❌ Connection test failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">Firebase Connection Test</h3>
      <button
        onClick={testFirebaseConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Firebase Connection
      </button>
      <div className="mt-4">
        <h4 className="font-bold">Test Results:</h4>
        <div className="bg-black text-green-400 p-2 rounded text-xs max-h-40 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index}>{result}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FirebaseConnectionTest;
