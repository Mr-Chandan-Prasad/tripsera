import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  MapPin,
  Settings,
  CreditCard,
  Image,
  MessageSquare,
  Star,
  Gift,
  Mail,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  Save,
  X,
  Upload,
  Eye,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Database
} from 'lucide-react';
import TypingAnimation from '../components/common/TypingAnimation';
import { useMySQL } from '../hooks/useMySQL';
import { useLocalStorageQuery, useLocalStorageMutation, initializeSampleData, getAvailabilityStatus, updateBookingCount, removeBookingCount, cancelBooking, resetAllBookingCounts, getServicesForDestination, updateServiceDestinationCompatibility, updateGroupTourPredefinedDates, getGroupTourPredefinedDates, getDestinationGroupTourDates, updateDestinationGroupTourDates, refreshDestinationsWithGroupTourDates } from '../hooks/useLocalStorage';
import { useNotificationContext } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PaymentHistory from '../components/payment/PaymentHistory';
import AddOnsManager from '../components/admin/AddOnsManager';
import FirebaseMigration from '../components/admin/FirebaseMigration';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import FirebaseTest from '../components/FirebaseTest';

const Admin: React.FC = () => {
  const { showSuccess, showError, showWarning } = useNotificationContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPickupInstructions, setSelectedPickupInstructions] = useState<string | null>(null);
  const [exportFilter, setExportFilter] = useState('all');
  const [qrCodeData, setQrCodeData] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Initialize sample data on component mount
  useEffect(() => {
    initializeSampleData();
  }, []);

  // Load existing QR code data from localStorage
  useEffect(() => {
    const savedQrCode = localStorage.getItem('paymentQrCodeData');
    if (savedQrCode) {
      setQrCodeData(savedQrCode);
    }
  }, []);


  // Data hooks
  const { data: bookings, refetch: refetchBookings } = useLocalStorageQuery('bookings', '*');
  const { data: destinations, refetch: refetchDestinations } = useLocalStorageQuery('destinations', '*');
  const { data: services, refetch: refetchServices } = useLocalStorageQuery('services', '*');
  const { data: gallery, refetch: refetchGallery } = useLocalStorageQuery('gallery', '*');
  const { data: testimonials, refetch: refetchTestimonials } = useLocalStorageQuery('testimonials', '*');
  const { data: advertisements, refetch: refetchAds } = useLocalStorageQuery('advertisements', '*');
  const { data: offers, refetch: refetchOffers } = useLocalStorageQuery('offers', '*');
  const { data: inquiries, refetch: refetchInquiries } = useLocalStorageQuery('inquiries', '*');
  const { data: siteSettings, refetch: refetchSiteSettings } = useLocalStorageQuery('site_settings', '*');

  const { insert, update, remove, loading: mutationLoading } = useLocalStorageMutation();


  // Load QR code data
  useEffect(() => {
    const savedQrCode = localStorage.getItem('paymentQrCodeData') || '';
    setQrCodeData(savedQrCode);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'bookings', label: 'Bookings', icon: Users },
    { id: 'availability', label: 'Availability', icon: Calendar },
    { id: 'coordination', label: 'Service Coordination', icon: Settings },
    { id: 'group-tour-dates', label: 'Group Tour Dates', icon: Calendar },
    { id: 'firebase-migration', label: 'Firebase Migration', icon: Database },
    { id: 'firebase-test', label: 'Firebase Test', icon: Database },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'addons', label: 'Add-Ons', icon: Gift },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'advertisements', label: 'Ads', icon: Star },
    { id: 'offers', label: 'Offers', icon: Gift },
    { id: 'inquiries', label: 'Inquiries', icon: Mail },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'qr-settings', label: 'QR Settings', icon: Settings },
  ];

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.payment_status === 'pending').length,
    paidBookings: bookings.filter(b => b.payment_status === 'paid').length,
    totalTravelers: bookings.reduce((sum, b) => sum + (parseInt(b.seats_selected) || 1), 0),
    totalRevenue: bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (parseFloat(b.amount || b.total_amount) || 0), 0),
    totalDestinations: destinations.length,
    totalServices: services.length,
    totalInquiries: inquiries.length,
  };

  // Debug logging for amount data
  console.log('Admin - All bookings:', bookings);
  console.log('Admin - Bookings with amounts:', bookings.map(b => ({ id: b.id, amount: b.amount, total_amount: b.total_amount })));
  console.log('Admin - Total revenue:', stats.totalRevenue);

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

  const toggleAvailability = async (itemId: string, itemType: 'destinations' | 'services') => {
    try {
      const items = JSON.parse(localStorage.getItem(itemType) || '[]');
      const itemIndex = items.findIndex((i: any) => i.id === itemId);
      
      if (itemIndex === -1) return;
      
      items[itemIndex].is_available = !items[itemIndex].is_available;
      items[itemIndex].updated_at = new Date().toISOString();
      
      localStorage.setItem(itemType, JSON.stringify(items));
      
      // Refetch data
      if (itemType === 'destinations') {
        refetchDestinations();
      } else {
        refetchServices();
      }
      
      showSuccess(
        'Availability Updated',
        `${items[itemIndex].name} is now ${items[itemIndex].is_available ? 'available' : 'unavailable'}`,
        3000
      );
    } catch (error) {
      showError('Update Failed', 'Failed to update availability', 5000);
    }
  };

  const updateCapacity = async (itemId: string, itemType: 'destinations' | 'services', newCapacity: number) => {
    try {
      const items = JSON.parse(localStorage.getItem(itemType) || '[]');
      const itemIndex = items.findIndex((i: any) => i.id === itemId);
      
      if (itemIndex === -1) return;
      
      items[itemIndex].max_capacity = newCapacity;
      items[itemIndex].updated_at = new Date().toISOString();
      
      // If new capacity is less than current bookings, mark as unavailable
      if (newCapacity <= items[itemIndex].current_bookings) {
        items[itemIndex].is_available = false;
      } else {
        items[itemIndex].is_available = true;
      }
      
      localStorage.setItem(itemType, JSON.stringify(items));
      
      // Refetch data
      if (itemType === 'destinations') {
        refetchDestinations();
      } else {
        refetchServices();
      }
      
      showSuccess('Capacity Updated', 'Capacity updated successfully!', 3000);
    } catch (error) {
      showError('Update Failed', 'Failed to update capacity', 5000);
    }
  };

  const handleCancelBooking = (booking: any) => {
    setBookingToCancel(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const confirmAdminCancellation = () => {
    if (!bookingToCancel) return;

    const result = cancelBooking(bookingToCancel.id, cancelReason);
    
    if (result.success) {
      showSuccess('Booking Cancelled', 'Booking has been cancelled successfully.', 4000);
      setShowCancelModal(false);
      setBookingToCancel(null);
      setCancelReason('');
      refetchBookings();
    } else {
      showError('Cancellation Failed', result.message, 4000);
    }
  };

  const canCancelBooking = (booking: any) => {
    return booking.payment_status === 'pending' || booking.payment_status === 'paid';
  };

  const handleResetBookingCounts = () => {
    if (window.confirm('Are you sure you want to reset all booking counts to 0? This action cannot be undone.')) {
      const result = resetAllBookingCounts();
      
      if (result.success) {
        showSuccess('Reset Successful', result.message, 4000);
        // Refetch data to update the UI
        refetchDestinations();
        refetchServices();
      } else {
        showError('Reset Failed', result.message, 4000);
      }
    }
  };

  const handleServiceDestinationUpdate = (serviceId: string, destinationIds: string[]) => {
    const result = updateServiceDestinationCompatibility(serviceId, destinationIds);
    
    if (result.success) {
      showSuccess('Compatibility Updated', result.message, 3000);
      refetchServices();
    } else {
      showError('Update Failed', result.message, 4000);
    }
  };

  const handleDestinationGroupTourDatesUpdate = (destinationId: string, groupTourDates: any[]) => {
    const result = updateDestinationGroupTourDates(destinationId, groupTourDates);
    
    if (result.success) {
      showSuccess('Dates Updated', result.message, 3000);
      refetchDestinations();
    } else {
      showError('Update Failed', result.message, 4000);
    }
  };



  const handleDelete = async (table: string, id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await remove(table, id);
        // Refetch data based on table
        switch (table) {
          case 'bookings': refetchBookings(); break;
          case 'destinations': refetchDestinations(); break;
          case 'services': refetchServices(); break;
          case 'gallery': refetchGallery(); break;
          case 'testimonials': refetchTestimonials(); break;
          case 'advertisements': refetchAds(); break;
          case 'offers': refetchOffers(); break;
          case 'inquiries': refetchInquiries(); break;
        }
        showSuccess('Item Deleted', 'Item deleted successfully!', 3000);
      } catch (error) {
        showError('Delete Failed', 'Error deleting item', 5000);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await update(activeTab, editingItem.id, formData);
      } else {
        await insert(activeTab, formData);
      }

      // Refetch data
      switch (activeTab) {
        case 'destinations': refetchDestinations(); break;
        case 'services': refetchServices(); break;
        case 'gallery': refetchGallery(); break;
        case 'testimonials': refetchTestimonials(); break;
        case 'advertisements': refetchAds(); break;
        case 'offers': refetchOffers(); break;
      }

      setEditingItem(null);
      setShowForm(false);
      setFormData({});
      showSuccess('Item Saved', 'Item saved successfully!', 3000);
    } catch (error) {
      showError('Save Failed', 'Error saving item', 5000);
    }
  };

  const updatePaymentStatus = async (bookingId: string, status: 'pending' | 'paid' | 'cancelled') => {
    try {
      await update('bookings', bookingId, { payment_status: status });
      refetchBookings();
      showSuccess('Payment Updated', 'Payment status updated successfully!', 3000);
    } catch (error) {
      showError('Update Failed', 'Error updating payment status', 5000);
    }
  };

  const exportBookings = (filter: string) => {
    let filteredBookings = [...bookings];
    const now = new Date();

    switch (filter) {
      case 'today':
        filteredBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.created_at || Date.now());
          return bookingDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.created_at || Date.now());
          return bookingDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.created_at || Date.now());
          return bookingDate >= monthAgo;
        });
        break;
    }

    if (filteredBookings.length === 0) {
      showWarning('No Data', 'No bookings found for the selected period', 4000);
      return;
    }

    const csvData = filteredBookings.map(booking => ({
      'Booking ID': booking.id,
      'Customer Name': booking.customer_name,
      'Email': booking.email,
      'Mobile': booking.mobile,
      'Destination': getDestinationName(booking.destination_id),
      'Service': getServiceName(booking.service_ids || booking.service_id),
      'Amount': booking.amount || booking.total_amount || 0,
      'Payment Status': booking.payment_status,
      'Booking Date': booking.booking_date,
      'Created At': new Date(booking.created_at || Date.now()).toLocaleDateString()
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${filter}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveQrCode = () => {
    if (!qrCodeData.trim()) {
      showWarning('No Data', 'Please enter a QR code URL or upload an image file.', 4000);
      return;
    }
    
    localStorage.setItem('paymentQrCodeData', qrCodeData);
    showSuccess('QR Code Updated', 'QR Code updated successfully!', 3000);
  };

  const clearQrCode = () => {
    setQrCodeData('');
    localStorage.removeItem('paymentQrCodeData');
    showInfo('QR Code Cleared', 'QR Code has been cleared successfully.', 3000);
  };

  const openForm = (item?: any) => {
    setEditingItem(item || null);
    setFormData(item || {});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({});
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">
          Karnataka Tourism Dashboard
        </h2>
        <p className="text-xl text-gray-600">Official KTDC Partner Platform</p>
        <div className="mt-4 inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Official KTDC Partner</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Bookings</p>
              <p className="text-3xl font-bold">{stats.totalBookings}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pending Bookings</p>
              <p className="text-3xl font-bold">{stats.pendingBookings}</p>
            </div>
            <Clock className="w-12 h-12 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Paid Bookings</p>
              <p className="text-3xl font-bold">{stats.paidBookings}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Travelers</p>
              <p className="text-3xl font-bold">{stats.totalTravelers}</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Total Revenue</p>
              <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <CreditCard className="w-12 h-12 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Tourism Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Karnataka Destinations</h3>
            <MapPin className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.totalDestinations}</p>
          <p className="text-sm text-gray-600">Active Destinations</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Services</h3>
            <Settings className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.totalServices}</p>
          <p className="text-sm text-gray-600">Available Services</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Inquiries</h3>
            <MessageSquare className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.totalInquiries}</p>
          <p className="text-sm text-gray-600">Customer Inquiries</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Destination</th>
                <th className="text-left py-2">Service</th>
                <th className="text-left py-2">Travelers</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="border-b">
                  <td className="py-2">{booking.customer_name}</td>
                  <td className="py-2">{getDestinationName(booking.destination_id)}</td>
                  <td className="py-2">{getServiceName(booking.service_ids || booking.service_id)}</td>
                  <td className="py-2">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-600">
                        {booking.seats_selected || 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-2">₹{(booking.amount || booking.total_amount || 0).toLocaleString()}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="py-2">{new Date(booking.created_at || Date.now()).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBookingsTable = () => {
    const filteredBookings = bookings.filter(booking =>
      Object.values(booking).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      getDestinationName(booking.destination_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getServiceName(booking.service_ids || booking.service_id).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Debug logging for payment proof
    console.log('Admin - Bookings with payment proof:', filteredBookings.filter(b => b.payment_proof_url));
    console.log('Admin - Total bookings:', filteredBookings.length);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Bookings Management</h2>
          <div className="flex space-x-2">
            <select
              value={exportFilter}
              onChange={(e) => setExportFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Bookings</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button
              onClick={() => exportBookings(exportFilter)}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Destination</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Travelers</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Pickup</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Proof</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold">{booking.customer_name}</div>
                        <div className="text-sm text-gray-500">{booking.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div>{booking.mobile}</div>
                        <div className="text-gray-500">{booking.address?.substring(0, 30)}...</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getDestinationName(booking.destination_id)}</td>
                    <td className="py-3 px-4">{getServiceName(booking.service_ids || booking.service_id)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">
                          {booking.seats_selected || 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {(booking.seats_selected || 1) === 1 ? 'Person' : 'People'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{booking.pickup_location || 'Not specified'}</div>
                        {booking.pickup_time && (
                          <div className="text-gray-500 text-xs">{booking.pickup_time}</div>
                        )}
                        {booking.pickup_instructions && (
                          <div className="flex items-center space-x-2 mt-1">
                            <button
                              onClick={() => setSelectedPickupInstructions(booking.pickup_instructions)}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded"
                              title="View Pickup Instructions"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-blue-600">Instructions</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">₹{(booking.amount || booking.total_amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <select
                        value={booking.payment_status}
                        onChange={(e) => updatePaymentStatus(booking.id, e.target.value as any)}
                        className={`px-2 py-1 rounded-full text-xs border-0 ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {booking.payment_proof_url ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedImage(booking.payment_proof_url)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded"
                            title="View Payment Proof"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-green-600">✓ Proof</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No proof</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {canCancelBooking(booking) && (
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            className="text-orange-500 hover:text-orange-700 p-1 rounded"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete('bookings', booking.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderQrSettings = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Payment QR Code Settings</h2>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">📋 Instructions</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Upload a QR code image file (PNG, JPG, etc.) or paste an image URL</li>
            <li>• The QR code will be displayed on payment pages for customers to scan</li>
            <li>• Supported formats: Image URLs, Base64 encoded images</li>
            <li>• Recommended size: 200x200 pixels or larger</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Upload QR Code</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Image URL or Base64
                </label>
                <textarea
                  value={qrCodeData}
                  onChange={(e) => setQrCodeData(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste image URL or base64 data here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or upload image file
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setQrCodeData(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveQrCode}
                  className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save QR Code
                </button>
                <button
                  onClick={clearQrCode}
                  className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Preview</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {qrCodeData ? (
                <div>
                  <img
                    src={qrCodeData}
                    alt="Payment QR Code"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }} className="text-red-500">
                    <XCircle className="w-16 h-16 mx-auto mb-4" />
                    <p>Invalid image URL or data</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Upload className="w-16 h-16 mx-auto mb-4" />
                  <p>No QR code uploaded</p>
                  <p className="text-sm mt-2">Upload an image or paste a URL to preview</p>
                </div>
              )}
            </div>
            
            {qrCodeData && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">QR Code Information</h4>
                <div className="text-sm text-blue-700">
                  <p><strong>Type:</strong> {qrCodeData.startsWith('data:') ? 'Base64 Image' : 'Image URL'}</p>
                  <p><strong>Size:</strong> {qrCodeData.length} characters</p>
                  <p><strong>Status:</strong> <span className="text-green-600">Ready for use</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const getFormFields = () => {
    switch (activeTab) {
      case 'destinations':
        return [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'location', label: 'Location', type: 'text', required: true },
          { name: 'duration', label: 'Duration', type: 'text', required: true },
          {
            name: 'category', label: 'Category', type: 'select', required: true, options: [
              'adventure', 'beach', 'mountain', 'cultural', 'religious', 'wildlife', 'romantic', 'family', 'heritage', 'nature'
            ]
          },
          { name: 'tags', label: 'Tags (comma separated)', type: 'text' },
          { name: 'image_url', label: 'Primary Image URL', type: 'url', required: true },
          { name: 'gallery_images', label: 'Additional Image URLs (comma separated)', type: 'textarea' },
          { name: 'price', label: 'Base Price', type: 'number', required: true },
          { name: 'price_unit', label: 'Price Unit (e.g., per km, per hour, per person)', type: 'text', placeholder: 'per km' },
          { name: 'price_range_min', label: 'Min Price (for range)', type: 'number' },
          { name: 'price_range_max', label: 'Max Price (for range)', type: 'number' },
          { name: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5 },
          { name: 'max_capacity', label: 'Max Capacity', type: 'number', required: true },
          { name: 'inclusions', label: 'Inclusions', type: 'textarea' },
          { name: 'exclusions', label: 'Exclusions', type: 'textarea' },
          { name: 'itinerary', label: 'Itinerary (Day 1:..., Day 2:...)', type: 'textarea' },
        ];
      case 'services':
        return [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'image_url', label: 'Image URL', type: 'url' },
          { name: 'price', label: 'Base Price', type: 'number', required: true },
          { name: 'price_unit', label: 'Price Unit (e.g., per km, per hour, per person)', type: 'text', placeholder: 'per km' },
          { name: 'price_range_min', label: 'Min Price (for range)', type: 'number' },
          { name: 'price_range_max', label: 'Max Price (for range)', type: 'number' },
        ];
      case 'gallery':
        return [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'image_url', label: 'Image URL', type: 'url', required: true },
        ];
      case 'testimonials':
        return [
          { name: 'author', label: 'Author', type: 'text', required: true },
          { name: 'text', label: 'Testimonial', type: 'textarea', required: true },
        ];
      case 'advertisements':
        return [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'image_url', label: 'Image URL', type: 'url', required: true },
        ];
      case 'offers':
        return [
          { name: 'title', label: 'Offer Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'original_price', label: 'Original Price', type: 'number', required: true },
          { name: 'price', label: 'Offer Price', type: 'number', required: true },
          { name: 'discount_percentage', label: 'Discount %', type: 'number' },
          { name: 'valid_until', label: 'Valid Until', type: 'date' },
          { name: 'tags', label: 'Tags (comma separated)', type: 'text' },
          { name: 'image_url', label: 'Banner Image URL', type: 'url', required: true },
        ];
      default:
        return [];
    }
  };

  const renderDataTable = (data: any[], columns: string[], tableName: string) => {
    const filteredData = data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800 capitalize">{tableName}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => exportData(data, tableName)}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            {!['bookings', 'inquiries', 'payments'].includes(tableName) && (
              <button
                onClick={() => openForm()}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${tableName}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="text-left py-3 px-4 font-semibold text-gray-700 capitalize">
                      {column.replace('_', ' ')}
                    </th>
                  ))}
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    {columns.map((column) => (
              <td key={column} className="py-3 px-4">
                {column.includes('image_url') && !column.includes('gallery_images') ? ( // MODIFIED LINE: Changed condition
                  item[column] ? (
                    <img src={item[column]} alt="" className="w-12 h-12 object-cover rounded" />
                  ) : (
                    'No image'
                  )
                ) : column === 'gallery_images' ? ( // ADDED BLOCK for gallery_images
                  item[column] ? (
                    <div className="flex gap-1">
                      {(() => {
                        // Handle different data formats for gallery_images
                        let imageUrls = [];
                        try {
                          if (typeof item[column] === 'string') {
                            // Try to parse as JSON first
                            if (item[column].startsWith('[') || item[column].startsWith('{')) {
                              const parsed = JSON.parse(item[column]);
                              imageUrls = Array.isArray(parsed) ? parsed : [parsed];
                            } else {
                              // Split by comma if it's a comma-separated string
                              imageUrls = item[column].split(',').filter(Boolean);
                            }
                          } else if (Array.isArray(item[column])) {
                            imageUrls = item[column];
                          } else {
                            imageUrls = [item[column]];
                          }
                        } catch (e) {
                          // Fallback to comma splitting
                          imageUrls = String(item[column]).split(',').filter(Boolean);
                        }
                        
                        return imageUrls.slice(0, 3).map((imgUrl: string, imgIndex: number) => (
                          <img 
                            key={imgIndex} 
                            src={String(imgUrl).trim()} 
                            alt={`Gallery ${imgIndex}`} 
                            className="w-10 h-10 object-cover rounded" 
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.src.includes('placeholder')) {
                                target.src = 'https://via.placeholder.com/50';
                              }
                            }}
                          />
                        ));
                      })()}
                      {(() => {
                        let totalImages = 0;
                        try {
                          if (typeof item[column] === 'string') {
                            if (item[column].startsWith('[') || item[column].startsWith('{')) {
                              const parsed = JSON.parse(item[column]);
                              totalImages = Array.isArray(parsed) ? parsed.length : 1;
                            } else {
                              totalImages = item[column].split(',').filter(Boolean).length;
                            }
                          } else if (Array.isArray(item[column])) {
                            totalImages = item[column].length;
                          } else {
                            totalImages = 1;
                          }
                        } catch (e) {
                          totalImages = String(item[column]).split(',').filter(Boolean).length;
                        }
                        
                        return totalImages > 3 && (
                          <span className="text-sm text-gray-500">+{totalImages - 3} more</span>
                        );
                      })()}
                    </div>
                  ) : (
                    'No additional images'
                  )
                ) : column === 'price' || column === 'amount' || column === 'original_price' ? ( // Moved price related checks here
                  `₹${(item[column] || 0).toLocaleString()}${item.price_unit ? ` ${item.price_unit}` : ''}`
                ) : column === 'price_unit' ? ( // ADDED BLOCK for price unit
                  item[column] ? (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {item[column]}
                    </span>
                  ) : 'No unit'
                ) : column === 'rating' ? ( // ADDED BLOCK for rating
                  item[column] ? `${item[column]}/5` : 'N/A'
                ) : column === 'inclusions' || column === 'exclusions' || column === 'itinerary' ? ( // ADDED BLOCK for text fields
                  item[column] ? String(item[column]).substring(0, 50) + (String(item[column]).length > 50 ? '...' : '') : 'N/A'
                ) : column === 'discount_percentage' && item[column] ? ( // Existing code, ensuring correct placement
                  <span className="text-green-600 font-semibold">{item[column]}% OFF</span>
                ) : column === 'category' ? ( // Existing code, ensuring correct placement
                  item[column] ? (
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full capitalize">
                      {item[column]}
                    </span>
                  ) : 'No category'
                ) : column === 'tags' ? ( // Existing code, ensuring correct placement
                  item[column] ? (
                    <div className="flex flex-wrap gap-1">
                      {item[column].split(',').slice(0, 2).map((tag: string, index: number) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  ) : 'No tags'
                ) : column.includes('date') || column.includes('created_at') ? ( // Existing code, ensuring correct placement
                  new Date(item[column] || Date.now()).toLocaleDateString()
                ) : column === 'valid_until' ? ( // Existing code, ensuring correct placement
                  item[column] ? new Date(item[column]).toLocaleDateString() : 'No expiry'
                ) : column === 'payment_status' ? ( // Existing code, ensuring correct placement
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item[column] === 'paid' ? 'bg-green-100 text-green-800' :
                    item[column] === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item[column]}
                  </span>
                ) : (
                  String(item[column] || '').substring(0, 50) + (String(item[column] || '').length > 50 ? '...' : '')
                )}
              </td>
            ))}
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {!['bookings', 'inquiries', 'payments'].includes(tableName) && (
                          <button
                            onClick={() => openForm(item)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(tableName, item.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const exportData = (data: any[], filename: string) => {
    if (data.length === 0) {
      showWarning('No Data', 'No data to export', 4000);
      return;
    }

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const renderForm = () => {
    if (!showForm) return null;

    const fields = getFormFields();

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
            </h3>
            <button onClick={closeForm} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && '*'}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(option => (
                      <option key={option} value={option} className="capitalize">{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value
                    }))}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderAvailabilityManagement = () => {
    console.log('🎯 Rendering Availability Management');
    console.log('Destinations:', destinations);
    console.log('Services:', services);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Availability Management</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Manage tour and service capacity to prevent overbooking
            </div>
            <button
              onClick={handleResetBookingCounts}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              title="Reset all booking counts to 0"
            >
              <XCircle className="w-4 h-4" />
              <span>Reset All Counts</span>
            </button>
          </div>
        </div>

      {/* Destinations Availability */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          Destinations Availability
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Destination</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Capacity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Booked</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Available</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((dest) => {
                const availability = getAvailabilityStatus(dest.id, 'destinations');
                return (
                  <tr key={dest.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold">{dest.name}</div>
                      <div className="text-sm text-gray-500">₹{dest.price.toLocaleString()}{dest.price_unit ? ` ${dest.price_unit}` : ''}</div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="1"
                        defaultValue={dest.max_capacity}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        onBlur={(e) => {
                          const newCapacity = parseInt(e.target.value);
                          if (newCapacity !== dest.max_capacity) {
                            updateCapacity(dest.id, 'destinations', newCapacity);
                          }
                        }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{dest.current_bookings || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        availability.remainingCapacity > 5 ? 'text-green-600' :
                        availability.remainingCapacity > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {availability.remainingCapacity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        availability.status === 'available' ? 'bg-green-100 text-green-800' :
                        availability.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                        availability.status === 'full' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {availability.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleAvailability(dest.id, 'destinations')}
                        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                          dest.is_available 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {dest.is_available ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services Availability */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-green-600" />
          Services Availability
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Capacity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Booked</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Available</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => {
                const availability = getAvailabilityStatus(service.id, 'services');
                return (
                  <tr key={service.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-sm text-gray-500">₹{service.price.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="1"
                        defaultValue={service.max_capacity}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        onBlur={(e) => {
                          const newCapacity = parseInt(e.target.value);
                          if (newCapacity !== service.max_capacity) {
                            updateCapacity(service.id, 'services', newCapacity);
                          }
                        }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{service.current_bookings || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        availability.remainingCapacity > 5 ? 'text-green-600' :
                        availability.remainingCapacity > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {availability.remainingCapacity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        availability.status === 'available' ? 'bg-green-100 text-green-800' :
                        availability.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                        availability.status === 'full' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {availability.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleAvailability(service.id, 'services')}
                        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                          service.is_available 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {service.is_available ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Availability Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Availability Status Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>Available (5+ seats)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span>Limited (1-5 seats)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span>Full (0 seats)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderServiceCoordination = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Service-Destination Coordination</h2>
          <div className="text-sm text-gray-600">
            Configure which services are available for each destination
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">How it works</h4>
          <p className="text-sm text-blue-700">
            Select which destinations each service should be available for. When customers book a destination, 
            only the services marked as compatible will be shown in the booking flow.
          </p>
        </div>

        {/* Services Coordination Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Service-Destination Compatibility
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Compatible Destinations</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-green-600">₹{service.price.toLocaleString()}{service.price_unit ? ` ${service.price_unit}` : ''}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {service.compatible_destinations && service.compatible_destinations.length > 0 ? (
                          destinations.map((destination) => {
                            const isCompatible = service.compatible_destinations?.includes(destination.id) || false;
                            return (
                              <span
                                key={destination.id}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  isCompatible
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {destination.name}
                              </span>
                            );
                          })
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            No destinations selected
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const modal = document.getElementById(`coordination-modal-${service.id}`);
                            if (modal) {
                              modal.classList.remove('hidden');
                              modal.classList.add('flex');
                            }
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                        >
                          Configure
                        </button>
                        <button
                          onClick={() => {
                            // Toggle group tour status
                            const updatedServices = services.map(s => 
                              s.id === service.id 
                                ? { ...s, is_group_tour: !s.is_group_tour }
                                : s
                            );
                            localStorage.setItem('services', JSON.stringify(updatedServices));
                            showSuccess(
                              'Group Tour Status Updated',
                              `${service.name} is now ${!service.is_group_tour ? 'marked as' : 'unmarked from'} a group tour`,
                              3000
                            );
                            // Refetch services data to update the UI without page refresh
                            refetchServices();
                          }}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                            service.is_group_tour 
                              ? 'bg-green-500 hover:bg-green-600 text-white' 
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                        >
                          {service.is_group_tour ? 'Group Tour ✓' : 'Make Group Tour'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coordination Modals */}
        {services.map((service) => (
          <div 
            key={service.id} 
            id={`coordination-modal-${service.id}`} 
            className="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                const modal = document.getElementById(`coordination-modal-${service.id}`);
                if (modal) {
                  modal.classList.add('hidden');
                  modal.classList.remove('flex');
                }
              }
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Configure {service.name}</h3>
                  <button
                    onClick={() => {
                      const modal = document.getElementById(`coordination-modal-${service.id}`);
                      if (modal) {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                      }
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Select which destinations this service should be available for:
                </p>
                
                {(!service.compatible_destinations || service.compatible_destinations.length === 0) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-red-600 text-lg">⚠️</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-red-800">No Destinations Selected</h4>
                        <p className="text-sm text-red-700 mt-1">
                          This service will not appear in the customer booking flow until you select at least one destination.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {destinations.map((destination) => {
                    const isCompatible = service.compatible_destinations?.includes(destination.id) || false;
                    return (
                      <label key={destination.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          defaultChecked={isCompatible}
                          onChange={(e) => {
                            const currentCompatible = service.compatible_destinations || [];
                            let newCompatible;
                            
                            if (e.target.checked) {
                              newCompatible = [...currentCompatible, destination.id];
                            } else {
                              newCompatible = currentCompatible.filter((id: string) => id !== destination.id);
                            }
                            
                            handleServiceDestinationUpdate(service.id, newCompatible);
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{destination.name}</div>
                          <div className="text-sm text-gray-500">{destination.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      const modal = document.getElementById(`coordination-modal-${service.id}`);
                      if (modal) {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGroupTourDates = () => {
    console.log('🔍 Debug - All destinations:', destinations);
    console.log('🔍 Debug - Destinations with group_tour_dates:', destinations.map(d => ({
      name: d.name,
      hasGroupTourDates: !!d.group_tour_dates,
      groupTourDates: d.group_tour_dates
    })));
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Group Tour Dates Management</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Set specific dates for Group Tours to each destination
            </div>
            <button
              onClick={() => {
                const result = refreshDestinationsWithGroupTourDates();
                if (result.success) {
                  showSuccess('Data Refreshed', result.message, 3000);
                  refetchDestinations();
                } else {
                  showError('Refresh Failed', result.message, 4000);
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Refresh Sample Dates
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">How it works</h4>
          <p className="text-sm text-blue-700">
            Set specific dates and times for Group Tours to each destination. When customers book a Group Tour 
            for a destination, they will see these predefined dates instead of selecting their own date. 
            This ensures organized group departures for each destination.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>Total destinations: {destinations.length}</p>
            <p>Destinations with group tour dates: {destinations.filter(d => d.group_tour_dates && d.group_tour_dates.length > 0).length}</p>
            <div className="mt-2">
              <p className="font-semibold">Destination Status:</p>
              {destinations.map(destination => (
                <div key={destination.id} className="ml-2 text-xs">
                  - {destination.name}: {destination.group_tour_dates ? `${destination.group_tour_dates.length} dates` : 'No dates'}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {destinations.map((destination) => (
            <div key={destination.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{destination.name}</h3>
                  <p className="text-gray-600">{destination.description}</p>
                  <p className="text-sm text-gray-500">{destination.location}</p>
                </div>
                <button
                  onClick={() => {
                    const modal = document.getElementById(`dates-modal-${destination.id}`);
                    if (modal) {
                      modal.classList.remove('hidden');
                      modal.classList.add('flex');
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Manage Dates
                </button>
              </div>

              {/* Current Group Tour Dates */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Current Group Tour Dates:</h4>
                {destination.group_tour_dates && destination.group_tour_dates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {destination.group_tour_dates.map((date: any) => (
                      <div key={date.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-800">{new Date(date.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{date.time}</p>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {date.available_slots - date.booked_slots} slots
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{date.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No Group Tour dates set. Click "Manage Dates" to add dates.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Date Management Modals */}
        {destinations.map((destination) => (
          <div 
            key={destination.id} 
            id={`dates-modal-${destination.id}`} 
            className="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                const modal = document.getElementById(`dates-modal-${destination.id}`);
                if (modal) {
                  modal.classList.add('hidden');
                  modal.classList.remove('flex');
                }
              }
            }}
          >
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Manage Group Tour Dates for {destination.name}</h3>
                <button 
                  onClick={() => {
                    const modal = document.getElementById(`dates-modal-${destination.id}`);
                    if (modal) {
                      modal.classList.add('hidden');
                      modal.classList.remove('flex');
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
                  title="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Add dates when you want to organize group tours to {destination.name}</li>
                    <li>• Set specific times for each date</li>
                    <li>• Add descriptions to help customers understand the tour</li>
                    <li>• Customers will see these dates when booking Group Tours to this destination</li>
                  </ul>
                </div>

                {/* Add New Date Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Add New Date:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        id={`new-date-${destination.id}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        id={`new-time-${destination.id}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        id={`new-description-${destination.id}`}
                        placeholder={`e.g., Morning ${destination.name} Tour, Weekend Special Tour`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Available Slots</label>
                      <input
                        type="number"
                        id={`new-slots-${destination.id}`}
                        defaultValue={destination.max_capacity || 20}
                        min="1"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          const dateInput = document.getElementById(`new-date-${destination.id}`) as HTMLInputElement;
                          const timeInput = document.getElementById(`new-time-${destination.id}`) as HTMLInputElement;
                          const descriptionInput = document.getElementById(`new-description-${destination.id}`) as HTMLInputElement;
                          const slotsInput = document.getElementById(`new-slots-${destination.id}`) as HTMLInputElement;
                          
                          if (!dateInput.value || !timeInput.value || !descriptionInput.value) {
                            showError('Missing Information', 'Please fill in all required fields.', 3000);
                            return;
                          }
                          
                          const currentDates = destination.group_tour_dates || [];
                          const newDate = {
                            id: Date.now().toString(),
                            date: dateInput.value,
                            time: timeInput.value,
                            description: descriptionInput.value,
                            available_slots: parseInt(slotsInput.value),
                            booked_slots: 0
                          };
                          
                          const updatedDates = [...currentDates, newDate];
                          handleDestinationGroupTourDatesUpdate(destination.id, updatedDates);
                          
                          // Clear form
                          dateInput.value = '';
                          timeInput.value = '';
                          descriptionInput.value = '';
                          slotsInput.value = (destination.max_capacity || 20).toString();
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Add Date
                      </button>
                    </div>
                  </div>
                </div>

                {/* Current Dates List */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Current Dates:</h4>
                  {destination.group_tour_dates && destination.group_tour_dates.length > 0 ? (
                    <div className="space-y-2">
                      {destination.group_tour_dates.map((date: any, index: number) => (
                        <div key={date.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-semibold text-gray-800">{new Date(date.date).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600">{date.time} - {date.description}</p>
                              </div>
                              <div className="text-sm text-gray-500">
                                {date.available_slots - date.booked_slots} / {date.available_slots} slots available
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const currentDates = destination.group_tour_dates || [];
                              const updatedDates = currentDates.filter((d: any) => d.id !== date.id);
                              handleDestinationGroupTourDatesUpdate(destination.id, updatedDates);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Remove Date"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No dates added yet.</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    const modal = document.getElementById(`dates-modal-${destination.id}`);
                    if (modal) {
                      modal.classList.add('hidden');
                      modal.classList.remove('flex');
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    console.log('🎯 Active tab:', activeTab);
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'bookings':
        return renderBookingsTable();
      case 'availability':
        console.log('🎯 Rendering availability management');
        return renderAvailabilityManagement();
      case 'coordination':
        return renderServiceCoordination();
      case 'group-tour-dates':
        return renderGroupTourDates();
      case 'firebase-migration':
        return <FirebaseMigration />;
      case 'firebase-test':
        return <FirebaseTest />;
      case 'qr-settings':
        return renderQrSettings();
      case 'destinations':
        return renderDataTable(
          destinations,
          ['name', 'price', 'price_unit', 'rating', 'image_url', 'gallery_images', 'inclusions', 'exclusions', 'itinerary'], 'destinations');
      case 'services':
        return renderDataTable(services, ['name', 'description', 'image_url', 'price', 'price_unit'], 'services');
      case 'addons':
        return <AddOnsManager />;
      case 'gallery':
        return renderDataTable(gallery, ['title', 'image_url'], 'gallery');
      case 'testimonials':
        return renderDataTable(testimonials, ['author', 'text'], 'testimonials');
      case 'advertisements':
        return renderDataTable(advertisements, ['title', 'description', 'image_url'], 'advertisements');
      case 'offers':
        return renderDataTable(offers, ['title', 'description', 'original_price', 'price', 'discount_percentage', 'valid_until', 'tags', 'image_url'], 'offers');
      case 'inquiries':
        return renderDataTable(inquiries, ['name', 'email', 'phone', 'message', 'created_at'], 'inquiries');
      case 'payments':
        return <PaymentHistory />;
      default:
        return renderDashboard();
    }
  };

  
  // Show login form if not authenticated
  // Wrap the entire admin panel with protected route
  return (
    <ProtectedRoute requireAdmin={true}>
    <div className="admin-layout">
      <div className="flex">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-orange-500" />
                <h1 className="text-xl font-bold text-gray-800 font-poppins">
                  <TypingAnimation text="Admin Panel" speed={100} />
                </h1>
              </div>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchQuery('');
                      setShowForm(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 font-inter ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content">
          {renderContent()}
        </div>
      </div>

      {renderForm()}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Payment Proof"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Pickup Instructions Modal */}
      {selectedPickupInstructions && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                Pickup Instructions
              </h3>
              <button
                onClick={() => setSelectedPickupInstructions(null)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-800 text-lg leading-relaxed">
                  {selectedPickupInstructions}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedPickupInstructions(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Cancellation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <XCircle className="w-6 h-6 mr-2 text-red-600" />
                Cancel Booking (Admin)
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
                  <p className="text-sm"><strong>Customer:</strong> {bookingToCancel.customer_name}</p>
                  <p className="text-sm"><strong>Email:</strong> {bookingToCancel.email}</p>
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
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">Admin Action</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will cancel the booking and free up the seats. The customer will be notified of the cancellation.
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
                  onClick={confirmAdminCancellation}
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
    </ProtectedRoute>
  );
};

export default Admin;