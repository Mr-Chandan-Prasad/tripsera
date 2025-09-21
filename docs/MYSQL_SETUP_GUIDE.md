# 🗄️ MySQL Database Setup Guide for Tripsera

## 🎯 Quick Setup (5 Steps)

### Step 1: Install MySQL
1. **Download MySQL**: Go to [mysql.com](https://dev.mysql.com/downloads/installer/)
2. **Install**: Run the installer with default settings
3. **Remember**: Your root password (you'll need it later)

### Step 2: Create Database
1. **Open MySQL Command Line** or **MySQL Workbench**
2. **Login**: `mysql -u root -p` (enter your password)
3. **Run this SQL**:
```sql
CREATE DATABASE tripsera_data;
USE tripsera_data;
```

### Step 3: Set Up Tables
1. **Copy the SQL**: Open `database/mysql_setup.sql`
2. **Run it**: Paste and execute in MySQL
3. **Verify**: You should see "Database setup completed successfully!"

### Step 4: Start Backend Server
1. **Open terminal** in your project folder
2. **Start backend**:
```bash
cd backend
node server.js
```
3. **You should see**: "🚀 MySQL API Server running on port 3001"

### Step 5: Test Connection
1. **Open another terminal**
2. **Start frontend**:
```bash
npm run dev
```
3. **Check browser console** for connection messages

---

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file in the `backend` folder:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=tripsera_data
PORT=3001
```

### Default Settings
- **Host**: localhost
- **Port**: 3306
- **User**: root
- **Database**: tripsera_data
- **API Port**: 3001

---

## ✅ Test Your Setup

### 1. Backend Test
Visit: `http://localhost:3001/api/health`
Should show: `{"status":"OK","message":"MySQL API is running"}`

### 2. Database Test
Visit: `http://localhost:3001/api/test-connection`
Should show: `{"status":"success","message":"Database connection successful"}`

### 3. Data Test
Visit: `http://localhost:3001/api/destinations`
Should show: Array of destination objects

### 4. Frontend Test
1. Open your website
2. Check browser console for "✅ MySQL connection successful"
3. Try creating a booking

---

## 🆘 Troubleshooting

### "Database connection failed"
- ✅ **Check MySQL is running**: Start MySQL service
- ✅ **Check password**: Make sure root password is correct
- ✅ **Check database exists**: Run `SHOW DATABASES;` in MySQL

### "Port 3001 already in use"
- ✅ **Kill process**: `taskkill /f /im node.exe` (Windows)
- ✅ **Change port**: Set `PORT=3002` in backend/.env

### "Cannot connect to MySQL"
- ✅ **Check MySQL service**: Start MySQL in Services
- ✅ **Check firewall**: Allow MySQL through firewall
- ✅ **Check credentials**: Verify username/password

### "Table doesn't exist"
- ✅ **Run setup script**: Execute `database/mysql_setup.sql`
- ✅ **Check database**: Make sure you're using `tripsera_db`

---

## 📊 What You Get

### Sample Data Included:
- **5 Destinations**: Goa, Kashmir, Kerala, Rajasthan, Himachal
- **5 Services**: Flights, Hotels, Insurance, Car Rental, Tour Guide
- **5 Add-ons**: Photography, Airport Transfer, Travel Guide, Meals, Activities
- **Gallery Images**: Beautiful travel photos
- **Testimonials**: Customer reviews
- **Advertisements**: Promotional content

### Database Tables:
- `destinations` - Travel destinations
- `services` - Travel services
- `bookings` - Customer bookings
- `addons` - Additional services
- `booking_addons` - Booking add-on relationships
- `gallery` - Image gallery
- `testimonials` - Customer reviews
- `advertisements` - Promotional content
- `offers` - Special offers
- `inquiries` - Customer inquiries
- `site_settings` - Website settings

---

## 🚀 Start Both Servers

### Terminal 1 (Backend):
```bash
cd backend
node server.js
```

### Terminal 2 (Frontend):
```bash
npm run dev
```

### Your website will be at:
- **Frontend**: http://localhost:5173 (or 5174)
- **Backend API**: http://localhost:3001

---

## 🎉 Success!

Once everything is working:
- ✅ **MySQL database** connected
- ✅ **Backend API** running
- ✅ **Frontend** connected to database
- ✅ **Sample data** loaded
- ✅ **All features** working

Your Tripsera app now uses a real MySQL database! 🚀
