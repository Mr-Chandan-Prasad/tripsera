import React, { useState } from 'react';
import { X, Star, MapPin, Calendar, Users, DollarSign, Check, X as XIcon, Camera, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DestinationDetailsModalProps {
  destination: any;
  isOpen: boolean;
  onClose: () => void;
}

const DestinationDetailsModal: React.FC<DestinationDetailsModalProps> = ({
  destination,
  isOpen,
  onClose
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !destination) return null;

  // Parse gallery images
  const galleryImages = destination.gallery_images 
    ? destination.gallery_images.split(',').map((img: string) => img.trim()).filter((img: string) => img)
    : [destination.image_url].filter(Boolean);

  // Parse inclusions and exclusions
  const inclusions = destination.inclusions 
    ? destination.inclusions.split(',').map((item: string) => item.trim()).filter((item: string) => item)
    : [];

  const exclusions = destination.exclusions 
    ? destination.exclusions.split(',').map((item: string) => item.trim()).filter((item: string) => item)
    : [];

  // Parse itinerary
  const itinerary = destination.itinerary 
    ? destination.itinerary.split('\n').filter((item: string) => item.trim())
    : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto animate-bounce-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-3xl font-bold text-gray-800 font-poppins">{destination.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          {galleryImages.length > 0 && (
            <div className="mb-8">
              <div className="relative">
                <img
                  src={galleryImages[currentImageIndex]}
                  alt={destination.name}
                  className="w-full h-96 object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800';
                  }}
                />
                
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all duration-300"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all duration-300"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {galleryImages.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {galleryImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === currentImageIndex ? 'border-orange-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${destination.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=200';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 font-poppins">About This Destination</h3>
                <p className="text-gray-600 leading-relaxed font-inter">
                  {destination.description || 'Discover this amazing destination with breathtaking views and unforgettable experiences.'}
                </p>
              </div>

              {/* Itinerary */}
              {itinerary.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 font-poppins">Itinerary</h3>
                  <div className="space-y-4">
                    {itinerary.map((day, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 font-inter">{day}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inclusions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 font-poppins flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      What's Included
                    </h3>
                    <ul className="space-y-2">
                      {inclusions.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2 text-gray-600 font-inter">
                          <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {exclusions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 font-poppins flex items-center">
                      <XIcon className="w-5 h-5 text-red-500 mr-2" />
                      What's Not Included
                    </h3>
                    <ul className="space-y-2">
                      {exclusions.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2 text-gray-600 font-inter">
                          <XIcon className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl p-6 text-white">
                <div className="text-center">
                  <div className="text-sm opacity-90 mb-2 font-inter">Starting from</div>
                  <div className="text-4xl font-bold mb-4 font-poppins">₹{destination.price.toLocaleString()}</div>
                  <div className="text-sm opacity-90 mb-6 font-inter">per person</div>
                  
                  <Link
                    to="/bookings"
                    state={{ selectedDestination: destination.name }}
                    className="block w-full bg-white text-orange-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300 text-center"
                    onClick={onClose}
                  >
                    Book Now
                  </Link>
                </div>
              </div>

              {/* Destination Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 font-poppins">Destination Info</h3>
                
                <div className="space-y-4">
                  {destination.category && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="text-sm text-gray-500 font-inter">Category</div>
                        <div className="font-semibold text-gray-800 font-inter capitalize">{destination.category}</div>
                      </div>
                    </div>
                  )}

                  {destination.rating && (
                    <div className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <div>
                        <div className="text-sm text-gray-500 font-inter">Rating</div>
                        <div className="font-semibold text-gray-800 font-inter">{destination.rating.toFixed(1)}/5.0</div>
                      </div>
                    </div>
                  )}

                  {destination.tags && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2 font-inter">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {destination.tags.split(',').map((tag: string, index: number) => (
                          <span key={index} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-inter">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 font-poppins">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/bookings"
                    state={{ selectedDestination: destination.name }}
                    className="block w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-300 text-center"
                    onClick={onClose}
                  >
                    Book This Destination
                  </Link>
                  <button
                    onClick={onClose}
                    className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-300"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetailsModal;
