import { PAYMENT_CONFIG, PaymentDetails, PaymentResponse } from '../config/payment';

// Razorpay Payment Service
export class RazorpayService {
  private static loadScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  static async initializePayment(paymentDetails: PaymentDetails): Promise<PaymentResponse> {
    try {
      const scriptLoaded = await this.loadScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      const options = {
        key: PAYMENT_CONFIG.razorpay.keyId,
        amount: paymentDetails.amount * 100, // Convert to paise
        currency: paymentDetails.currency,
        name: PAYMENT_CONFIG.razorpay.name,
        description: paymentDetails.description,
        image: PAYMENT_CONFIG.razorpay.image,
        order_id: paymentDetails.orderId,
        handler: async (response: any) => {
          return {
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            transactionId: response.razorpay_signature,
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            status: 'completed',
            message: 'Payment successful'
          };
        },
        prefill: {
          name: paymentDetails.customerName,
          email: paymentDetails.customerEmail,
          contact: paymentDetails.customerPhone
        },
        theme: PAYMENT_CONFIG.razorpay.theme,
        modal: {
          ondismiss: () => {
            return {
              success: false,
              status: 'cancelled',
              message: 'Payment cancelled by user'
            };
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      const result = await new Promise<PaymentResponse>((resolve) => {
        razorpay.on('payment.failed', (response: any) => {
          resolve({
            success: false,
            status: 'failed',
            message: 'Payment failed',
            error: response.error.description
          });
        });
        
        razorpay.open();
      });

      return result;
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: 'Payment initialization failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Stripe Payment Service
export class StripeService {
  private static stripe: any = null;

  private static async loadStripe(): Promise<any> {
    if (this.stripe) return this.stripe;
    
    const { loadStripe } = await import('@stripe/stripe-js');
    this.stripe = await loadStripe(PAYMENT_CONFIG.stripe.publishableKey);
    return this.stripe;
  }

  static async initializePayment(paymentDetails: PaymentDetails): Promise<PaymentResponse> {
    try {
      const stripe = await this.loadStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          customerId: paymentDetails.customerId,
          bookingId: paymentDetails.bookingId
        })
      });

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            // Card details will be collected by Stripe Elements
          },
          billing_details: {
            name: paymentDetails.customerName,
            email: paymentDetails.customerEmail,
            phone: paymentDetails.customerPhone
          }
        }
      });

      if (result.error) {
        return {
          success: false,
          status: 'failed',
          message: 'Payment failed',
          error: result.error.message
        };
      }

      return {
        success: true,
        paymentId: result.paymentIntent.id,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: 'completed',
        message: 'Payment successful'
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: 'Payment initialization failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// UPI Payment Service
export class UPIService {
  static async initializePayment(paymentDetails: PaymentDetails): Promise<PaymentResponse> {
    try {
      // Generate UPI payment URL
      const upiId = 'tripsera@paytm'; // Your UPI ID
      const amount = paymentDetails.amount;
      const transactionNote = `Payment for ${paymentDetails.description}`;
      
      const upiUrl = `upi://pay?pa=${upiId}&am=${amount}&cu=${paymentDetails.currency}&tn=${encodeURIComponent(transactionNote)}`;
      
      // Open UPI app
      window.location.href = upiUrl;
      
      return {
        success: true,
        status: 'processing',
        message: 'Redirecting to UPI app...'
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        message: 'UPI payment failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Main Payment Service
export class PaymentService {
  static async processPayment(
    method: string,
    paymentDetails: PaymentDetails
  ): Promise<PaymentResponse> {
    switch (method) {
      case 'razorpay':
        return await RazorpayService.initializePayment(paymentDetails);
      case 'stripe':
        return await StripeService.initializePayment(paymentDetails);
      case 'upi':
        return await UPIService.initializePayment(paymentDetails);
      default:
        return {
          success: false,
          status: 'failed',
          message: 'Payment method not supported',
          error: 'Invalid payment method'
        };
    }
  }

  static generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
