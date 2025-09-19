# 🗄️ Simple Database Setup Guide for Tripsera

## 🎯 Choose Your Database Option

You have **2 options** to connect your SQL database:

### Option 1: Supabase (Recommended - Easiest) 🌟
- **Free** cloud database
- **No installation** required
- **5 minutes** setup
- **Automatic backups**

### Option 2: MySQL (Local Database)
- **Local installation** required
- **More control** over your data
- **Requires** MySQL server setup

---

## 🚀 Option 1: Supabase Setup (Recommended)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub/Google or email
4. Click **"New Project"**

### Step 2: Create Your Project
1. **Project Name**: `tripsera-database`
2. **Database Password**: Create a strong password (save it!)
3. **Region**: Choose closest to your location
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

### Step 3: Get Your Database Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these 2 values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### Step 4: Configure Your App
1. In your project folder, create a file called `.env.local`
2. Add these lines (replace with your actual values):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Set Up Database Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste this SQL code:

```sql
-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url VARCHAR(500),
  category VARCHAR(100),
  location VARCHAR(255),
  duration VARCHAR(50),
  rating DECIMAL(3,2),
  tags TEXT,
  gallery_images TEXT,
  inclusions TEXT,
  exclusions TEXT,
  itinerary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url VARCHAR(500),
  category VARCHAR(100),
  duration VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  destination_id INTEGER REFERENCES destinations(id),
  service_id INTEGER REFERENCES services(id),
  booking_date DATE NOT NULL,
  details TEXT,
  seats_selected INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  addons_total DECIMAL(10,2) DEFAULT 0,
  base_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  customer_image_url VARCHAR(500),
  payment_proof_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create addons table
CREATE TABLE IF NOT EXISTS addons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  max_quantity INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create booking_addons table
CREATE TABLE IF NOT EXISTS booking_addons (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  addon_id INTEGER REFERENCES addons(id),
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_image VARCHAR(500),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  destination VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  position VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2),
  valid_from DATE,
  valid_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO destinations (name, description, price, image_url, category, location, duration, rating, tags) VALUES
('Goa Beach Paradise', 'Experience the beautiful beaches and vibrant nightlife of Goa', 15000.00, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'Beach', 'Goa, India', '5 Days', 4.5, 'beach,party,relaxation'),
('Kashmir Valley', 'Discover the stunning beauty of Kashmir with its mountains and lakes', 25000.00, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', 'Mountain', 'Kashmir, India', '7 Days', 4.8, 'mountains,lakes,scenic'),
('Kerala Backwaters', 'Cruise through the peaceful backwaters of Kerala', 18000.00, 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', 'Nature', 'Kerala, India', '4 Days', 4.6, 'backwaters,nature,peaceful');

INSERT INTO services (name, description, price, image_url, category, duration) VALUES
('Flight Booking', 'Book domestic and international flights', 5000.00, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800', 'Transportation', 'Instant'),
('Hotel Reservation', 'Reserve hotels and accommodations', 3000.00, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'Accommodation', 'Instant'),
('Travel Insurance', 'Comprehensive travel insurance coverage', 2000.00, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800', 'Insurance', 'Instant');

INSERT INTO addons (name, description, price, category, is_active) VALUES
('Photography Package', 'Professional photography during your trip', 5000.00, 'Services', true),
('Airport Transfer', 'Comfortable airport pickup and drop', 2000.00, 'Transportation', true),
('Travel Guide', 'Local guide for sightseeing', 3000.00, 'Services', true);

-- Enable Row Level Security (RLS)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON destinations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON services FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON addons FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON gallery FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON advertisements FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON offers FOR SELECT USING (true);

-- Allow public insert for bookings and inquiries
CREATE POLICY "Allow public insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON inquiries FOR INSERT WITH CHECK (true);
```

4. Click **"Run"** to execute the SQL

### Step 6: Test Your Connection
1. Restart your development server:
```bash
npm run dev
```

2. Open your website and check the browser console for any database connection messages

---

## 🛠️ Option 2: MySQL Setup (Local)

### Step 1: Install MySQL
1. Download MySQL from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Install with default settings
3. Remember your root password

### Step 2: Create Database
1. Open MySQL Command Line or MySQL Workbench
2. Run these commands:

```sql
CREATE DATABASE tripsera_db;
USE tripsera_db;
```

### Step 3: Set Up Backend
1. Create a `backend` folder in your project
2. Install backend dependencies:
```bash
cd backend
npm init -y
npm install express mysql2 cors multer
```

### Step 4: Create Backend Server
Create `backend/server.js`:

```javascript
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_mysql_password', // Replace with your password
  database: 'tripsera_db'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Routes
app.get('/api/destinations', (req, res) => {
  db.query('SELECT * FROM destinations', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 5: Run Backend
```bash
cd backend
node server.js
```

---

## ✅ Test Your Database Connection

### For Supabase:
1. Check browser console for connection messages
2. Try creating a booking to test database writes
3. Check Supabase dashboard for new data

### For MySQL:
1. Check terminal for "Connected to MySQL database" message
2. Visit `http://localhost:3001/api/destinations` to test API
3. Check your app for data loading

---

## 🆘 Troubleshooting

### Common Issues:

1. **"Database connection failed"**
   - Check your `.env.local` file has correct credentials
   - Verify Supabase project is active
   - Check internet connection

2. **"Table doesn't exist"**
   - Run the SQL migration script again
   - Check table names in Supabase dashboard

3. **"Permission denied"**
   - Check Row Level Security policies in Supabase
   - Verify API keys are correct

### Need Help?
- Check browser console for error messages
- Verify your `.env.local` file exists and has correct values
- Make sure your Supabase project is active

---

## 🎉 Success!

Once connected, your Tripsera app will:
- ✅ Store all bookings in the database
- ✅ Load destinations and services from database
- ✅ Save customer information securely
- ✅ Work offline with cached data

Your database is now connected and ready to use! 🚀
