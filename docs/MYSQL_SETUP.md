# MySQL Database Setup Guide for Tripsera

This guide will help you set up a MySQL database for your Tripsera travel website.

## Prerequisites

1. **MySQL Server** installed and running
2. **Node.js** (version 16 or higher)
3. **npm** or **yarn** package manager

## Step 1: Install MySQL Server

### Windows
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run the installer and follow the setup wizard
3. Remember your root password
4. Start MySQL service

### macOS
```bash
# Using Homebrew
brew install mysql
brew services start mysql

# Set root password
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

## Step 2: Create Database and User

1. **Connect to MySQL**:
```bash
mysql -u root -p
```

2. **Create Database**:
```sql
CREATE DATABASE tripsera_db;
```

3. **Create User** (optional, for security):
```sql
CREATE USER 'tripsera_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON tripsera_db.* TO 'tripsera_user'@'localhost';
FLUSH PRIVILEGES;
```

4. **Exit MySQL**:
```sql
EXIT;
```

## Step 3: Run Database Schema

1. **Run the schema file**:
```bash
mysql -u root -p tripsera_db < database/schema.sql
```

Or if you created a user:
```bash
mysql -u tripsera_user -p tripsera_db < database/schema.sql
```

## Step 4: Set Up Backend API

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file** (`.env`):
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=tripsera_db
PORT=3001
```

4. **Start the backend server**:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Step 5: Configure Frontend

1. **Create `.env.local` file** in your project root:
```env
VITE_API_URL=http://localhost:3001/api
VITE_MYSQL_HOST=localhost
VITE_MYSQL_PORT=3306
VITE_MYSQL_USER=root
VITE_MYSQL_PASSWORD=your_mysql_password
VITE_MYSQL_DATABASE=tripsera_db
```

2. **Install frontend dependencies**:
```bash
npm install
```

3. **Start the frontend**:
```bash
npm run dev
```

## Step 6: Verify Setup

1. **Check backend API**: Visit `http://localhost:3001/api/health`
2. **Check frontend**: Visit `http://localhost:5173` (or your Vite port)
3. **Check browser console** for database connection messages

## Database Schema

Your MySQL database includes these tables:

- **destinations** - Travel destinations with pricing
- **services** - Travel services offered
- **bookings** - Customer bookings
- **gallery** - Image gallery
- **testimonials** - Customer testimonials
- **advertisements** - Homepage advertisements
- **offers** - Special offers and packages
- **inquiries** - Customer inquiries
- **site_settings** - Website configuration

## API Endpoints

The backend provides RESTful API endpoints:

- `GET /api/{table}` - Get all records
- `GET /api/{table}/{id}` - Get single record
- `POST /api/{table}` - Create new record
- `PUT /api/{table}/{id}` - Update record
- `DELETE /api/{table}/{id}` - Delete record
- `POST /api/upload` - Upload files

## Features

✅ **Real MySQL Database** - All data stored in MySQL
✅ **RESTful API** - Clean API endpoints
✅ **File Upload** - Image upload support
✅ **Automatic Fallback** - Falls back to localStorage if API fails
✅ **Sample Data** - Pre-populated with sample content
✅ **Type Safety** - Full TypeScript support

## Troubleshooting

### MySQL Connection Issues
- Check MySQL service is running
- Verify credentials in `.env` files
- Ensure database exists
- Check firewall settings

### API Connection Issues
- Verify backend server is running on port 3001
- Check CORS settings
- Verify API URL in frontend config

### Database Schema Issues
- Ensure schema.sql ran successfully
- Check table permissions
- Verify database name matches config

## Development Workflow

1. **Start MySQL service**
2. **Start backend API**: `cd backend && npm run dev`
3. **Start frontend**: `npm run dev`
4. **Make changes** - Both servers auto-reload
5. **Test functionality** - Check browser console for logs

## Production Deployment

For production deployment:

1. **Use environment variables** for all sensitive data
2. **Set up proper MySQL user** with limited privileges
3. **Configure reverse proxy** (nginx/Apache)
4. **Enable SSL/HTTPS**
5. **Set up database backups**
6. **Configure monitoring**

## Sample Data

The app automatically populates with sample data including:
- 6 travel destinations
- 4 travel services
- 3 special offers
- Gallery images
- Customer testimonials
- Advertisement content

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify MySQL service is running
3. Check backend API health endpoint
4. Ensure all environment variables are set correctly
5. The app includes fallback to localStorage for offline functionality

---

**Your Tripsera app is now powered by a real MySQL database!** 🎉

The app will work immediately with localStorage, and seamlessly upgrade to MySQL once you complete the setup.
