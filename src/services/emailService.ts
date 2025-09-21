// Email notification service
// This is a mock implementation - in production, you'd integrate with services like SendGrid, AWS SES, or Nodemailer

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  destination: string;
  bookingDate: string;
  totalAmount: number;
  bookingId: string;
  groupSize?: number;
}

export interface CancellationEmailData {
  customerName: string;
  customerEmail: string;
  destination: string;
  bookingDate: string;
  refundAmount: number;
  bookingId: string;
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_EMAIL_API_KEY || '';
    this.fromEmail = process.env.REACT_APP_FROM_EMAIL || 'noreply@tripsera.com';
  }

  // Booking Confirmation Email
  generateBookingConfirmation(data: BookingEmailData): EmailTemplate {
    const { customerName, destination, bookingDate, totalAmount, bookingId, groupSize } = data;
    
    const subject = `Booking Confirmed - ${destination} | Tripsera`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .total { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Thank you for choosing Tripsera</p>
          </div>
          
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>Your booking has been successfully confirmed! We're excited to be part of your travel journey.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Destination:</span>
                <span class="detail-value">${destination}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Travel Date:</span>
                <span class="detail-value">${bookingDate}</span>
              </div>
              ${groupSize ? `
              <div class="detail-row">
                <span class="detail-label">Group Size:</span>
                <span class="detail-value">${groupSize} people</span>
              </div>
              ` : ''}
            </div>
            
            <div class="total">
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value" style="font-size: 18px; font-weight: bold; color: #2d5a2d;">₹${totalAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>You'll receive a detailed itinerary 24 hours before your travel date</li>
              <li>Our team will contact you for any special requirements</li>
              <li>Keep this email as your booking reference</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="#" class="button">View Booking Details</a>
            </div>
            
            <div class="footer">
              <p>Need help? Contact us at support@tripsera.com or +91 9876543210</p>
              <p>© 2024 Tripsera. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Booking Confirmation - Tripsera
      
      Hello ${customerName},
      
      Your booking has been confirmed!
      
      Booking ID: ${bookingId}
      Destination: ${destination}
      Travel Date: ${bookingDate}
      ${groupSize ? `Group Size: ${groupSize} people` : ''}
      Total Amount: ₹${totalAmount.toLocaleString()}
      
      Thank you for choosing Tripsera!
      
      Contact: support@tripsera.com | +91 9876543210
    `;

    return {
      to: data.customerEmail,
      subject,
      html,
      text
    };
  }

  // Cancellation Email
  generateCancellationEmail(data: CancellationEmailData): EmailTemplate {
    const { customerName, destination, bookingDate, refundAmount, bookingId } = data;
    
    const subject = `Booking Cancelled - ${destination} | Tripsera`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Cancellation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .refund { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Booking Cancelled</h1>
            <p>We're sorry to see you go</p>
          </div>
          
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>Your booking has been successfully cancelled as requested.</p>
            
            <div class="booking-details">
              <h3>Cancelled Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Destination:</span>
                <span class="detail-value">${destination}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Original Travel Date:</span>
                <span class="detail-value">${bookingDate}</span>
              </div>
            </div>
            
            <div class="refund">
              <div class="detail-row">
                <span class="detail-label">Refund Amount:</span>
                <span class="detail-value" style="font-size: 18px; font-weight: bold; color: #2d5a2d;">₹${refundAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <p><strong>Refund Information:</strong></p>
            <ul>
              <li>Refund will be processed within 5-7 business days</li>
              <li>You'll receive a confirmation email once processed</li>
              <li>Refund will be credited to your original payment method</li>
            </ul>
            
            <p>We hope to serve you again in the future. If you have any questions, please don't hesitate to contact us.</p>
            
            <div class="footer">
              <p>Need help? Contact us at support@tripsera.com or +91 9876543210</p>
              <p>© 2024 Tripsera. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      to: data.customerEmail,
      subject,
      html
    };
  }

  // Send email (mock implementation)
  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      // In production, this would integrate with your email service
      console.log('📧 Email would be sent:', {
        to: template.to,
        subject: template.subject,
        from: this.fromEmail
      });
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Send booking confirmation
  async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    const template = this.generateBookingConfirmation(data);
    return this.sendEmail(template);
  }

  // Send cancellation email
  async sendCancellationEmail(data: CancellationEmailData): Promise<boolean> {
    const template = this.generateCancellationEmail(data);
    return this.sendEmail(template);
  }
}

export const emailService = new EmailService();
