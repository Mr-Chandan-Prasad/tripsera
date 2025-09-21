-- MySQL setup script for Tripsera
-- Complete database setup with all required tables

CREATE DATABASE IF NOT EXISTS tripsera_data;
USE tripsera_data;

-- Create tables for the application
CREATE TABLE IF NOT EXISTS destinations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(255) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    address TEXT,
    destination_id VARCHAR(255),
    service_id VARCHAR(255),
    booking_date DATE,
    details TEXT,
    seats_selected INT DEFAULT 1,
    total_amount DECIMAL(10,2) DEFAULT 0,
    amount DECIMAL(10,2) DEFAULT 0,
    addons_total DECIMAL(10,2) DEFAULT 0,
    base_amount DECIMAL(10,2) DEFAULT 0,
    payment_status ENUM('pending', 'processing', 'paid', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    customer_image_url VARCHAR(500),
    payment_proof_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addons (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional tables for complete functionality
CREATE TABLE IF NOT EXISTS booking_addons (
    id VARCHAR(255) PRIMARY KEY,
    booking_id VARCHAR(255) NOT NULL,
    addon_id VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (addon_id) REFERENCES addons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gallery (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(255) PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    rating INT DEFAULT 5,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS advertisements (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offers (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    original_price DECIMAL(10,2),
    price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2),
    valid_until DATE,
    tags VARCHAR(500),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
    id VARCHAR(255) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    contact_email VARCHAR(255),
    company_address TEXT,
    payment_qr_code_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default site settings
INSERT IGNORE INTO site_settings (id, company_name, contact_number, contact_email, company_address) 
VALUES ('site_1', 'Tripsera Travel', '+91 9876543210', 'info@tripsera.com', '123 Travel Street, Tourism City, TC 123456');

-- Insert sample data
INSERT IGNORE INTO destinations (id, name, description, price, image_url) VALUES
('dest_1', 'Goa Beach Paradise', 'Beautiful beaches and vibrant nightlife', 15000.00, '/images/goa.jpg'),
('dest_2', 'Kerala Backwaters', 'Serene backwaters and lush greenery', 12000.00, '/images/kerala.jpg'),
('dest_3', 'Rajasthan Heritage', 'Royal palaces and desert adventures', 18000.00, '/images/rajasthan.jpg');

INSERT IGNORE INTO services (id, name, description, price, image_url) VALUES
('serv_1', 'Flight Booking', 'Domestic and international flight reservations', 5000.00, '/images/flight.jpg'),
('serv_2', 'Hotel Booking', 'Luxury and budget hotel reservations', 3000.00, '/images/hotel.jpg'),
('serv_3', 'Tour Guide', 'Professional tour guide services', 2000.00, '/images/guide.jpg');

INSERT IGNORE INTO addons (id, name, description, price, image_url) VALUES
('addon_1', 'Airport Transfer', 'Comfortable airport pickup and drop', 1500.00, '/images/transfer.jpg'),
('addon_2', 'Travel Insurance', 'Comprehensive travel insurance coverage', 800.00, '/images/insurance.jpg'),
('addon_3', 'Photography Service', 'Professional photography during your trip', 2500.00, '/images/photography.jpg');
