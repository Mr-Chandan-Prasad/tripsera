# 🧪 Tripsera Test Suite

This directory contains all testing files for the Tripsera travel booking platform, organized for easy navigation and maintenance.

## 📁 Directory Structure

```
tests/
├── index.html              # Main test suite index (start here!)
├── README.md              # This documentation file
└── html/                  # All test HTML files
    ├── test-payment-data-debug.html
    ├── test-payment-ids-fix.html
    ├── test-full-ids-display.html
    ├── test-payment-booking-ids.html
    ├── test-payment-proof.html
    ├── test-booking-duplication.html
    ├── test-my-bookings.html
    ├── test-ticket-fix.html
    ├── test-ticket-no-addons.html
    ├── test-qr-settings.html
    ├── test-qr-integration.html
    ├── test-coordination.html
    ├── test-localStorage.html
    ├── test-notifications.html
    ├── test-inquiries.html
    ├── test-database-connection.html
    ├── test-mysql-connection.html
    ├── test-mysql-setup.html
    └── test-kannada.html
```

## 🚀 Quick Start

1. **Open the Test Suite**: Navigate to `tests/index.html` in your browser
2. **Choose a Test Category**: Select from Payment, Booking, System, UI, or Database tests
3. **Run Individual Tests**: Click on any test card to run a specific test
4. **Follow Instructions**: Each test provides detailed instructions and expected results

## 📋 Test Categories

### 💳 Payment & Booking Tests
- **Payment Data Debug**: Debug payment data and transaction IDs
- **Payment IDs Fix**: Test payment ID display fixes
- **Full IDs Display**: Verify full ID visibility
- **Payment Booking IDs**: Test ID display in tickets
- **Payment Proof**: Test payment proof functionality

### 🎫 Booking & Ticket Tests
- **Booking Duplication**: Test for duplicate booking issues
- **My Bookings**: Test booking history functionality
- **Ticket Fix**: Test ticket generation
- **Ticket No Add-ons**: Test ticket display without add-ons

### ⚙️ System & Integration Tests
- **QR Code Settings**: Test QR code configuration
- **QR Code Integration**: Test QR code payment integration
- **Coordination Test**: Test home/admin page coordination
- **LocalStorage Test**: Test data persistence

### 🔔 UI & Notification Tests
- **Notifications**: Test styled notification system
- **Inquiries**: Test contact form functionality

### 🗄️ Database & Connection Tests
- **Database Connection**: Test database connectivity
- **MySQL Connection**: Test MySQL database connection
- **MySQL Setup**: Test database setup process
- **Kannada Text**: Test Kannada text rendering

## 🎯 Testing Workflow

### 1. Pre-Test Setup
- Ensure the main application is running on `http://localhost:5174`
- Have admin credentials ready: `admin` / `admin123`
- Clear browser cache if needed

### 2. Running Tests
- Start with **Payment Tests** (most critical)
- Move to **Booking Tests** (core functionality)
- Check **System Tests** (integrations)
- Verify **UI Tests** (user experience)
- Test **Database Tests** (data persistence)

### 3. Test Results
- Each test provides clear success/error indicators
- Debug information is available in browser console
- Test results are logged for troubleshooting

## 🔧 Maintenance

### Adding New Tests
1. Create test file in `tests/html/` directory
2. Follow naming convention: `test-[feature-name].html`
3. Update `tests/index.html` to include new test
4. Add appropriate category and description

### Updating Existing Tests
1. Modify test file in `tests/html/` directory
2. Update description in `tests/index.html` if needed
3. Test the updated functionality
4. Update this README if new categories are added

## 📊 Test Coverage

- ✅ **Payment Processing**: Complete payment flow testing
- ✅ **Booking System**: End-to-end booking functionality
- ✅ **Admin Panel**: All admin features and data display
- ✅ **User Interface**: Notifications, forms, and interactions
- ✅ **Data Persistence**: LocalStorage and database operations
- ✅ **Integration**: QR codes, APIs, and external services

## 🐛 Troubleshooting

### Common Issues
1. **Tests not loading**: Check if main app is running on port 5174
2. **Admin access denied**: Verify admin credentials
3. **Data not persisting**: Check localStorage and database connections
4. **UI not updating**: Clear browser cache and refresh

### Debug Information
- All tests include console logging for debugging
- Browser developer tools provide additional insights
- Test files include detailed error messages and solutions

## 📝 Notes

- All test files are self-contained and can be run independently
- Tests are designed to work with the current application state
- Some tests may require specific data to be present in localStorage
- Test results are temporary and don't affect production data

## 🔄 Updates

This test suite is regularly updated to match new features and fixes. Check the main project documentation for the latest changes and new test additions.

---

**Happy Testing! 🧪✨**
