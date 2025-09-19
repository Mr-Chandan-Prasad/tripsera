import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, CreditCard, Download, Eye, Search, Filter, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { useLocalStorageQuery, initializeSampleData, cancelBooking, createSampleBookingsForUser } from '../hooks/useLocalStorage';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useFirebaseAuth';
import TicketGenerator from '../components/booking/TicketGenerator';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyBookings: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const { showSuccess, showError, showWarning, showInfo } = useNotificationContext();
  const { user, loading: authLoading } = useAuth();

  // Typing animation state
  const [titleIndex, setTitleIndex] = useState(0);
  const fullTitle = "My Bookings";

  const { data: bookings, loading } = useLocalStorageQuery('bookings', []);
  const { data: destinations } = useLocalStorageQuery('destinations', []);
  const { data: services } = useLocalStorageQuery('services', []);

  // Initialize sample data
  useEffect(() => {
    initializeSampleData();
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (titleIndex < fullTitle.length) {
      const timer = setTimeout(() => {
        setTitleIndex(titleIndex + 1);
      }, 150); // Typing speed
      return () => clearTimeout(timer);
    }
  }, [titleIndex, fullTitle.length]);

  // Filter bookings based on Firebase user authentication
  const customerBookings = user ? bookings.filter(booking => 
    booking.email && booking.email.toLowerCase() === user.email?.toLowerCase()
  ) : [];

  // Apply search and status filters
  const filteredBookings = customerBookings.filter(booking => {
    const matchesSearch = !searchQuery || 
      booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDestinationName(booking.destination_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getServiceName(booking.service_ids || booking.service_id).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getDestinationName = (destinationId: string) => {
    const destination = destinations.find(d => d.id === destinationId);
    return destination ? destination.name : 'Unknown Destination';
  };

  const getServiceName = (serviceIdOrIds: string | string[]) => {
    // Handle both old format (string) and new format (array)
    if (Array.isArray(serviceIdOrIds)) {
      // New format: array of service IDs
      const serviceNames = serviceIdOrIds.map(id => {
        const service = services.find(s => s.id === id);
        return service ? service.name : 'Unknown Service';
      });
      return serviceNames.length > 0 ? serviceNames.join(', ') : 'No Services';
    } else {
      // Old format: single service ID
      const service = services.find(s => s.id === serviceIdOrIds);
      return service ? service.name : 'Unknown Service';
    }
  };

  // Note: Removed automatic sample booking creation
  // Users should only see their actual bookings

  // Show welcome message when user has bookings
  useEffect(() => {
    if (user && customerBookings.length > 0) {
      showSuccess('Welcome Back!', `You have ${customerBookings.length} booking(s) in your account.`, 3000);
    }
  }, [user, customerBookings.length, showSuccess]);

  const handleViewTicket = (booking: any) => {
    setSelectedBooking(booking);
    setShowTicket(true);
  };

  const handleCancelBooking = (booking: any) => {
    setBookingToCancel(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const confirmCancellation = () => {
    if (!bookingToCancel) return;

    const result = cancelBooking(bookingToCancel.id, cancelReason);
    
    if (result.success) {
      showSuccess('Booking Cancelled', 'Your booking has been cancelled successfully.', 4000);
      setShowCancelModal(false);
      setBookingToCancel(null);
      setCancelReason('');
      // Refresh the page to show updated booking status
      window.location.reload();
    } else {
      showError('Cancellation Failed', result.message, 4000);
    }
  };

  const canCancelBooking = (booking: any) => {
    return booking.payment_status === 'pending' || booking.payment_status === 'paid';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">My Bookings</h1>
                <p className="text-gray-600">Please sign in to view your bookings</p>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">You need to be signed in to view your bookings.</p>
                  <a 
                    href="/" 
                    className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Sign In
                  </a>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{' '}
                    <a href="/" className="text-orange-500 hover:text-orange-600 font-semibold">
                      Sign Up
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {fullTitle.substring(0, titleIndex)}
              {titleIndex < fullTitle.length && <span className="border-r-4 border-orange-400 animate-pulse">|</span>}
            </h1>
            <p className="text-gray-600">Welcome back, {user.displayName || user.email}!</p>
            <p className="text-sm text-gray-500 mt-2">Signed in as {user.email}</p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Bookings Found</h3>
            <p className="text-gray-500 mb-4">
              {customerBookings.length === 0 
                ? "You haven't made any bookings yet." 
                : "No bookings match your search criteria."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/bookings"
                className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Book Your First Trip
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBookings.map((booking, index) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {getDestinationName(booking.destination_id)}
                      </h3>
                      <p className="text-gray-600">{getServiceName(booking.service_ids || booking.service_id)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(booking.payment_status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.payment_status)}`}>
                        {booking.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date(booking.booking_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{booking.seats_selected || 1} {(booking.seats_selected || 1) === 1 ? 'Person' : 'People'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">₹{(booking.amount || booking.total_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Booking #{booking.id.slice(-6)}</span>
                    </div>
                    {booking.pickup_location && (
                      <div className="flex items-center space-x-2 text-gray-600 col-span-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Pickup: {booking.pickup_location}</span>
                        {booking.pickup_time && (
                          <span className="text-sm text-gray-500">({booking.pickup_time})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {booking.details && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <strong>Special Requests:</strong> {booking.details}
                      </p>
                    </div>
                  )}

                  {booking.pickup_instructions && (
                    <div className="mb-4">
                      <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                        <strong>Pickup Instructions:</strong> {booking.pickup_instructions}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    {booking.payment_status === 'paid' && (
                      <button
                        onClick={() => handleViewTicket(booking)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Ticket</span>
                      </button>
                    )}
                    
                    {booking.payment_status === 'pending' && (
                      <div className="flex-1 flex items-center justify-center space-x-2 bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span>Payment Pending</span>
                      </div>
                    )}
                    
                    {booking.payment_status === 'cancelled' && (
                      <div className="flex-1 flex items-center justify-center space-x-2 bg-red-100 text-red-800 py-2 px-4 rounded-lg">
                        <XCircle className="w-4 h-4" />
                        <span>Booking Cancelled</span>
                      </div>
                    )}
                    
                    {canCancelBooking(booking) && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        className="flex items-center justify-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleViewTicket(booking)}
                      className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3">
                  <p className="text-xs text-gray-500">
                    Booked on {new Date(booking.created_at || Date.now()).toLocaleDateString()}
                    {booking.transaction_id && ` • Transaction: ${booking.transaction_id}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Generator Modal */}
      {showTicket && selectedBooking && (
        <TicketGenerator
          bookingData={selectedBooking}
          destinationName={getDestinationName(selectedBooking.destination_id)}
          serviceName={getServiceName(selectedBooking.service_ids || selectedBooking.service_id)}
          onClose={() => {
            setShowTicket(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* Cancellation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <XCircle className="w-6 h-6 mr-2 text-red-600" />
                Cancel Booking
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Booking Details:</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm"><strong>Destination:</strong> {getDestinationName(bookingToCancel.destination_id)}</p>
                  <p className="text-sm"><strong>Service:</strong> {getServiceName(bookingToCancel.service_ids || bookingToCancel.service_id)}</p>
                  <p className="text-sm"><strong>Date:</strong> {new Date(bookingToCancel.booking_date).toLocaleDateString()}</p>
                  <p className="text-sm"><strong>Amount:</strong> ₹{(bookingToCancel.amount || bookingToCancel.total_amount || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Please provide a reason for cancelling this booking..."
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Cancelling this booking will free up the seats and make them available for other customers. 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancellation}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;