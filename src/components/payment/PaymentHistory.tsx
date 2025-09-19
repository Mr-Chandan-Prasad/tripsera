import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, CheckCircle, XCircle, Clock, RefreshCw, Download } from 'lucide-react';
import { useLocalStorageQuery, initializeSampleData } from '../../hooks/useLocalStorage';
import { PaymentService } from '../../services/paymentService';

interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transactionId?: string;
  paymentId?: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  description: string;
}

const PaymentHistory: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get payments from bookings data
  // Initialize sample data
  useEffect(() => {
    initializeSampleData();
  }, []);

  const { data: bookings, loading, refetch } = useLocalStorageQuery('bookings', '*');
  
  const payments: PaymentRecord[] = bookings.map((booking: any) => {
    // Debug logging
    console.log('PaymentHistory - Booking data:', {
      id: booking.id,
      transaction_id: booking.transaction_id,
      payment_status: booking.payment_status,
      customer_name: booking.customer_name
    });
    
    return {
      id: booking.id,
      bookingId: booking.id,
      amount: booking.amount || 0,
      currency: 'INR',
      paymentMethod: booking.payment_method || 'razorpay',
      status: booking.payment_status === 'paid' ? 'completed' : (booking.payment_status || 'pending'),
      transactionId: booking.transaction_id,
      paymentId: booking.id,
      createdAt: booking.created_at,
      customerName: booking.customer_name,
      customerEmail: booking.email,
      description: `Booking for ${booking.destination_id ? 'Destination' : 'Service'}`
    };
  });

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = searchQuery === '' || 
      payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Debug logging for payments
  console.log('PaymentHistory - All payments:', payments);
  console.log('PaymentHistory - Filtered payments:', filteredPayments);
  console.log('PaymentHistory - Payments with transaction IDs:', payments.filter(p => p.transactionId));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const fixMissingTransactionIds = () => {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    let fixed = 0;
    
    bookings.forEach(booking => {
      if (booking.payment_status === 'paid' && (!booking.transaction_id || booking.transaction_id.trim() === '')) {
        booking.transaction_id = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        booking.updated_at = new Date().toISOString();
        fixed++;
      }
    });
    
    if (fixed > 0) {
      localStorage.setItem('bookings', JSON.stringify(bookings));
      refetch();
      alert(`Fixed ${fixed} bookings with missing transaction IDs`);
    } else {
      alert('No bookings needed fixing');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportPayments = () => {
    const csvData = filteredPayments.map(payment => ({
      'Payment ID': payment.id,
      'Booking ID': payment.bookingId,
      'Customer Name': payment.customerName,
      'Customer Email': payment.customerEmail,
      'Amount': payment.amount,
      'Currency': payment.currency,
      'Payment Method': payment.paymentMethod,
      'Status': payment.status,
      'Transaction ID': payment.transactionId || '',
      'Created At': new Date(payment.createdAt).toLocaleDateString(),
      'Description': payment.description
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600 font-inter">Loading payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-poppins">Payment History</h2>
          <p className="text-gray-600 font-inter">Track all payment transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fixMissingTransactionIds}
            className="btn-secondary inline-flex items-center font-inter bg-blue-500 hover:bg-blue-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Fix Missing TXN IDs
          </button>
          <button
            onClick={exportPayments}
            className="btn-secondary inline-flex items-center font-inter"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'completed', 'pending', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-inter transition-colors duration-300 ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Total Payments</p>
              <p className="text-2xl font-bold text-gray-800 font-poppins">{payments.length}</p>
            </div>
            <CreditCard className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Completed</p>
              <p className="text-2xl font-bold text-green-600 font-poppins">
                {payments.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 font-poppins">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-inter">Failed</p>
              <p className="text-2xl font-bold text-red-600 font-poppins">
                {payments.filter(p => p.status === 'failed').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="admin-table overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="min-w-[200px]">Booking & Transaction ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500 font-inter">
                  No payments found
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-t border-gray-200">
                  <td className="py-3 px-4">
                    <div className="space-y-2">
                      <div className="bg-gray-50 p-2 rounded border">
                        <div className="text-xs text-gray-500 mb-1">Booking ID</div>
                        <div className="font-mono text-xs text-gray-800 break-all leading-tight">{payment.bookingId}</div>
                      </div>
                      {payment.transactionId ? (
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                          <div className="text-xs text-gray-500 mb-1">Transaction ID</div>
                          <div className="font-mono text-xs text-green-700 break-all leading-tight">{payment.transactionId}</div>
                        </div>
                      ) : (
                        <div className="bg-red-50 p-2 rounded border border-red-200">
                          <div className="text-xs text-gray-500 mb-1">Transaction ID</div>
                          <div className="text-xs text-red-600">No transaction ID</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="font-semibold text-gray-800 font-inter">{payment.customerName}</div>
                      <div className="text-sm text-gray-600 font-inter">{payment.customerEmail}</div>
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold text-gray-800 font-poppins">
                      {PaymentService.formatAmount(payment.amount)}
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-inter">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 font-inter">{payment.status}</span>
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center text-sm text-gray-600 font-inter">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <button className="text-orange-500 hover:text-orange-600 font-inter text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
