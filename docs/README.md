# 🌍 Tripsera - Travel & Tourism Website

A modern, full-stack travel and tourism website built with React, TypeScript, and MySQL. Tripsera provides a complete booking platform with destination management, payment processing, and admin panel.

## 🚀 **Live Demo**

- **Frontend**: http://localhost:5174/
- **Backend API**: http://localhost:3001/api/
- **Admin Panel**: http://localhost:5174/admin

## ✨ **Features**

### 🏖️ **For Travelers**
- **Browse Destinations** - Explore beautiful travel destinations
- **Advanced Search** - Filter by location, price, duration, and category
- **Booking System** - Complete booking flow with payment integration
- **Add-ons** - Photography, airport transfer, meals, and more
- **Ticket Generation** - Digital tickets with QR codes
- **Weather Information** - Real-time weather for destinations
- **Currency Conversion** - Multi-currency support

### 👨‍💼 **For Administrators**
- **Dashboard** - Complete analytics and overview
- **Destination Management** - Add, edit, and manage destinations
- **Booking Management** - View and manage all bookings
- **Add-ons Management** - Create and manage additional services
- **Payment Tracking** - Monitor payment status and history
- **Content Management** - Manage gallery, testimonials, and offers

### 🛠️ **Technical Features**
- **MySQL Database** - Robust data storage and management
- **RESTful API** - Complete backend API with CRUD operations
- **Payment Integration** - Razorpay and Stripe support
- **Responsive Design** - Mobile-first, responsive UI
- **Performance Optimized** - Lazy loading, caching, and optimization
- **Real-time Updates** - Live data synchronization

## 🏗️ **Tech Stack**

### **Frontend**
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **MySQL2** - MySQL client for Node.js
- **CORS** - Cross-origin resource sharing
- **Multer** - File upload handling

### **APIs & Services**
- **OpenWeatherMap** - Weather data
- **Google Places** - Tourist attractions
- **ExchangeRate API** - Currency conversion
- **Razorpay** - Payment processing
- **Stripe** - Payment processing

## 📁 **Project Structure**

```
tripsera/
├── 📚 docs/                    # Documentation
│   ├── README.md              # Documentation index
│   ├── MYSQL_SETUP_GUIDE.md   # Database setup
│   ├── API_INTEGRATION_GUIDE.md # API integration
│   └── ...                    # Other guides
├── 🧪 tests/                   # Test files
│   ├── test-mysql-setup.html  # MySQL connection test
│   ├── test-kannada.html      # Kannada text test
│   └── ...                    # Other tests
├── 🔧 scripts/                 # Utility scripts
│   ├── setup-mysql.js         # MySQL setup script
│   └── fix-mysql-password.cjs # Password fix script
├── 🗄️ database/                # Database files
│   ├── mysql_setup.sql        # MySQL schema
│   └── database_setup.sql     # Database setup
├── 🖥️ backend/                 # Backend server
│   ├── server.js              # Express server
│   ├── config.js              # Configuration
│   └── package.json           # Backend dependencies
├── 💻 src/                     # Frontend source
│   ├── components/            # React components
│   ├── pages/                 # Page components
│   ├── hooks/                 # Custom hooks
│   ├── services/              # API services
│   └── utils/                 # Utility functions
└── 📦 package.json            # Frontend dependencies
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### **1. Clone & Install**
```bash
git clone <repository-url>
cd tripsera
npm install
cd backend && npm install
```

### **2. Database Setup**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE tripsera_db;
USE tripsera_db;

# Run setup script
mysql -u root -p tripsera_db < database/mysql_setup.sql
```

### **3. Start Servers**
```bash
# Terminal 1: Start backend
cd backend
node server.js

# Terminal 2: Start frontend
npm run dev
```

### **4. Access Application**
- **Website**: http://localhost:5174/
- **API**: http://localhost:3001/api/health
- **Admin**: http://localhost:5174/admin (admin/chandanprasad2025)

## 🔧 **Configuration**

### **Environment Variables**
Create `.env` files as needed:

**Backend (.env)**
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=tripsera_db
PORT=3001
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WEATHER_API_KEY=your_weather_api_key
VITE_GOOGLE_PLACES_API_KEY=your_places_api_key
```

## 📊 **API Endpoints**

### **Destinations**
- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/:id` - Get destination by ID
- `POST /api/destinations` - Create destination
- `PUT /api/destinations/:id` - Update destination
- `DELETE /api/destinations/:id` - Delete destination

### **Bookings**
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### **Other Endpoints**
- `GET /api/health` - Health check
- `GET /api/test-connection` - Database connection test
- `POST /api/upload` - File upload

## 🎨 **UI Components**

### **Pages**
- **Home** - Hero section with destinations
- **Destinations** - Browse and search destinations
- **Services** - Travel services
- **Gallery** - Photo gallery
- **Contact** - Contact form
- **Admin** - Admin dashboard

### **Components**
- **BookingInterface** - Complete booking flow
- **PaymentProcessor** - Payment handling
- **TicketGenerator** - Digital ticket creation
- **WeatherWidget** - Weather information
- **AddOnsSelector** - Additional services

## 🔒 **Security**

- **Input Validation** - All inputs are validated
- **SQL Injection Protection** - Parameterized queries
- **CORS Configuration** - Proper CORS setup
- **Environment Variables** - Sensitive data protection
- **Error Handling** - Comprehensive error handling

## 📱 **Responsive Design**

- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Responsive tablet layout
- **Desktop Enhanced** - Full desktop experience
- **Touch Friendly** - Touch-optimized interactions

## 🌍 **Internationalization**

- **Kannada Support** - Native Kannada text display
- **Multi-currency** - Currency conversion support
- **Localized Content** - Region-specific content

## 🚀 **Performance**

- **Lazy Loading** - Component and image lazy loading
- **Code Splitting** - Optimized bundle splitting
- **Caching** - API response caching
- **Image Optimization** - Optimized image loading
- **Bundle Analysis** - Performance monitoring

## 🧪 **Testing**

- **Connection Tests** - Database and API tests
- **Component Tests** - React component testing
- **Integration Tests** - End-to-end testing
- **Performance Tests** - Load and performance testing

## 📚 **Documentation**

All documentation is available in the `docs/` folder:

- **[Setup Guide](docs/MYSQL_SETUP_GUIDE.md)** - Complete setup instructions
- **[API Guide](docs/API_INTEGRATION_GUIDE.md)** - API integration guide
- **[Performance Guide](docs/PERFORMANCE_OPTIMIZATION_GUIDE.md)** - Optimization tips
- **[Troubleshooting](docs/README.md)** - Common issues and solutions

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

- **Documentation**: Check the `docs/` folder
- **Issues**: Create an issue on GitHub
- **Email**: tripsera.info@gmail.com

## 🎯 **Roadmap**

- [ ] **Mobile App** - React Native mobile app
- [ ] **Advanced Analytics** - Detailed analytics dashboard
- [ ] **Multi-language** - Full internationalization
- [ ] **Social Login** - Google, Facebook login
- [ ] **Real-time Chat** - Customer support chat
- [ ] **AI Recommendations** - AI-powered destination recommendations

---

**Built with ❤️ by the Tripsera Team**

*"Wherever you are, however you are, forever remain Kannada"*  
*ಎಲ್ಲಾದರೂ ಇರು ಎಂತಾದರೂ ಇರು ಎಂದೆಂದಿಗೂ ನೀ ಕನ್ನಡವಾಗಿರು*
