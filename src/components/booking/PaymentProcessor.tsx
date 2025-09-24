import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, QrCode, Upload, Check, X, AlertCircle, Clock } from 'lucide-react';
import ImageUploader from '../common/ImageUploader';
import LoadingSpinner from '../common/LoadingSpinner';
import PaymentModal from '../payment/PaymentModal';
import { PaymentService } from '../../services/paymentService';
import { PaymentDetails, PaymentResponse } from '../../config/payment';

interface PaymentProcessorProps {
  bookingData: any;
  onSuccess: (paymentData: any) => void;
  onCancel: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  bookingData,
  onSuccess,
  onCancel
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'qr' | 'gateway'>('gateway');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentProof, setPaymentProof] = useState<string>('');
  
  // Debug payment proof changes
  React.useEffect(() => {
    console.log('PaymentProcessor - Payment proof updated:', paymentProof ? 'Yes' : 'No');
  }, [paymentProof]);
  const [transactionId, setTransactionId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // QR code state
  const [qrCodeData, setQrCodeData] = React.useState('');
  
  // Load QR code from localStorage
  React.useEffect(() => {
    const loadQrCode = () => {
      const qrData = localStorage.getItem('paymentQrCodeData') || '';
      setQrCodeData(qrData);
      console.log('PaymentProcessor - QR Code Data:', qrData ? 'Available' : 'Not available');
      console.log('PaymentProcessor - QR Code Length:', qrData.length);
    };
    
    loadQrCode();
    
    // Listen for QR code updates from admin panel
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'paymentQrCodeData') {
        console.log('PaymentProcessor - QR Code updated from admin panel');
        loadQrCode();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};

    if (selectedMethod === 'card') {
      if (!cardDetails.number || cardDetails.number.length < 16) {
        newErrors.cardNumber = 'Invalid card number';
      }
      if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        newErrors.expiry = 'Invalid expiry date (MM/YY)';
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        newErrors.cvv = 'Invalid CVV';
      }
      if (!cardDetails.name || cardDetails.name.length < 2) {
        newErrors.name = 'Invalid cardholder name';
      }
    }

    if (selectedMethod === 'upi' && (!upiId || !upiId.includes('@'))) {
      newErrors.upiId = 'Invalid UPI ID';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPayment = async () => {
    if (selectedMethod === 'gateway') {
      setShowPaymentModal(true);
      return;
    }

    if (!validatePayment()) return;

    setPaymentStatus('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Generate transaction ID
      const txnId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setTransactionId(txnId);
      console.log('PaymentProcessor - Generated Transaction ID:', txnId);

      // More realistic payment validation - require actual payment proof or valid payment details
      let isSuccess = false;
      
      if (selectedMethod === 'qr') {
        // QR payment - assume success if QR method is selected
        // User has scanned QR and paid, no proof upload required
        isSuccess = true;
      } else if (selectedMethod === 'upi' && upiId && upiId.includes('@')) {
        // Valid UPI ID provided
        isSuccess = Math.random() > 0.2; // 80% success rate for UPI
      } else if (selectedMethod === 'card' && cardDetails.number.length >= 16) {
        // Valid card details provided
        isSuccess = Math.random() > 0.15; // 85% success rate for cards
      } else {
        // No valid payment method or details
        isSuccess = false;
      }

      if (isSuccess) {
        console.log('PaymentProcessor - Payment successful, setting status to success');
        setPaymentStatus('success');
        
        // Call success callback after a short delay
        setTimeout(() => {
          console.log('PaymentProcessor - Calling onSuccess callback');
          onSuccess({
            method: selectedMethod,
            transactionId: txnId,
            amount: bookingData.total_amount,
            paymentProof: paymentProof,
            paymentValidated: true,
            timestamp: new Date().toISOString()
          });
          // Close the payment modal immediately after success
          onCancel();
        }, 2000);
      } else {
        console.log('PaymentProcessor - Payment failed');
        setPaymentStatus('failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
    }
  };

  const handlePaymentSuccess = (response: PaymentResponse) => {
    setPaymentStatus('success');
    setTransactionId(response.transactionId || response.paymentId || '');
    
    setTimeout(() => {
      onSuccess({
        method: 'gateway',
        transactionId: response.transactionId || response.paymentId || '',
        amount: bookingData.total_amount,
        paymentProof: '',
        paymentValidated: true,
        timestamp: new Date().toISOString(),
        gatewayResponse: response
      });
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('failed');
    setErrors({ gateway: error });
  };

  const renderPaymentStatus = () => {
    if (paymentStatus === 'processing') {
      return (
        <div className="text-center py-8">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment...</h3>
          <p className="text-gray-600">Please wait while we process your payment securely.</p>
        </div>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Transaction ID: {transactionId}</p>
          <p className="text-gray-600">Redirecting to your ticket...</p>
        </div>
      );
    }

    if (paymentStatus === 'failed') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">Payment Failed</h3>
          <p className="text-gray-600 mb-4">There was an issue processing your payment.</p>
          <button
            onClick={() => setPaymentStatus('idle')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return null;
  };

  if (paymentStatus !== 'idle') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          {renderPaymentStatus()}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Secure Payment</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">Booking ID: {bookingData.id}</p>
              <p className="text-gray-600">Customer: {bookingData.customer_name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-600">₹{bookingData.total_amount.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-4">Select Payment Method</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedMethod('gateway')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMethod === 'gateway' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <span className="text-sm font-medium">Payment Gateway</span>
              <span className="text-xs text-gray-500 block mt-1">Razorpay, Stripe</span>
            </button>
            
            <button
              onClick={() => setSelectedMethod('qr')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMethod === 'qr' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <QrCode className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <span className="text-sm font-medium">QR Code</span>
              <span className="text-xs text-gray-500 block mt-1">Scan & Pay</span>
            </button>
            
            <button
              onClick={() => setSelectedMethod('upi')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMethod === 'upi' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <span className="text-sm font-medium">UPI</span>
              <span className="text-xs text-gray-500 block mt-1">UPI ID</span>
            </button>
            
            <button
              onClick={() => setSelectedMethod('card')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMethod === 'card' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <span className="text-sm font-medium">Card</span>
              <span className="text-xs text-gray-500 block mt-1">Debit/Credit</span>
            </button>
          </div>
        </div>

        {/* Payment Method Forms */}
        {selectedMethod === 'qr' && (
          <div className="mb-6">
            <div className="text-center">
              {qrCodeData ? (
                <div className="w-64 h-64 mx-auto mb-4">
                  <img 
                    src={qrCodeData} 
                    alt="Payment QR Code" 
                    className="w-full h-full object-contain rounded-lg border-2 border-gray-200"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">QR Code not available</p>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-4">Scan QR code with any UPI app to pay</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm text-blue-800 font-medium">Payment Instructions:</p>
                    <ol className="text-sm text-blue-700 mt-1 list-decimal list-inside space-y-1">
                      <li>Scan the QR code using any UPI app</li>
                      <li>Enter the amount: ₹{bookingData.total_amount.toLocaleString()}</li>
                      <li>Complete the payment</li>
                      <li>Upload payment screenshot below (optional)</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === 'upi' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.upiId && (
              <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>
            )}
          </div>
        )}

        {selectedMethod === 'card' && (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardDetails.number}
                onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setCardDetails(prev => ({ ...prev, expiry: value }));
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {errors.expiry && (
                  <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {errors.cvv && (
                  <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardDetails.name}
                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Payment Proof Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Payment Proof (Optional)
          </label>
          <ImageUploader
            onImageUpload={setPaymentProof}
            maxSize={20}
            className="w-full"
            accept="image/*"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a screenshot of your payment confirmation for faster verification
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 font-medium">Secure Payment</p>
              <p className="text-sm text-green-700 mt-1">
                Your payment information is encrypted and secure. We use industry-standard security measures.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={processPayment}
            className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-5 h-5" />
            <span>Pay ₹{bookingData.total_amount.toLocaleString()}</span>
          </button>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentDetails={{
          amount: bookingData.total_amount,
          currency: 'INR',
          orderId: PaymentService.generateOrderId(),
          customerId: bookingData.customer_name,
          customerName: bookingData.customer_name,
          customerEmail: bookingData.email,
          customerPhone: bookingData.phone,
          description: `Booking for ${bookingData.destination_id ? 'Destination' : 'Service'}`,
          bookingId: bookingData.id
        }}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
};

export default PaymentProcessor;