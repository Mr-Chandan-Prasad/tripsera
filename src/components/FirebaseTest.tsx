// Firebase Connection Test Component
import React, { useState } from 'react';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { testFirebaseConnection, testFirebaseConfig } from '../utils/firebaseTest';

const FirebaseTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testFirebaseConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkConfig = () => {
    const config = testFirebaseConfig();
    setTestResult({
      success: true,
      message: 'Configuration loaded',
      details: config
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Firebase Connection Test</h2>
        <p className="text-gray-600 mt-2">Test your Firebase setup and configuration</p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={runTest}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                <span>Test Connection</span>
              </>
            )}
          </button>
          
          <button
            onClick={checkConfig}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>Check Config</span>
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              {testResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.message}
                </h3>
                
                {testResult.error && (
                  <p className="text-red-700 mt-2 text-sm">
                    Error: {testResult.error}
                  </p>
                )}
                
                {testResult.details && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-800 mb-2">Details:</h4>
                    <div className="bg-gray-100 p-3 rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
            <li>2. Create a new project</li>
            <li>3. Enable Authentication and Firestore</li>
            <li>4. Get your config from Project Settings</li>
            <li>5. Update <code className="bg-blue-100 px-1 rounded">src/config/firebase.ts</code></li>
            <li>6. Run the connection test</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;
