import React from 'react';
import { X, Heart, Gift, Star, MapPin, Calendar, Users } from 'lucide-react';

interface WelcomeMessageProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  isNewCustomer?: boolean;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  isOpen,
  onClose,
  customerName = 'Traveler',
  isNewCustomer = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">
              {isNewCustomer ? 'Welcome to Tripsera!' : 'Welcome Back!'}
            </h2>
            <p className="text-sm opacity-90">
              {isNewCustomer 
                ? `Hello ${customerName}! Get 10% off your first booking.`
                : `Hello ${customerName}! Check out our latest deals.`
              }
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isNewCustomer ? (
            <div className="space-y-4">
              {/* New Customer Benefits */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <Gift className="w-5 h-5 text-blue-600 mr-2" />
                  New Customer Benefits
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 text-sm">10% off your first booking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 text-sm">Priority customer support</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Returning Customer */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                  <Heart className="w-5 h-5 text-purple-600 mr-2" />
                  Welcome Back!
                </h3>
                <p className="text-gray-700 text-sm">
                  Check out our latest destinations and special offers!
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                onClose();
                window.location.href = '/destinations';
              }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 flex items-center justify-center text-sm"
            >
              <MapPin className="w-4 h-4 mr-1" />
              Explore
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = '/bookings';
              }}
              className="flex-1 bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold border-2 border-orange-500 hover:bg-orange-50 flex items-center justify-center text-sm"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
