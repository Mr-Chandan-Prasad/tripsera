# 🗄️ Complete MySQL Database Setup Guide for Tripsera

This guide will help you set up MySQL database for the Tripsera travel booking platform with **ZERO ERRORS**.

## 📋 Prerequisites

### 1. Install MySQL
- **Windows**: Download from [MySQL Official Website](https://dev.mysql.com/downloads/mysql/)
- **macOS**: `brew install mysql` or download from MySQL website
- **Linux**: `sudo apt-get install mysql-server` (Ubuntu/Debian) or `sudo yum install mysql-server` (CentOS/RHEL)

### 2. Start MySQL Service
```bash
# Windows (Run as Administrator)
net start mysql

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
sudo systemctl enable mysql
```

## 🚀 Quick Setup (Automated)

### Step 1: Install Dependencies
```bash
# Install all required packages
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Auto-Detect MySQL Password
```bash
# This script will automatically detect your MySQL password
node scripts/fix-mysql-password.cjs
```

### Step 3: Setup Database
```bash
# This will create database and all tables
node scripts/setup-mysql.js
```

### Step 4: Start the Application
```bash
# Start backend server (Terminal 1)
npm run start:backend

# Start frontend (Terminal 2)
npm run dev
```

## 🔧 Manual Setup (If Automated Fails)

### Step 1: Connect to MySQL
```bash
mysql -u root -p
```

### Step 2: Create Database
```sql
CREATE DATABASE tripsera_db;
USE tripsera_db;
```

### Step 3: Run Setup Script
```bash
# Copy and paste the contents of database/mysql_setup.sql
mysql -u root -p < database/mysql_setup.sql
```

### Step 4: Update Configuration
Edit `backend/config.js`:
```javascript
module.exports = {
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD', // Update this
    database: 'tripsera_db',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
  },
  server: {
    port: 3001
  }
};
```

## 🧪 Testing the Setup

### Test 1: Database Connection
```bash
# Test MySQL connection
node scripts/fix-mysql-password.cjs
```

### Test 2: Backend API
```bash
# Start backend
npm run start:backend

# Test API (in another terminal)
curl http://localhost:3001/api/health
```

### Test 3: Frontend Integration
```bash
# Start frontend
npm run dev

# Visit: http://localhost:5174
```

## 📊 Database Schema

The setup creates the following tables:

### Core Tables
- **destinations** - Travel destinations
- **services** - Travel services
- **bookings** - Customer bookings
- **addons** - Additional services
- **booking_addons** - Booking-addon relationships

### Content Tables
- **gallery** - Image gallery
- **testimonials** - Customer testimonials
- **advertisements** - Promotional content
- **offers** - Special offers
- **inquiries** - Contact form submissions

### System Tables
- **site_settings** - Website configuration

## 🔍 Troubleshooting

### Problem 1: "Access denied for user 'root'"
**Solution:**
```bash
# Reset MySQL password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
FLUSH PRIVILEGES;
EXIT;
```

### Problem 2: "Can't connect to MySQL server"
**Solution:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL service
sudo systemctl start mysql
```

### Problem 3: "Database doesn't exist"
**Solution:**
```bash
# Create database manually
mysql -u root -p
CREATE DATABASE tripsera_db;
EXIT;

# Run setup script
node scripts/setup-mysql.js
```

### Problem 4: "Port 3001 already in use"
**Solution:**
```bash
# Kill process using port 3001
sudo lsof -ti:3001 | xargs kill -9

# Or change port in backend/config.js
```

## 🎯 Verification Checklist

- [ ] MySQL service is running
- [ ] Database `tripsera_db` exists
- [ ] All tables are created (11 tables)
- [ ] Sample data is inserted
- [ ] Backend server starts without errors
- [ ] Frontend connects to backend
- [ ] Admin panel loads correctly
- [ ] Booking system works

## 📱 API Endpoints

Once setup is complete, these endpoints will be available:

- `GET /api/health` - Health check
- `GET /api/destinations` - Get all destinations
- `GET /api/services` - Get all services
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

## 🔄 Switching Between localStorage and MySQL

The application supports both data storage methods:

### Using localStorage (Default)
- No setup required
- Data stored in browser
- Good for development/testing

### Using MySQL (Production)
- Follow this setup guide
- Data stored in database
- Better for production use

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Run the test scripts in `tests/html/`
3. Check console logs for error messages
4. Verify MySQL service is running
5. Ensure all dependencies are installed

## 🎉 Success!

Once setup is complete, you'll have:
- ✅ Full MySQL database with all tables
- ✅ Working backend API server
- ✅ Frontend connected to database
- ✅ Complete booking system
- ✅ Admin panel with database integration
- ✅ File upload functionality
- ✅ Payment processing
- ✅ QR code generation

**Your Tripsera travel booking platform is now ready for production!** 🚀
