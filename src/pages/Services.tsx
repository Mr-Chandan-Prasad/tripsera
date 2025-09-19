import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Star } from 'lucide-react';
import { useLocalStorageQuery, initializeSampleData } from '../hooks/useLocalStorage';
import { formatPrice, hasPriceRange } from '../utils/priceUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TypingAnimation from '../components/common/TypingAnimation';

const Services: React.FC = () => {
  // Initialize sample data
  React.useEffect(() => {
    initializeSampleData();
  }, []);

  const { data: services, loading, refetch: refetchServices } = useLocalStorageQuery('services', '*');

  // Listen for localStorage updates from admin page
  React.useEffect(() => {
    const handleStorageUpdate = (event: CustomEvent) => {
      const { table, action } = event.detail;
      if (table === 'services') {
        console.log(`🔄 Services page received update: ${action}`);
        refetchServices();
      }
    };

    window.addEventListener('localStorageUpdate', handleStorageUpdate as EventListener);
    
    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageUpdate as EventListener);
    };
  }, [refetchServices]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-fade-in-up">
            <TypingAnimation text="Our Services" speed={100} />
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive travel services to make your journey seamless and memorable
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Services Available</h3>
            <p className="text-gray-500">Check back soon for our travel services!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative">
                  <img
                    src={service.image_url || 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={service.name}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold">4.9</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {service.description || 'Professional travel service with excellent customer support and quality assurance.'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">
                        {hasPriceRange(service) ? 'Price Range' : 'Starting from'}
                      </span>
                      <div className="text-lg font-bold text-teal-600">
                        {formatPrice(service)}
                      </div>
                      {hasPriceRange(service) && (
                        <div className="text-xs text-gray-500 mt-1">
                          Average: ₹{Math.round((service.price_range.min + service.price_range.max) / 2).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to="/bookings"
                      state={{ selectedService: service.name }}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/bookings"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Get Custom Service Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;