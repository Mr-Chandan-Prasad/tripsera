import { MYSQL_CONFIG } from '../config/database';

// MySQL Database Types
export interface Database {
  destinations: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    price: number;
    created_at: string;
  };
  services: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    price: number;
    created_at: string;
  };
  bookings: {
    id: string;
    customer_name: string;
    email: string;
    mobile: string;
    address: string;
    destination_id: string | null;
    service_id: string | null;
    booking_date: string;
    details: string | null;
    amount: number;
    payment_status: 'pending' | 'paid' | 'cancelled';
    payment_proof_url: string | null;
    customer_image_url: string | null;
    created_at: string;
  };
  gallery: {
    id: string;
    title: string;
    image_url: string;
    created_at: string;
  };
  testimonials: {
    id: string;
    author: string;
    text: string;
    created_at: string;
  };
  advertisements: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    created_at: string;
  };
  offers: {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    created_at: string;
  };
  inquiries: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    created_at: string;
  };
  site_settings: {
    id: string;
    company_name: string;
    contact_number: string;
    contact_email: string;
    company_address: string;
    payment_qr_code_url: string | null;
    created_at: string;
    updated_at: string;
  };
}

// MySQL Database Client (Mock for now - will be replaced with real API calls)
export const mysqlClient = {
  // This will be replaced with actual API calls to your backend
  config: MYSQL_CONFIG
};
