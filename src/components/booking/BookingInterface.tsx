import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, CreditCard, Upload, Download, Eye, Check, X, Gift, Home, Image } from 'lucide-react';
import { useLocalStorageQuery, useLocalStorageMutation, initializeSampleData, checkAvailability, updateBookingCount, removeBookingCount, getAvailabilityStatus, getServicesForDestination, getGroupTourPredefinedDates, getDestinationGroupTourDates } from '../../hooks/useLocalStorage';
import { formatPrice, hasPriceRange, getPriceForCalculation } from '../../utils/priceUtils';
import { useNotificationContext } from '../../contexts/NotificationContext';
import PaymentProcessor from './PaymentProcessor';
import TicketGenerator from './TicketGenerator';
import AddOnsSelector from './AddOnsSelector';
import ImageUploader from '../common/ImageUploader';
import LoadingSpinner from '../common/LoadingSpinner';
import WelcomeMessage from '../common/WelcomeMessage';
import TypingAnimation from '../common/TypingAnimation';
import { updateCustomerData, markCustomerAsBooked } from '../../utils/customerTracking';
import { useAuth } from '../../hooks/useFirebaseAuth';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
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

interface BookingData {
  id?: string;
  customer_name: string;
  email: string;
  mobile: string;
  address: string;
  destination_id: string;
  service_ids: string[]; // Changed from service_id to service_ids array
  booking_date: string;
  details: string;
  seats_selected: number;
  total_amount: number;
  addons_total: number;
  base_amount: number;
  payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
  payment_method?: string;
  transaction_id?: string;
  customer_image_url?: string;
  payment_proof_url?: string;
  pickup_location?: string;
  pickup_time?: string;
  pickup_instructions?: string;
}

interface BookingInterfaceProps {
  preSelectedDestination?: string;
  preSelectedService?: string;
}

const BookingInterface: React.FC<BookingInterfaceProps> = ({
  preSelectedDestination,
  preSelectedService
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    customer_name: '',
    email: '',
    mobile: '',
    address: '',
    destination_id: '',
    service_ids: [], // Changed from service_id to service_ids array
    booking_date: '',
    details: '',
    seats_selected: 1,
    total_amount: 0,
    addons_total: 0,
    base_amount: 0,
    payment_status: 'pending',
    pickup_location: '',
    pickup_time: '',
    pickup_instructions: ''
  });
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPayment, setShowPayment] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const { showSuccess, showError, showWarning } = useNotificationContext();

  // Initialize sample data
  useEffect(() => {
    initializeSampleData();
  }, []);

  // Auto-fill user information when logged in
  useEffect(() => {
    if (user?.email) {
      setBookingData(prev => ({
        ...prev,
        email: user.email || '',
        customer_name: user.displayName || prev.customer_name
      }));
    }
  }, [user]);

  const { data: destinations } = useLocalStorageQuery('destinations', '*');
  const { data: allServices } = useLocalStorageQuery('services', '*');
  const { insert, update, loading } = useLocalStorageMutation();

  // Filter services based on selected destination using admin-set compatibility
  const services = bookingData.destination_id 
    ? getServicesForDestination(bookingData.destination_id)
    : allServices;
    

  // Set pre-selected values
  useEffect(() => {
    if (preSelectedDestination) {
      const destination = destinations.find(d => d.name === preSelectedDestination);
      if (destination) {
        setBookingData(prev => ({ ...prev, destination_id: destination.id }));
      }
    }
    if (preSelectedService) {
      const service = allServices.find(s => s.name === preSelectedService);
      if (service) {
        setBookingData(prev => ({ ...prev, service_ids: [service.id] }));
      }
    }
  }, [preSelectedDestination, preSelectedService, destinations, allServices]);

  // Reset service selection when destination changes and services become incompatible
  useEffect(() => {
    if (bookingData.destination_id && bookingData.service_ids.length > 0) {
      const filteredServices = getServicesForDestination(bookingData.destination_id);
      const availableServiceIds = filteredServices.map(s => s.id);
      const incompatibleServices = bookingData.service_ids.filter(serviceId => !availableServiceIds.includes(serviceId));
      
      if (incompatibleServices.length > 0) {
        const incompatibleServiceNames = incompatibleServices.map(id => allServices.find(s => s.id === id)?.name).filter(Boolean);
        setBookingData(prev => ({ 
          ...prev, 
          service_ids: prev.service_ids.filter(id => availableServiceIds.includes(id))
        }));
        showWarning('Services Unavailable', `The following services are not available for this destination: ${incompatibleServiceNames.join(', ')}. They have been removed from your selection.`, 5000);
      }
    }
  }, [bookingData.destination_id, bookingData.service_ids, allServices, showWarning]);

  // Calculate total amount
  useEffect(() => {
    const destination = destinations.find(d => d.id === bookingData.destination_id);
    const selectedServices = services.filter(s => bookingData.service_ids.includes(s.id));
    
    // Ensure prices are numbers, not strings
    const destPrice = getPriceForCalculation(destination) || 0;
    const servicesTotal = selectedServices.reduce((sum, service) => sum + (getPriceForCalculation(service) || 0), 0);
    
    const baseTotal = (destPrice + servicesTotal) * bookingData.seats_selected;
    const addonsTotal = selectedAddOns.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
    const grandTotal = baseTotal + addonsTotal;
    
    setBookingData(prev => ({ 
      ...prev, 
      total_amount: grandTotal, // This should be the grand total
      addons_total: addonsTotal,
      base_amount: baseTotal // Store base amount separately
    }));
  }, [bookingData.destination_id, bookingData.service_ids, bookingData.seats_selected, selectedAddOns, destinations, services]);

  const handleAddOnsChange = (addons: SelectedAddOn[], totalPrice: number) => {
    setSelectedAddOns(addons);
  };

  const handleBookingComplete = () => {
    // Close the ticket immediately
    setShowTicket(false);
    setBookingConfirmed(false);
    
    // Show success message and redirect to home after a short delay
    setTimeout(() => {
      navigate('/'); // Always redirect to home page
    }, 1000); // 1 second delay to show success message
  };

  const handleRedirectToHome = () => {
    navigate('/');
  };

  const handleRedirectToGallery = () => {
    navigate('/gallery');
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!bookingData.customer_name || bookingData.customer_name.length < 2) {
        newErrors.customer_name = 'Name must be at least 2 characters';
      }
      if (!bookingData.email || !/\S+@\S+\.\S+/.test(bookingData.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (!bookingData.mobile || bookingData.mobile.length < 10) {
        newErrors.mobile = 'Mobile number must be at least 10 digits';
      }
      if (!bookingData.address || bookingData.address.length < 10) {
        newErrors.address = 'Address must be at least 10 characters';
      }
    }

    if (step === 2) {
      if (!bookingData.destination_id) {
        newErrors.destination_id = 'Please select a destination';
      } else {
        // Check destination availability
        const destAvailability = checkAvailability(bookingData.destination_id, 'destinations', bookingData.seats_selected);
        if (!destAvailability.available) {
          newErrors.destination_id = destAvailability.message;
        }
      }
      
      if (!bookingData.service_ids || bookingData.service_ids.length === 0) {
        newErrors.service_ids = 'Please select at least one service';
      } else {
        // Check service availability for each selected service
        for (const serviceId of bookingData.service_ids) {
          const serviceAvailability = checkAvailability(serviceId, 'services', bookingData.seats_selected);
          if (!serviceAvailability.available) {
            newErrors.service_ids = `Service "${services.find(s => s.id === serviceId)?.name}" is not available: ${serviceAvailability.message}`;
            break;
          }
        }
      }
      
      if (!bookingData.booking_date) {
        newErrors.booking_date = 'Please select a date';
      }
      if (bookingData.seats_selected < 1) {
        newErrors.seats_selected = 'At least 1 seat must be selected';
      }
      if (!bookingData.pickup_location) {
        newErrors.pickup_location = 'Please select a pickup location';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleBookingSubmit = async () => {
    if (!validateStep(2)) {
      return;
    }

    try {
      console.log('=== BOOKING SUBMISSION DEBUG ===');
      console.log('Booking data being submitted:', bookingData);
      console.log('User email:', user?.email);
      console.log('Booking email:', bookingData.email);
      
      const result = await insert('bookings', bookingData);
      console.log('Booking created with result:', result);
      setBookingData(prev => ({ ...prev, id: result.id }));
      
      // Verify the booking was saved
      const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      console.log('All bookings after save:', savedBookings);
      console.log('Latest booking:', savedBookings[savedBookings.length - 1]);
      
      // Update booking counts for destination and services
      updateBookingCount(bookingData.destination_id, 'destinations', bookingData.seats_selected);
      bookingData.service_ids.forEach(serviceId => {
        updateBookingCount(serviceId, 'services', bookingData.seats_selected);
      });
      
      setShowPayment(true);
    } catch (error) {
      console.error('Booking submission error:', error);
      showError(
        'Booking Failed',
        'Failed to submit booking. Please try again.',
        5000
      );
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      console.log('=== PAYMENT SUCCESS DEBUG ===');
      console.log('Payment data:', paymentData);
      console.log('Booking ID:', bookingData.id);
      console.log('Booking email:', bookingData.email);
      
      // Only proceed if payment is actually validated
      if (!paymentData.paymentValidated) {
        showError(
          'Payment Failed',
          'Payment validation failed. Please try again.',
          5000
        );
        return;
      }
      
      const updateData = {
        payment_status: 'paid',
        payment_method: paymentData.method,
        transaction_id: paymentData.transactionId,
        payment_proof_url: paymentData.paymentProof,
        total_amount: bookingData.total_amount,
        seats_selected: bookingData.seats_selected,
        customer_name: bookingData.customer_name,
        email: bookingData.email,
        mobile: bookingData.mobile,
        address: bookingData.address,
        destination_id: bookingData.destination_id,
        service_ids: bookingData.service_ids,
        booking_date: bookingData.booking_date,
        details: bookingData.details
      };
      
      console.log('Updating booking with data:', updateData);
      await update('bookings', bookingData.id!, updateData);
      
      // Verify the update worked
      const updatedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updatedBooking = updatedBookings.find((b: any) => b.id === bookingData.id);
      console.log('Updated booking:', updatedBooking);
      
      setBookingData(prev => ({ 
        ...prev, 
        payment_status: 'paid',
        payment_method: paymentData.method,
        transaction_id: paymentData.transactionId,
        total_amount: bookingData.total_amount,
        seats_selected: bookingData.seats_selected
      }));
      
      setShowPayment(false);
      setBookingConfirmed(true);
      
      // Update customer tracking
      updateCustomerData({
        name: bookingData.customer_name,
        email: bookingData.email
      });
      markCustomerAsBooked();
      
      // Only show ticket if payment is confirmed as paid
      if (paymentData.paymentValidated) {
        setShowTicket(true);
        // Show welcome message after successful booking
        setTimeout(() => {
          setShowWelcomeMessage(true);
        }, 3000);
      }
    } catch (error) {
      console.error('Payment update error:', error);
      showError(
        'Payment Processing Failed',
        'Failed to process payment. Please contact support.',
        5000
      );
    }
  };

  const getDestinationName = (id: string) => {
    return destinations.find(d => d.id === id)?.name || 'Unknown';
  };

  const getServiceName = (id: string) => {
    return services.find(s => s.id === id)?.name || 'Unknown';
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            currentStep >= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {bookingConfirmed && step === 4 ? <Check className="w-5 h-5" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-orange-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={bookingData.customer_name}
            onChange={(e) => setBookingData(prev => ({ ...prev, customer_name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
          {errors.customer_name && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={bookingData.email}
            onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number *
          </label>
          <input
            type="tel"
            value={bookingData.mobile}
            onChange={(e) => setBookingData(prev => ({ ...prev, mobile: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="+91 1234567890"
          />
          {errors.mobile && (
            <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo (Optional)
          </label>
          <ImageUploader
            onImageUpload={(imageUrl) => setBookingData(prev => ({ ...prev, customer_image_url: imageUrl }))}
            maxSize={20}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <textarea
          value={bookingData.address}
          onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Enter your complete address"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
        )}
      </div>
    </div>
  );

  const renderAddOnsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 font-poppins">Enhance Your Trip</h3>
        <p className="text-gray-600 font-inter">Add extra services and experiences to make your journey unforgettable</p>
      </div>
      
      <AddOnsSelector
        onAddOnsChange={handleAddOnsChange}
        selectedDestination={getDestinationName(bookingData.destination_id)}
        selectedService={bookingData.service_ids[0] || ''}
      />
      
      {selectedAddOns.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4 font-poppins">Selected Add-ons Summary</h4>
          <div className="space-y-2">
            {selectedAddOns.map(item => (
              <div key={item.addon.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🎁</span>
                  <div>
                    <div className="font-semibold text-gray-800 font-inter">{item.addon.name}</div>
                    <div className="text-sm text-gray-500 font-inter">
                      {item.quantity} × ₹{item.addon.price.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="font-bold text-orange-500 font-poppins">
                  ₹{item.totalPrice.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-orange-200 mt-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800 font-inter">Total Add-ons:</span>
              <span className="text-2xl font-bold text-orange-500 font-poppins">
                ₹{bookingData.addons_total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Booking Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination *
          </label>
          <select
            value={bookingData.destination_id}
            onChange={(e) => setBookingData(prev => ({ ...prev, destination_id: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select Destination</option>
            {destinations.map((dest) => {
              const availability = getAvailabilityStatus(dest.id, 'destinations');
              const statusText = availability.status === 'available' ? `${availability.remainingCapacity} seats` :
                                availability.status === 'limited' ? `Only ${availability.remainingCapacity} left!` :
                                availability.status === 'full' ? 'Fully Booked' : 'Unavailable';
              return (
                <option key={dest.id} value={dest.id} disabled={!dest.is_available}>
                  {dest.name} (₹{dest.price.toLocaleString()}) - {statusText}
                </option>
              );
            })}
          </select>
          {bookingData.destination_id && (
            <div className="mt-2">
              {(() => {
                const availability = getAvailabilityStatus(bookingData.destination_id, 'destinations');
                return (
                  <div className={`text-sm px-3 py-2 rounded-lg ${
                    availability.status === 'available' ? 'bg-green-100 text-green-800' :
                    availability.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                    availability.status === 'full' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>
                        {availability.status === 'available' && `✅ ${availability.remainingCapacity} seats available`}
                        {availability.status === 'limited' && `⚠️ Only ${availability.remainingCapacity} seats left!`}
                        {availability.status === 'full' && '❌ Fully booked'}
                        {availability.status === 'unavailable' && '🚫 Currently unavailable'}
                      </span>
                      <span className="text-xs">
                        {availability.percentage}% booked
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          {errors.destination_id && (
            <p className="text-red-500 text-sm mt-1">{errors.destination_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services * (Select one or more)
          </label>
          <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {services.map((service) => {
              const availability = getAvailabilityStatus(service.id, 'services');
              const isSelected = bookingData.service_ids.includes(service.id);
              const isDisabled = !service.is_available || availability.status === 'full';
              
              return (
                <label key={service.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-200 hover:bg-gray-50'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (isDisabled) return;
                      const newServiceIds = e.target.checked
                        ? [...bookingData.service_ids, service.id]
                        : bookingData.service_ids.filter(id => id !== service.id);
                      setBookingData(prev => ({ ...prev, service_ids: newServiceIds }));
                    }}
                    disabled={isDisabled}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{service.name}</span>
                      <span className="text-orange-600 font-semibold">{formatPrice(service)}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {service.description && service.description.substring(0, 100)}
                      {service.description && service.description.length > 100 && '...'}
                    </div>
                    <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${
                      availability.status === 'available' ? 'bg-green-100 text-green-800' :
                      availability.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                      availability.status === 'full' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {availability.status === 'available' && `✅ ${availability.remainingCapacity} slots available`}
                      {availability.status === 'limited' && `⚠️ Only ${availability.remainingCapacity} slots left!`}
                      {availability.status === 'full' && '❌ Fully booked'}
                      {availability.status === 'unavailable' && '🚫 Currently unavailable'}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          
          {bookingData.service_ids.length > 0 && (
            <div className="mt-3">
              <div className="text-sm text-gray-600 mb-2">Selected Services:</div>
              <div className="flex flex-wrap gap-2">
                {bookingData.service_ids.map(serviceId => {
                  const service = services.find(s => s.id === serviceId);
                  return service ? (
                    <span key={serviceId} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                      {service.name}
                      <button
                        type="button"
                        onClick={() => setBookingData(prev => ({ 
                          ...prev, 
                          service_ids: prev.service_ids.filter(id => id !== serviceId) 
                        }))}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          {errors.service_ids && (
            <p className="text-red-500 text-sm mt-1">{errors.service_ids}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {(() => {
              const selectedService = services.find(s => s.id === bookingData.service_ids[0]);
              return selectedService?.is_group_tour ? 'Select Tour Date *' : 'Travel Date *';
            })()}
          </label>
          
          
          {(() => {
            const selectedService = services.find(s => s.id === bookingData.service_ids[0]);
            
            
            if (selectedService?.is_group_tour) {
              // Show predefined dates for Group Tours - check service first, then destination
              let predefinedDates = selectedService.predefined_dates || [];
              
              // If no service dates, try destination dates
              if (predefinedDates.length === 0) {
                predefinedDates = getDestinationGroupTourDates(bookingData.destination_id);
              }
              
              
              if (predefinedDates.length === 0) {
                return (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    No predefined dates available for this destination. Please contact admin to set tour dates.
                  </div>
                );
              }
              
              return (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">
                    📅 <strong>Group Tour Dates:</strong> Select from available tour dates below
                  </p>
                  {predefinedDates.map((date: any) => (
                    <label key={date.id} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="predefined_date"
                        value={`${date.date}|${date.time}`}
                        checked={bookingData.booking_date === `${date.date}|${date.time}`}
                        onChange={(e) => setBookingData(prev => ({ ...prev, booking_date: e.target.value }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">
                              {new Date(date.date).toLocaleDateString()} at {date.time}
                            </p>
                            <p className="text-sm text-gray-600">{date.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {date.available_slots - date.booked_slots} slots available
                            </span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              );
            } else {
              // Show regular date picker for other services
              
              return (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    📅 <strong>Flexible Dates:</strong> Choose any date that works for you
                  </p>
                  <input
                    type="date"
                    value={bookingData.booking_date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, booking_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              );
            }
          })()}
          
          {errors.booking_date && (
            <p className="text-red-500 text-sm mt-1">{errors.booking_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Travelers *
          </label>
          <select
            value={bookingData.seats_selected}
            onChange={(e) => setBookingData(prev => ({ ...prev, seats_selected: parseInt(e.target.value) }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
            ))}
          </select>
          {errors.seats_selected && (
            <p className="text-red-500 text-sm mt-1">{errors.seats_selected}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests
        </label>
        <textarea
          value={bookingData.details}
          onChange={(e) => setBookingData(prev => ({ ...prev, details: e.target.value }))}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Any special requests or additional information..."
        />
      </div>

      {/* Pickup Location Section */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-orange-500" />
          Pickup Location Details
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location *
            </label>
            <select
              value={bookingData.pickup_location || ''}
              onChange={(e) => setBookingData(prev => ({ ...prev, pickup_location: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select Pickup Location</option>
              <option value="Airport">Airport</option>
              <option value="Railway Station">Railway Station</option>
              <option value="Bus Stand">Bus Stand</option>
              <option value="Hotel">Hotel</option>
              <option value="Home Address">Home Address</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
            {errors.pickup_location && (
              <p className="text-red-500 text-sm mt-1">{errors.pickup_location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Pickup Time
            </label>
            <select
              value={bookingData.pickup_time || ''}
              onChange={(e) => setBookingData(prev => ({ ...prev, pickup_time: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select Time</option>
              <option value="Early Morning (5:00 AM - 7:00 AM)">Early Morning (5:00 AM - 7:00 AM)</option>
              <option value="Morning (7:00 AM - 10:00 AM)">Morning (7:00 AM - 10:00 AM)</option>
              <option value="Late Morning (10:00 AM - 12:00 PM)">Late Morning (10:00 AM - 12:00 PM)</option>
              <option value="Afternoon (12:00 PM - 3:00 PM)">Afternoon (12:00 PM - 3:00 PM)</option>
              <option value="Late Afternoon (3:00 PM - 6:00 PM)">Late Afternoon (3:00 PM - 6:00 PM)</option>
              <option value="Evening (6:00 PM - 9:00 PM)">Evening (6:00 PM - 9:00 PM)</option>
              <option value="Night (9:00 PM - 11:00 PM)">Night (9:00 PM - 11:00 PM)</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Instructions
          </label>
          <textarea
            value={bookingData.pickup_instructions || ''}
            onChange={(e) => setBookingData(prev => ({ ...prev, pickup_instructions: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Any specific instructions for pickup (landmarks, contact person, etc.)..."
          />
        </div>
      </div>
    </div>
  );

  const renderBookingSummary = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Booking Summary</h3>
      
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700">Customer Details</h4>
            <p className="text-gray-600">{bookingData.customer_name}</p>
            <p className="text-gray-600">{bookingData.email}</p>
            <p className="text-gray-600">{bookingData.mobile}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700">Travel Details</h4>
            <p className="text-gray-600">
              <MapPin className="w-4 h-4 inline mr-1" />
              {getDestinationName(bookingData.destination_id)}
            </p>
            <p className="text-gray-600">
              <Calendar className="w-4 h-4 inline mr-1" />
              {(() => {
                const selectedService = services.find(s => s.id === bookingData.service_ids[0]);
                if (selectedService?.is_group_tour && bookingData.booking_date.includes('|')) {
                  const [date, time] = bookingData.booking_date.split('|');
                  return `${new Date(date).toLocaleDateString()} at ${time}`;
                }
                return bookingData.booking_date;
              })()}
            </p>
            <p className="text-gray-600">
              <Users className="w-4 h-4 inline mr-1" />
              {bookingData.seats_selected} {bookingData.seats_selected === 1 ? 'Person' : 'People'}
            </p>
            {bookingData.pickup_location && (
              <p className="text-gray-600">
                <MapPin className="w-4 h-4 inline mr-1" />
                Pickup: {bookingData.pickup_location}
              </p>
            )}
            {bookingData.pickup_time && (
              <p className="text-gray-600">
                <Calendar className="w-4 h-4 inline mr-1" />
                Time: {bookingData.pickup_time}
              </p>
            )}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="space-y-2">
            {/* Destination Price */}
            {(() => {
              const destination = destinations.find(d => d.id === bookingData.destination_id);
              if (destination) {
                return (
                  <div className="flex justify-between items-center">
                    <span>Destination ({destination.name}):</span>
                    <span className="text-gray-600">₹{getPriceForCalculation(destination).toLocaleString()}</span>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* Services Prices */}
            {bookingData.service_ids.map(serviceId => {
              const service = services.find(s => s.id === serviceId);
              if (service) {
                return (
                  <div key={serviceId} className="flex justify-between items-center">
                    <span>Service ({service.name}):</span>
                    <span className="text-gray-600">₹{getPriceForCalculation(service).toLocaleString()}</span>
                  </div>
                );
              }
              return null;
            })}
            
            {/* Seats Multiplier */}
            {bookingData.seats_selected > 1 && (
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>× {bookingData.seats_selected} travelers:</span>
                <span>₹{bookingData.base_amount.toLocaleString()}</span>
              </div>
            )}
            {selectedAddOns.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span>Add-ons:</span>
                  <span className="text-gray-600">₹{bookingData.addons_total.toLocaleString()}</span>
                </div>
                {selectedAddOns.map(item => (
                  <div key={item.addon.id} className="flex justify-between items-center text-sm text-gray-500 ml-4">
                    <span>• {item.addon.name} ({item.quantity}×)</span>
                    <span>₹{item.totalPrice.toLocaleString()}</span>
                  </div>
                ))}
              </>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-teal-600">₹{bookingData.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pickup Instructions */}
        {bookingData.pickup_instructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Pickup Instructions</h4>
            <p className="text-blue-700 text-sm">{bookingData.pickup_instructions}</p>
          </div>
        )}
      </div>
    </div>
  );

  if (showTicket && bookingConfirmed) {
    return (
      <TicketGenerator
        bookingData={bookingData}
        destinationName={getDestinationName(bookingData.destination_id)}
        serviceName={bookingData.service_ids.map(id => getServiceName(id)).join(', ')}
        selectedAddOns={selectedAddOns}
        onClose={handleBookingComplete}
        onNavigateToHome={handleRedirectToHome}
        onNavigateToGallery={handleRedirectToGallery}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in-up">
              <TypingAnimation text="Secure Booking System" speed={100} />
            </h1>
            <p className="text-xl text-gray-600">Complete your travel booking in 3 easy steps</p>
          </div>

          {renderStepIndicator()}

          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {currentStep === 1 && renderPersonalInfo()}
            {currentStep === 2 && renderBookingDetails()}
            {currentStep === 3 && renderAddOnsStep()}
            {currentStep === 4 && renderBookingSummary()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
              )}
              
              <div className="ml-auto">
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleBookingSubmit}
                    disabled={loading}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : <CreditCard className="w-5 h-5" />}
                    <span>Proceed to Payment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentProcessor
          bookingData={bookingData}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}

      {/* Welcome Message for New Customers */}
      <WelcomeMessage
        isOpen={showWelcomeMessage}
        onClose={() => setShowWelcomeMessage(false)}
        customerName={bookingData.customer_name || 'Traveler'}
        isNewCustomer={true}
      />
    </div>
  );
};

export default BookingInterface;