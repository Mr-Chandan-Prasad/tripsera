// Authentication Modal Component
import React, { useState } from 'react';
import { X, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useFirebaseAuth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { user, logout, isAdmin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  const handleLoginSuccess = () => {
    onLoginSuccess?.();
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {user ? 'Account' : (isLogin ? 'Sign In' : 'Sign Up')}
              </h2>
              <p className="text-sm text-gray-600">
                {user ? 'Manage your account' : 'Access your Tripsera account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {user ? (
            // User is logged in - show account info
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{user.displayName}</h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isAdmin 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isAdmin ? 'Administrator' : 'Customer'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Navigate to profile or settings
                    console.log('Navigate to profile');
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Account Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            // User is not logged in - show login/register forms
            <div>
              {isLogin ? (
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onSwitchToRegister={() => setIsLogin(false)}
                />
              ) : (
                <RegisterForm
                  onSuccess={handleLoginSuccess}
                  onSwitchToLogin={() => setIsLogin(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
