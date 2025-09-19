import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Eye } from 'lucide-react';
import { useLocalStorageQuery, initializeSampleData } from '../hooks/useLocalStorage';
import { formatPrice, hasPriceRange } from '../utils/priceUtils';
import AdvancedSearchBar from '../components/common/AdvancedSearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DestinationDetailsModal from '../components/destinations/DestinationDetailsModal';
import TypingAnimation from '../components/common/TypingAnimation';

interface SearchFilters {
  query: string;
  duration: string;
  persons: string;
  budget: string;
  category: string;
}

const Destinations: React.FC = () => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    duration: '',
    persons: '',
    budget: '',
    category: ''
  });
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  interface Destination {
    id: string | number;
    name: string;
    description?: string;
    category?: string;
    tags?: string;
    price: number;
    image_url?: string;
    rating?: number;
  }
  
  // Initialize sample data
  React.useEffect(() => {
    initializeSampleData();
  }, []);

  const { data: destinations = [], loading, refetch: refetchDestinations } = useLocalStorageQuery<Destination[]>('destinations', '*');

  // Listen for localStorage updates from admin page
  React.useEffect(() => {
    const handleStorageUpdate = (event: CustomEvent) => {
      const { table, action } = event.detail;
      if (table === 'destinations') {
        console.log(`🔄 Destinations page received update: ${action}`);
        refetchDestinations();
      }
    };

    window.addEventListener('localStorageUpdate', handleStorageUpdate as EventListener);
    
    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageUpdate as EventListener);
    };
  }, [refetchDestinations]);

  // Filter destinations based on search filters
  const filteredDestinations = destinations.filter(dest => {
    const matchesQuery = !searchFilters.query || 
      dest.name.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
      (dest.description && dest.description.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
      (dest.category && dest.category.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
      (dest.tags && dest.tags.toLowerCase().includes(searchFilters.query.toLowerCase()));
    
    const matchesCategory = !searchFilters.category || dest.category === searchFilters.category;
    
    const matchesBudget = !searchFilters.budget || (() => {
      const price = dest.price || 0;
      switch (searchFilters.budget) {
        case '0-10000': return price <= 10000;
        case '10000-25000': return price >= 10000 && price <= 25000;
        case '25000-50000': return price >= 25000 && price <= 50000;
        case '50000-100000': return price >= 50000 && price <= 100000;
        case '100000+': return price > 100000;
        default: return true;
      }
    })();

    return matchesQuery && matchesCategory && matchesBudget;
  });

  const hasActiveFilters = Object.values(searchFilters).some(value => value !== '');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-fade-in-up">
            <TypingAnimation text="Explore Destinations" speed={100} />
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover breathtaking destinations that will create memories to last a lifetime
          </p>
          
          {/* Search Bar */}
          <div className="mt-8">
            <AdvancedSearchBar
              placeholder="Search destinations, filter by budget, duration..."
              onSearch={setSearchFilters}
              className="max-w-lg"
            />
          </div>
        </div>

        {filteredDestinations.length === 0 && !hasActiveFilters ? (
          <div className="text-center py-12">
            <MapPin className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Destinations Available</h3>
            <p className="text-gray-500">Check back soon for exciting travel destinations!</p>
          </div>
        ) : filteredDestinations.length === 0 && hasActiveFilters ? (
          <div className="text-center py-12">
            <MapPin className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No destinations found</h3>
            <p className="text-gray-500 mb-4">No destinations match your current filters</p>
            <button
              onClick={() => setSearchFilters({ query: '', duration: '', persons: '', budget: '', category: '' })}
              className="text-orange-500 hover:text-orange-600 font-semibold"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {hasActiveFilters && (
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  Found {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''} matching your filters
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination, index) => (
                <div
                  key={destination.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="relative">
                    <img
                  src={destination.image_url || (destination.gallery_images && destination.gallery_images.split(',')[0]?.trim()) || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400'} // MODIFIED LINE
                  alt={destination.name}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = 'https://www.pexels.com/photo/selective-focus-photography-of-a-red-rose-593655/';
                  }}
                />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold">{destination.rating ? destination.rating.toFixed(1) : 'N/A'}</span> {/* MODIFIED LINE */}
                </div>
              </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{destination.name}</h3>
                    {destination.category && (
                      <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full mb-2 capitalize">
                        {destination.category}
                      </span>
                    )}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {destination.description || 'Discover this amazing destination with breathtaking views and unforgettable experiences.'}
                    </p>
                    {destination.tags && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {destination.tags.split(',').slice(0, 4).map((tag: string, index: number) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-500">
                            {hasPriceRange(destination) ? 'Price Range' : 'Starting from'}
                          </span>
                          <div className="text-lg font-bold text-teal-600">
                            {formatPrice(destination)}
                          </div>
                          {hasPriceRange(destination) && (
                            <div className="text-xs text-gray-500 mt-1">
                              Average: ₹{Math.round((destination.price_range.min + destination.price_range.max) / 2).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setSelectedDestination(destination);
                            setShowDestinationModal(true);
                          }}
                          className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                        <Link
                          to="/bookings"
                          state={{ selectedDestination: destination.name }}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-center"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="text-center mt-12">
          <Link
            to="/bookings"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Plan Your Custom Trip
          </Link>
        </div>
      </div>

      {/* Destination Details Modal */}
      <DestinationDetailsModal
        destination={selectedDestination}
        isOpen={showDestinationModal}
        onClose={() => {
          setShowDestinationModal(false);
          setSelectedDestination(null);
        }}
      />
    </div>
  );
};

export default Destinations;