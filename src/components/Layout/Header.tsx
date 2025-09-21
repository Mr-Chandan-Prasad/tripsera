import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, Menu, X, User, LogOut, Car, Bus, Bike, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useFirebaseAuth';
import { useTheme } from '../../contexts/ThemeContext';
import AuthModal from '../auth/AuthModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(0);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const vehicles = [
    { icon: Plane, name: 'Plane', color: 'text-orange-400', animation: 'animate-fly-plane' },
    { icon: Car, name: 'Car', color: 'text-blue-400', animation: 'animate-drive-car' },
    { icon: Bus, name: 'Bus', color: 'text-green-400', animation: 'animate-ride-bus' },
    { icon: Bike, name: 'Bike', color: 'text-purple-400', animation: 'animate-pedal-bike' }
  ];

  const navigation = [
    { name: 'Journey', href: '/' },
    { name: 'Where to Next?', href: '/destinations' },
    { name: 'Add-Ons', href: '/services' },
    { name: 'Memories', href: '/gallery' },
    { name: 'Your Trips', href: '/my-bookings' },
    { name: 'Plan & Reserve', href: '/bookings' },
    { name: 'Let\'s Connect', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Cycle through vehicles every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVehicle((prev) => (prev + 1) % vehicles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [vehicles.length]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="fixed w-full top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 to-purple-800 shadow-lg border-0 h-[72px]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 h-full flex justify-between items-center">
        {/* Logo on the left side */}
        <Link to="/" className="flex items-center space-x-3 text-white group">
          <div className="relative">
            {/* Background circle with gradient */}
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-300 group-hover:scale-110"></div>
            {/* Dynamic Vehicle Icon */}
            {React.createElement(vehicles[currentVehicle].icon, {
              className: `relative w-10 h-10 ${vehicles[currentVehicle].color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 drop-shadow-lg ${vehicles[currentVehicle].animation}`,
              key: currentVehicle
            })}
            {/* Dynamic trail effect */}
            <div className={`absolute top-1/2 left-0 w-8 h-0.5 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-60 ${vehicles[currentVehicle].animation}`} style={{animationDelay: '0.2s'}}></div>
            {/* Pulsing dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
            {/* Sparkle effects */}
            <div className="absolute -top-2 -left-1 w-2 h-2 bg-white rounded-full opacity-60 animate-ping"></div>
            <div className="absolute -bottom-1 -right-2 w-1.5 h-1.5 bg-orange-300 rounded-full opacity-40 animate-pulse"></div>
            {/* Vehicle name indicator */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-white opacity-70 transition-all duration-300">
              {vehicles[currentVehicle].name}
            </div>
          </div>
          <div className="flex flex-col relative">
            {/* Background glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
            <span className="relative text-2xl font-bold leading-tight drop-shadow-lg">
              <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent animate-gradient-x">
                Tripsera
              </span>
            </span>
            <span className="relative text-sm font-semibold text-orange-300 tracking-wider -mt-1 drop-shadow-md">
              TRAVELS
            </span>
            {/* Decorative line */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-400 group-hover:w-full transition-all duration-500"></div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-3 items-center">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-base font-semibold transition-all duration-300 hover:text-orange-400 ${
                isActive(item.href) ? 'text-orange-400 underline' : 'text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
          {/* Authentication Section */}
          <div className="flex items-center space-x-2 ml-3 min-h-[40px]">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="text-white hover:text-orange-400 transition-colors p-2 rounded-lg hover:bg-white/10"
              title="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center" />
                  <span className="text-white text-sm font-medium">{user.displayName}</span>
                  {isAdmin && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Admin</span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-orange-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 hover:scale-105 flex items-center space-x-1 text-base h-[40px]"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
            {/* Admin Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 hover:scale-105 text-base"
              >
                🛠 Admin
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button - Always visible on mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white focus:outline-none p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 touch-target bg-white/5 border border-white/20"
          aria-label="Toggle mobile menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Mobile Menu */}
          <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-blue-900 to-purple-800 shadow-lg border-t border-purple-700 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-lg font-semibold transition-colors duration-300 py-3 px-4 rounded-lg touch-target ${
                    isActive(item.href) 
                      ? 'text-orange-400 bg-orange-400/10' 
                      : 'text-white hover:text-orange-400 hover:bg-white/5 active:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Dark Mode Toggle */}
              <div className="pt-3 border-t border-purple-600">
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-center space-x-3 text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-colors duration-300 font-semibold"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Mobile Authentication */}
              <div className="pt-3 border-t border-purple-600">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-white p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        {isAdmin && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Admin</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 text-center flex items-center justify-center space-x-2 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 text-center font-semibold"
                      >
                        Admin Panel
                      </Link>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 text-center flex items-center justify-center space-x-2 font-semibold"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          </div>
        </>
      )}
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={() => setShowAuthModal(false)}
      />
    </header>
  );
};

export default Header;