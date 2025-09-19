import React, { useState } from 'react';
import { useAuth } from '../hooks/useFirebaseAuth';
import { auth } from '../config/firebase';

const DebugAuth: React.FC = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const handleSignIn = async () => {
    try {
      addDebugInfo(`Attempting sign in with: ${email}`);
      console.log('Attempting sign in with:', email, password);
      await signIn(email, password);
      addDebugInfo('Sign in successful');
      console.log('Sign in successful');
    } catch (error: any) {
      addDebugInfo(`Sign in error: ${error.code} - ${error.message}`);
      console.error('Sign in error:', error);
    }
  };

  const handleSignUp = async () => {
    try {
      addDebugInfo(`Attempting sign up with: ${email}`);
      console.log('Attempting sign up with:', email, password, displayName);
      await signUp(email, password, displayName || 'User', 'customer');
      addDebugInfo('Sign up successful');
      console.log('Sign up successful');
    } catch (error: any) {
      addDebugInfo(`Sign up error: ${error.code} - ${error.message}`);
      console.error('Sign up error:', error);
    }
  };

  const checkCurrentUser = () => {
    const currentUser = auth.currentUser;
    addDebugInfo(`Current Firebase user: ${currentUser ? currentUser.email : 'None'}`);
    console.log('Current Firebase user:', currentUser);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">Debug Authentication</h3>
      <div className="space-y-2">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter your display name (username)"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter your email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter your password"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setDisplayName('Test User');
              setEmail('test@tripsera.com');
              setPassword('test123');
            }}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
          >
            Use Test Credentials
          </button>
          <button
            onClick={() => {
              setDisplayName('');
              setEmail('');
              setPassword('');
            }}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
          >
            Clear
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            Sign Up
          </button>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Sign In
          </button>
          <button
            onClick={checkCurrentUser}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Check User
          </button>
        </div>
        <div className="mt-4">
          <p><strong>Current User:</strong> {user ? `${user.email} (${user.role})` : 'None'}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        </div>
        <div className="mt-4">
          <h4 className="font-bold">Debug Log:</h4>
          <div className="bg-black text-green-400 p-2 rounded text-xs max-h-40 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
