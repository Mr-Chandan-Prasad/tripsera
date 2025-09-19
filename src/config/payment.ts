// Payment Gateway Configuration
export const PAYMENT_CONFIG = {
  // Razorpay Configuration
  razorpay: {
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
    keySecret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'your_key_secret',
    currency: 'INR',
    name: 'Tripsera Travels',
    description: 'Travel Booking Payment',
    image: '/tripsera-logo.png',
    theme: {
      color: '#f97316'
    }
  },
  
  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key',
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_your_secret_key',
    currency: 'inr'
  },
  
  // Payment Methods
  methods: [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Pay with UPI, Cards, Net Banking',
      icon: '💳',
      enabled: true
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'International payment processing',
      icon: '🌍',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay with UPI ID or QR Code',
      icon: '📱',
      enabled: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay with your bank account',
      icon: '🏦',
      enabled: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Paytm, PhonePe, Google Pay',
      icon: '💰',
      enabled: true
    }
  ],
  
  // Payment Status
  status: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  }
};

// Payment Gateway Types
export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  bookingId: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  message?: string;
  error?: string;
}

// Environment Variables Setup Instructions:
/*
Create a .env.local file in your project root with:

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_RAZORPAY_KEY_SECRET=your_key_secret

# Stripe Configuration  
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_STRIPE_SECRET_KEY=sk_test_your_secret_key

# Get these from:
# Razorpay: https://dashboard.razorpay.com/
# Stripe: https://dashboard.stripe.com/
*/
