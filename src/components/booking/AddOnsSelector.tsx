import React, { useState, useEffect } from 'react';
import { Plus, Minus, Check, X, Star, Info } from 'lucide-react';
import { useLocalStorageQuery, initializeSampleData } from '../../hooks/useLocalStorage';
import { formatPrice, hasPriceRange, getPriceForCalculation } from '../../utils/priceUtils';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  price_range?: {
    min: number;
    max: number;
  };
  category: string;
  image_url?: string;
  is_active: boolean;
  max_quantity: number;
}

interface SelectedAddOn {
  addon: AddOn;
  quantity: number;
  totalPrice: number;
}

interface AddOnsSelectorProps {
  onAddOnsChange: (addons: SelectedAddOn[], totalPrice: number) => void;
  selectedDestination?: string;
  selectedService?: string;
}

const AddOnsSelector: React.FC<AddOnsSelectorProps> = ({
  onAddOnsChange,
  selectedDestination,
  selectedService
}) => {
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Initialize sample data
  useEffect(() => {
    initializeSampleData();
  }, []);

  const { data: addons = [], loading } = useLocalStorageQuery<AddOn[]>('addons', '*');
  const { data: services = [] } = useLocalStorageQuery('services', '*');

  // Check if selected service is a group tour
  const selectedServiceData = services.find(service => service.id === selectedService);
  const isGroupTour = selectedServiceData?.is_group_tour || false;

  // Filter add-ons by category and active status
  const filteredAddOns = addons.filter(addon => {
    const matchesCategory = selectedCategory === 'all' || addon.category === selectedCategory;
    const isActive = addon.is_active;
    
    // Disable car-related add-ons for group tours
    const isCarRelated = addon.category === 'Transportation' && 
                        (addon.name.toLowerCase().includes('car') || 
                         addon.name.toLowerCase().includes('vehicle') ||
                         addon.name.toLowerCase().includes('rental'));
    
    const shouldDisable = isGroupTour && isCarRelated;
    
    return matchesCategory && isActive && !shouldDisable;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(addons.map(addon => addon.category)))];

  // Calculate total price
  const totalAddOnsPrice = selectedAddOns.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);

  // Update parent component when add-ons change
  useEffect(() => {
    onAddOnsChange(selectedAddOns, totalAddOnsPrice);
  }, [selectedAddOns, totalAddOnsPrice, onAddOnsChange]);

  const handleAddOnToggle = (addon: AddOn) => {
    const existingIndex = selectedAddOns.findIndex(item => item.addon.id === addon.id);
    
    if (existingIndex >= 0) {
      // Remove add-on
      const newSelectedAddOns = selectedAddOns.filter((_, index) => index !== existingIndex);
      setSelectedAddOns(newSelectedAddOns);
    } else {
      // Add add-on with quantity 1
      const newSelectedAddOn: SelectedAddOn = {
        addon,
        quantity: 1,
        totalPrice: getPriceForCalculation(addon)
      };
      setSelectedAddOns([...selectedAddOns, newSelectedAddOn]);
    }
  };

  const handleQuantityChange = (addonId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const addon = addons.find(a => a.id === addonId);
    if (!addon) return;

    const updatedAddOns = selectedAddOns.map(item => {
      if (item.addon.id === addonId) {
        const quantity = Math.min(newQuantity, addon.max_quantity);
        return {
          ...item,
          quantity,
          totalPrice: getPriceForCalculation(addon) * quantity
        };
      }
      return item;
    });
    
    setSelectedAddOns(updatedAddOns);
  };

  const isAddOnSelected = (addonId: string) => {
    return selectedAddOns.some(item => item.addon.id === addonId);
  };

  const getSelectedQuantity = (addonId: string) => {
    const selected = selectedAddOns.find(item => item.addon.id === addonId);
    return selected ? selected.quantity : 0;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transportation': return '🚗';
      case 'insurance': return '🛡️';
      case 'photography': return '📸';
      case 'guide': return '🗺️';
      case 'wellness': return '🧘';
      case 'adventure': return '🏔️';
      case 'accommodation': return '🏨';
      case 'culture': return '🎭';
      case 'connectivity': return '📶';
      case 'dining': return '🍽️';
      default: return '✨';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">Loading add-ons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-inter transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All Categories' : (
              <span className="flex items-center space-x-2">
                <span>{getCategoryIcon(category)}</span>
                <span className="capitalize">{category}</span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Group Tour Notification */}
      {isGroupTour && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">🚌</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Group Tour Selected</h4>
              <p className="text-sm text-blue-700">
                Car rental and transportation add-ons are not available for group tours as transportation is already included in your package.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAddOns.map(addon => (
          <div
            key={addon.id}
            className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
              isAddOnSelected(addon.id) ? 'ring-2 ring-orange-500' : ''
            }`}
          >
            {/* Image */}
            <div className="relative h-48">
              <img
                src={addon.image_url || 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={addon.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-sm font-semibold text-gray-800 flex items-center space-x-1">
                  <span>{getCategoryIcon(addon.category)}</span>
                  <span className="capitalize">{addon.category}</span>
                </span>
              </div>

              {/* Selection Indicator */}
              {isAddOnSelected(addon.id) && (
                <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-2">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-800 font-poppins">{addon.name}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-500 font-poppins">
                    {formatPrice(addon)}
                  </div>
                  <div className="text-sm text-gray-500 font-inter">
                    {hasPriceRange(addon) ? 'per item (range)' : 'per item'}
                  </div>
                  {hasPriceRange(addon) && (
                    <div className="text-xs text-gray-400 mt-1">
                      Avg: ₹{Math.round((addon.price_range.min + addon.price_range.max) / 2).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2 font-inter">
                {addon.description}
              </p>

              {/* Quantity Selector */}
              {isAddOnSelected(addon.id) && (
                <div className="flex items-center justify-between mb-4 p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700 font-inter">Quantity:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(addon.id, getSelectedQuantity(addon.id) - 1)}
                      className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-800">
                      {getSelectedQuantity(addon.id)}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(addon.id, getSelectedQuantity(addon.id) + 1)}
                      disabled={getSelectedQuantity(addon.id) >= addon.max_quantity}
                      className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Max Quantity Info */}
              {addon.max_quantity > 1 && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Info className="w-4 h-4 mr-1" />
                  <span>Max {addon.max_quantity} per booking</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleAddOnToggle(addon)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  isAddOnSelected(addon.id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isAddOnSelected(addon.id) ? (
                  <span className="flex items-center justify-center space-x-2">
                    <X className="w-4 h-4" />
                    <span>Remove</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add to Trip</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Add-ons Summary */}
      {selectedAddOns.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 font-poppins">Selected Add-ons</h3>
          <div className="space-y-3">
            {selectedAddOns.map(item => (
              <div key={item.addon.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getCategoryIcon(item.addon.category)}</span>
                  <div>
                    <div className="font-semibold text-gray-800 font-inter">{item.addon.name}</div>
                    <div className="text-sm text-gray-500 font-inter">
                      {item.quantity} × {formatPrice(item.addon)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-500 font-poppins">
                    ₹{item.totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-orange-200 mt-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800 font-inter">Total Add-ons:</span>
              <span className="text-2xl font-bold text-orange-500 font-poppins">
                ₹{totalAddOnsPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {filteredAddOns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No add-ons available</h3>
          <p className="text-gray-500">Check back later for exciting add-on services!</p>
        </div>
      )}
    </div>
  );
};

export default AddOnsSelector;
