import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, MapPin, Calendar, Users, ArrowRight, Play, Award, Shield, Globe } from 'lucide-react';
import { useLocalStorageQuery, initializeSampleData, addNewDestinationsAndServices } from '../hooks/useLocalStorage';
import { formatPrice } from '../utils/priceUtils';
import AdvancedSearchBar from '../components/common/AdvancedSearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LazyImage from '../components/common/LazyImage';
import DestinationDetailsModal from '../components/destinations/DestinationDetailsModal';
import WelcomeMessage from '../components/common/WelcomeMessage';
import { getCustomerData, shouldShowWelcomeMessage, markWelcomeMessageShown, getPersonalizedGreeting } from '../utils/customerTracking';

interface SearchFilters {
  query: string;
  duration: string;
  persons: string;
  budget: string;
  category: string;
}

const Home: React.FC = memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroTitle, setHeroTitle] = useState('');
  const [titleIndex, setTitleIndex] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    duration: '',
    persons: '',
    budget: '',
    category: ''
  });

  // Initialize sample data on component mount
  useEffect(() => {
    initializeSampleData();
  }, []);

  // Function to add new destinations and services
  const handleAddNewData = () => {
    addNewDestinationsAndServices();
    // Refresh the data
    refetchDestinations();
    window.location.reload(); // Simple way to refresh the page
  };

  const { data: destinations, refetch: refetchDestinations } = useLocalStorageQuery('destinations', '*');
  const { data: advertisements, refetch: refetchAds } = useLocalStorageQuery('advertisements', '*');
  const { data: offers, refetch: refetchOffers } = useLocalStorageQuery('offers', '*');
  const { data: gallery, refetch: refetchGallery } = useLocalStorageQuery('gallery', '*');
  const { data: testimonials, refetch: refetchTestimonials } = useLocalStorageQuery('testimonials', '*');

  // Listen for localStorage updates from admin page
  useEffect(() => {
    const handleStorageUpdate = (event: CustomEvent) => {
      const { table, action } = event.detail;
      console.log(`🔄 Home page received update: ${action} on ${table}`);
      
      // Refresh the specific table that was updated
      switch (table) {
        case 'destinations': refetchDestinations(); break;
        case 'advertisements': refetchAds(); break;
        case 'offers': refetchOffers(); break;
        case 'gallery': refetchGallery(); break;
        case 'testimonials': refetchTestimonials(); break;
      }
    };

    window.addEventListener('localStorageUpdate', handleStorageUpdate as EventListener);
    
    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageUpdate as EventListener);
    };
  }, [refetchDestinations, refetchAds, refetchOffers, refetchGallery, refetchTestimonials]);

  const fullTitle = "ಎಲ್ಲಾದರೂ ಇರು ಎಂತಾದರೂ ಇರು ಎಂದೆಂದಿಗೂ ನೀ ಕನ್ನಡವಾಗಿರು";

  // Initialize customer tracking and welcome message
  useEffect(() => {
    const initializeCustomerTracking = () => {
      const customer = getCustomerData();
      setCustomerData(customer);
      
      // Show welcome message if conditions are met
      if (shouldShowWelcomeMessage()) {
        // Delay showing welcome message to allow page to load
        setTimeout(() => {
          setShowWelcomeMessage(true);
        }, 2000);
      }
    };

    initializeCustomerTracking();
  }, []);

  // Memoized callbacks for better performance
  const handleWelcomeMessageClose = useCallback(() => {
    setShowWelcomeMessage(false);
    markWelcomeMessageShown();
  }, []);

  const handleDestinationClick = useCallback((destination: any) => {
    setSelectedDestination(destination);
    setShowDestinationModal(true);
  }, []);

  const handleDestinationModalClose = useCallback(() => {
    setShowDestinationModal(false);
    setSelectedDestination(null);
  }, []);

  // Memoized filtered destinations for better performance
  const filteredDestinations = useMemo(() => {
    return destinations.filter(dest => {
      const matchesQuery = !searchFilters.query || 
        dest.name.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        (dest.description && dest.description.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (dest.category && dest.category.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (dest.tags && dest.tags.toLowerCase().includes(searchFilters.query.toLowerCase()));
      
      const matchesCategory = !searchFilters.category || 
        (dest.category && dest.category.toLowerCase() === searchFilters.category.toLowerCase());
      
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
  }, [destinations, searchFilters]);

  // Typewriter effect for hero title
  useEffect(() => {
    if (titleIndex < fullTitle.length) {
      const timeout = setTimeout(() => {
        setHeroTitle(prev => prev + fullTitle[titleIndex]);
        setTitleIndex(prev => prev + 1);
      }, 120);
      return () => clearTimeout(timeout);
    }
  }, [titleIndex, fullTitle]);

  // Gallery slideshow
  useEffect(() => {
    if (gallery.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % gallery.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [gallery.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % gallery.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + gallery.length) % gallery.length);
  };

  const hasActiveFilters = Object.values(searchFilters).some(value => value !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video 
          className="absolute inset-0 w-full h-full object-cover z-0" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="https://cdn.pixabay.com/video/2017/06/05/9584-220312371_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
        
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-6xl mx-auto py-8 sm:py-12">
          {/* KTDC Official Badge */}
          <div className="mb-6 animate-fade-in">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <Award className="w-6 h-6 text-yellow-400" />
              <span className="text-white font-semibold text-lg">Official KTDC Partner</span>
              <Shield className="w-6 h-6 text-green-400" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 leading-tight mb-4 sm:mb-6 font-poppins kannada-text">
            Discover the Soul of Karnataka
            {titleIndex < fullTitle.length && <span className="border-r-4 border-yellow-400 animate-pulse">|</span>}
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-3 sm:mb-4 animate-fade-in font-poppins animate-slide-up">
            Let us guide you through a world of wonder, your dream escape starts here.
          </h2>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 animate-fade-in delay-200 font-inter px-2">
            Find the best travel deals and explore amazing destinations with personalized search.
          </p>
          
          {/* Advanced Search Bar */}
          <div className="mb-6 sm:mb-8 px-2">
            <AdvancedSearchBar
              placeholder="Search destinations, experiences, adventures..."
              onSearch={setSearchFilters}
              className="max-w-4xl mx-auto"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 animate-fade-in delay-500">
            <Link
              to="/bookings"
              className="btn-primary inline-flex items-center justify-center text-sm sm:text-lg font-poppins px-4 sm:px-6 py-2 sm:py-3 animate-bounce-gentle hover:animate-pulse"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Book Now
            </Link>
            <Link
              to="/destinations"
              className="btn-secondary inline-flex items-center justify-center text-sm sm:text-lg font-poppins bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 px-4 sm:px-6 py-2 sm:py-3 animate-slide-in-right hover:animate-pulse"
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* KTDC Features Section */}
      <section className="py-12 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Tripsera for Karnataka?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience Karnataka with official KTDC services and authentic local experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Award className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Official KTDC Partner</h3>
              <p className="text-gray-600 dark:text-gray-300">Authentic Karnataka tourism experiences with government-approved services</p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Trusted & Secure</h3>
              <p className="text-gray-600 dark:text-gray-300">Safe and reliable booking with 24/7 customer support in Kannada and English</p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Local Expertise</h3>
              <p className="text-gray-600 dark:text-gray-300">Local guides and authentic experiences curated by Karnataka tourism experts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kannada Text Display */}
      <section className="py-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 kannada-text leading-relaxed py-3 animate-fade-in-up">
            ಎಲ್ಲಾದರೂ ಇರು ಎಂತಾದರೂ ಇರು ಎಂದೆಂದಿಗೂ ನೀ ಕನ್ನಡವಾಗಿರು
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 italic">
            "Wherever you are, however you are, forever remain Kannada"
          </p>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center animate-bounce-in">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-1 sm:mb-2 font-poppins">500+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 font-inter">Happy Travelers</div>
            </div>
            <div className="text-center animate-bounce-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-1 sm:mb-2 font-poppins">50+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 font-inter">Destinations</div>
            </div>
            <div className="text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-1 sm:mb-2 font-poppins">3+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 font-inter">Years Experience</div>
            </div>
            <div className="text-center animate-bounce-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-1 sm:mb-2 font-poppins">24/6</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 font-inter">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      {(hasActiveFilters ? filteredDestinations : destinations).length > 0 && (
        <section className="section-padding bg-gradient-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="heading-secondary mb-4">
                {hasActiveFilters ? `Search Results (${filteredDestinations.length})` : 'Featured Destinations'}
              </h2>
              <p className="text-body max-w-3xl mx-auto">
                {hasActiveFilters ? 'Destinations matching your criteria' : 'Discover breathtaking places that will create memories to last a lifetime'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(hasActiveFilters ? filteredDestinations : destinations).slice(0, 6).map((destination, index) => (
                <div 
                  key={destination.id}
                  className="card card-hover group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="image-container h-64">
                    <LazyImage 
                      src={destination.image_url || `https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400`}
                      alt={destination.name}
                      className="image-responsive image-hover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold">4.8</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link
                        to="/bookings"
                        state={{ selectedDestination: destination.name }}
                        className="bg-white text-gray-800 px-6 py-2 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 font-poppins">{destination.name}</h3>
                    {destination.category && (
                      <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 capitalize font-inter">
                        {destination.category}
                      </span>
                    )}
                    <p className="text-gray-600 mb-4 line-clamp-2 font-inter">
                      {destination.description || 'Discover this amazing destination with breathtaking views and unforgettable experiences.'}
                    </p>
                    {destination.tags && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {destination.tags.split(',').slice(0, 3).map((tag: string, index: number) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-500 font-inter">Starting from</span>
                        <div className="text-2xl font-bold text-gradient font-poppins">
                          {formatPrice(destination)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedDestination(destination);
                          setShowDestinationModal(true);
                        }}
                        className="text-orange-500 hover:text-orange-600 font-semibold flex items-center font-inter transition-colors duration-300"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasActiveFilters && filteredDestinations.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No destinations found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search filters</p>
                <button
                  onClick={() => setSearchFilters({ query: '', duration: '', persons: '', budget: '', category: '' })}
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Tripsera?</h2>
            <p className="text-xl text-gray-600">Experience the difference with our personalized travel services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Expert Guidance</h3>
              <p className="text-gray-600">Our experienced travel experts help you plan the perfect trip tailored to your preferences.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Local Knowledge</h3>
              <p className="text-gray-600">Deep local insights and hidden gems that only locals know about.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Best Value</h3>
              <p className="text-gray-600">Competitive prices with no hidden costs and maximum value for your money.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advertisements Section */}
      {advertisements.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Special Announcements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {advertisements.map((ad, index) => (
                <div 
                  key={ad.id} 
                  className="bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <LazyImage 
                    src={ad.image_url} 
                    alt={ad.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{ad.title}</h3>
                  <p className="text-gray-600">{ad.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Offers */}
      {offers.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Best Packages & Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {offers.map((offer, index) => (
                <div 
                  key={offer.id}
                  className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-orange-200"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <LazyImage 
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{offer.title}</h3>
                    <p className="text-gray-600 mb-4">{offer.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        {offer.original_price && offer.original_price > offer.price && (
                          <span className="text-lg text-gray-500 line-through">₹{offer.original_price.toLocaleString()}</span>
                        )}
                        <span className="text-2xl font-bold text-teal-600">₹{offer.price.toLocaleString()}</span>
                        {offer.discount_percentage && (
                          <span className="text-sm text-green-600 font-semibold">
                            {offer.discount_percentage}% OFF
                          </span>
                        )}
                      </div>
                      <Link
                        to="/bookings"
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Slideshow */}
      {gallery.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Travel Gallery</h2>
            <div className="relative max-w-4xl mx-auto">
              <div className="relative h-96 overflow-hidden rounded-2xl shadow-2xl">
                {gallery.map((image, index) => (
                  <div
                    key={image.id}
                    className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                      index === currentSlide ? 'translate-x-0' : 
                      index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                    }`}
                  >
                    <LazyImage 
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-6">
                      <h3 className="text-xl font-semibold">{image.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-white transition-all duration-300 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-white transition-all duration-300 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {gallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">What Our Travelers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <div 
                  key={testimonial.id}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4 text-lg">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-500 font-bold text-lg">
                        {testimonial.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-teal-600 font-semibold">- {testimonial.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Map Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-800">Visit Our Office</h2>
              <p className="text-gray-600 mb-6 text-lg">
                Located in the heart of Kesarhatti, Karnataka, we're here to help you plan your perfect journey. 
                Drop by for personalized travel consultation and expert advice.
              </p>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-orange-500 mr-3" />
                  <span>Kesarhatti, Karnataka, India</span>
                </div>
                <div className="flex items-center">
                  <span className="w-5 h-5 text-orange-500 mr-3">📞</span>
                  <span>+91 8296724981</span>
                </div>
                <div className="flex items-center">
                  <span className="w-5 h-5 text-orange-500 mr-3">✉</span>
                  <span>Tripsera.info@gmail.com</span>
                </div>
              </div>
              
              <div className="mt-8">
                <Link
                  to="/contact"
                  className="inline-flex items-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Get Directions
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
            
            <div className="h-96 rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d4900.789663210272!2d76.49217071156957!3d15.509051154126839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTXCsDMwJzMyLjYiTiA3NsKwMjknNDEuMSJF!5e1!3m2!1sen!2sin!4v1741113847602!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Add New Destinations Button - Temporary */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <button
            onClick={handleAddNewData}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300"
          >
            Add New Destinations & Services
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Click this button to add 5 new Indian destinations and 6 new services to your database
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-xl mb-8 opacity-90">
            Let us help you create memories that will last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/bookings"
              className="inline-flex items-center justify-center bg-white text-orange-500 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Start Planning
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30"
            >
              <Users className="w-5 h-5 mr-2" />
              Talk to Expert
            </Link>
          </div>
        </div>
      </section>

      {/* Destination Details Modal */}
      <DestinationDetailsModal
        destination={selectedDestination}
        isOpen={showDestinationModal}
        onClose={handleDestinationModalClose}
      />

      {/* Welcome Message Modal */}
      <WelcomeMessage
        isOpen={showWelcomeMessage}
        onClose={handleWelcomeMessageClose}
        customerName={customerData?.name || 'Traveler'}
        isNewCustomer={customerData?.isNewCustomer || true}
      />
    </div>
  );
});

Home.displayName = 'Home';

// Export with performance monitoring
export default Home;