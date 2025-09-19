import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Building, Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PAYMENT_CONFIG, PaymentMethod, PaymentDetails, PaymentResponse } from '../../config/payment';
import { PaymentService } from '../../services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentDetails: PaymentDetails;
  onPaymentSuccess: (response: PaymentResponse) => void;
  onPaymentError: (error: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentDetails,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('');
      setIsProcessing(false);
      setPaymentStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      setErrorMessage('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const response = await PaymentService.processPayment(selectedMethod, paymentDetails);
      
      if (response.success) {
        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentSuccess(response);
          onClose();
        }, 2000);
      } else {
        setPaymentStatus('error');
        setErrorMessage(response.error || response.message || 'Payment failed');
        onPaymentError(response.error || response.message || 'Payment failed');
      }
    } catch (error) {
      setPaymentStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Payment failed';
      setErrorMessage(errorMsg);
      onPaymentError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method.id) {
      case 'razorpay':
        return <CreditCard className="w-6 h-6" />;
      case 'stripe':
        return <CreditCard className="w-6 h-6" />;
      case 'upi':
        return <Smartphone className="w-6 h-6" />;
      case 'netbanking':
        return <Building className="w-6 h-6" />;
      case 'wallet':
        return <Wallet className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 font-poppins">Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Payment Details */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 font-poppins">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-800">
                  {PaymentService.formatAmount(paymentDetails.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="text-gray-800">{paymentDetails.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="text-gray-800">{paymentDetails.customerName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {paymentStatus === 'processing' && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-gray-700 font-inter">Processing payment...</span>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-3 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold font-inter">Payment Successful!</span>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <span className="font-semibold font-inter">Payment Failed</span>
            </div>
            {errorMessage && (
              <p className="text-red-600 text-sm mt-2 text-center">{errorMessage}</p>
            )}
          </div>
        )}

        {/* Payment Methods */}
        {paymentStatus === 'idle' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 font-poppins">Select Payment Method</h3>
            <div className="space-y-3">
              {PAYMENT_CONFIG.methods.filter(method => method.enabled).map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedMethod === method.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMethod === method.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getMethodIcon(method)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-800 font-inter">{method.name}</div>
                      <div className="text-sm text-gray-600 font-inter">{method.description}</div>
                    </div>
                    <div className="text-2xl">{method.icon}</div>
                  </div>
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-inter">{errorMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          {paymentStatus === 'idle' && (
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-inter"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                className="flex-1 btn-primary font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          )}

          {paymentStatus === 'error' && (
            <button
              onClick={() => {
                setPaymentStatus('idle');
                setErrorMessage('');
              }}
              className="w-full btn-primary font-poppins"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
