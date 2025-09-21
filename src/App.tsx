import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import NotificationContainer from './components/common/NotificationContainer';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './hooks/useFirebaseAuth';
import { useNotification } from './hooks/useNotification';
import { runPerformanceTests } from './utils/performanceTest';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Destinations = lazy(() => import('./pages/Destinations'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Services = lazy(() => import('./pages/Services'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const MyBookings = lazy(() => import('./pages/MyBookings'));

function App() {
  const { notifications, removeNotification } = useNotification();

  useEffect(() => {
    // Initialize localStorage data
    console.log('🚀 Initializing Tripsera application...');
    
    // Run performance tests in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        runPerformanceTests();
      }, 3000);
    }
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600 font-inter">Loading your travel experience...</p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="destinations" element={<Destinations />} />
                  <Route path="services" element={<Services />} />
                  <Route path="gallery" element={<Gallery />} />
                  <Route path="my-bookings" element={<MyBookings />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="*" element={<Home />} />
                </Route>
              </Routes>
            </Suspense>
            
            {/* Global Notification Container */}
            <NotificationContainer
              notifications={notifications}
              onRemoveNotification={removeNotification}
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;