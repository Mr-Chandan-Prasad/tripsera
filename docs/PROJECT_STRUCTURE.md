# 📁 Tripsera Project Structure

This document provides a comprehensive overview of the Tripsera project structure and organization.

## 🏗️ **Root Directory Structure**

```
tripsera/
├── 📚 docs/                    # Documentation & Guides
├── 🧪 tests/                   # Test Files & Utilities
├── 🔧 scripts/                 # Setup & Utility Scripts
├── 🗄️ database/                # Database Schemas & Setup
├── 🖥️ backend/                 # Backend API Server
├── 💻 src/                     # Frontend Source Code
├── 🌐 public/                  # Static Assets
├── 📦 dist/                    # Build Output
├── 📄 README.md                # Main Project Documentation
├── 📄 PROJECT_STRUCTURE.md     # This File
├── 📄 .gitignore               # Git Ignore Rules
├── 📄 package.json             # Frontend Dependencies
└── 📄 vite.config.ts           # Vite Configuration
```

## 📚 **Documentation (`docs/`)**

```
docs/
├── README.md                           # 📖 Documentation Index
├── MYSQL_SETUP_GUIDE.md               # 🗄️ MySQL Database Setup
├── API_INTEGRATION_GUIDE.md           # 🌍 Tourist APIs Integration
├── PERFORMANCE_OPTIMIZATION_GUIDE.md  # ⚡ Performance Optimization
├── ADDONS_GUIDE.md                    # 🎁 Add-ons Feature Guide
├── PAYMENT_SETUP.md                   # 💳 Payment Gateway Setup
├── FIXES_SUMMARY.md                   # 🐛 Bug Fixes Summary
├── SYSTEM_HEALTH_REPORT.md            # 📊 System Health Status
└── ... (12 more documentation files)
```

## 🧪 **Tests (`tests/`)**

```
tests/
├── test-mysql-setup.html              # 🗄️ MySQL Connection Test
├── test-mysql-connection.html         # 🔗 Database Connection Test
├── test-database-connection.html      # 📊 Database Health Test
└── test-kannada.html                  # 🔤 Kannada Text Display Test
```

## 🔧 **Scripts (`scripts/`)**

```
scripts/
├── setup-mysql.js                     # 🗄️ MySQL Database Setup
└── fix-mysql-password.cjs             # 🔑 Password Configuration Fix
```

## 🗄️ **Database (`database/`)**

```
database/
├── mysql_setup.sql                    # 🗄️ MySQL Schema & Sample Data
├── database_setup.sql                 # 📊 Database Setup Script
└── schema.sql                         # 🏗️ Database Schema
```

## 🖥️ **Backend (`backend/`)**

```
backend/
├── server.js                          # 🚀 Express.js API Server
├── config.js                          # ⚙️ Database Configuration
├── package.json                       # 📦 Backend Dependencies
├── package-lock.json                  # 🔒 Dependency Lock File
├── uploads/                           # 📁 File Upload Directory
└── node_modules/                      # 📚 Backend Dependencies
```

## 💻 **Frontend Source (`src/`)**

```
src/
├── App.tsx                            # 🚀 Main Application Component
├── main.tsx                           # 🎯 Application Entry Point
├── index.css                          # 🎨 Global Styles
├── vite-env.d.ts                      # 📝 TypeScript Definitions
├── components/                        # 🧩 React Components
│   ├── admin/                         # 👨‍💼 Admin Components
│   ├── booking/                       # 🎫 Booking Components
│   ├── common/                        # 🔧 Shared Components
│   ├── destinations/                  # 🏖️ Destination Components
│   ├── Layout/                        # 🏗️ Layout Components
│   └── payment/                       # 💳 Payment Components
├── pages/                             # 📄 Page Components
├── hooks/                             # 🪝 Custom React Hooks
├── services/                          # 🌐 API Services
├── utils/                             # 🛠️ Utility Functions
├── config/                            # ⚙️ Configuration Files
├── data/                              # 📊 Sample Data
└── lib/                               # 📚 Library Files
```

## 🌐 **Public Assets (`public/`)**

```
public/
├── index.html                         # 🏠 Main HTML Template
└── tripsera-logo.png                  # 🖼️ Project Logo
```

## 📦 **Build Output (`dist/`)**

```
dist/
├── index.html                         # 🏠 Built HTML
├── tripsera-logo.png                  # 🖼️ Static Assets
└── assets/                            # 📦 Bundled Assets
    ├── *.js                           # 📜 JavaScript Bundles
    └── *.css                          # 🎨 CSS Bundles
```

## 🔧 **Configuration Files**

### **Root Level**
- `package.json` - Frontend dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS configuration

### **Backend**
- `backend/package.json` - Backend dependencies
- `backend/config.js` - Database configuration

## 🚀 **Quick Commands**

### **Development**
```bash
npm run dev                    # Start frontend development server
npm run start:backend          # Start backend API server
npm run start:full             # Start both servers simultaneously
```

### **Testing**
```bash
npm run test:connection        # Open MySQL connection test
npm run test:kannada           # Open Kannada text test
```

### **Setup**
```bash
npm run setup:db               # Run database setup script
npm run docs                   # Open documentation
```

### **Build & Deploy**
```bash
npm run build                  # Build for production
npm run preview                # Preview production build
```

## 📊 **File Organization Benefits**

### ✅ **Clean Root Directory**
- No scattered files
- Clear project structure
- Easy navigation

### ✅ **Organized Documentation**
- All guides in one place
- Easy to find information
- Professional appearance

### ✅ **Separated Concerns**
- Tests in dedicated folder
- Scripts in utility folder
- Database files organized

### ✅ **Scalable Structure**
- Easy to add new features
- Clear separation of concerns
- Maintainable codebase

## 🎯 **Best Practices**

### **File Naming**
- Use kebab-case for files: `mysql-setup.sql`
- Use PascalCase for components: `BookingInterface.tsx`
- Use camelCase for utilities: `customerTracking.ts`

### **Folder Organization**
- Group related files together
- Use descriptive folder names
- Keep root directory clean

### **Documentation**
- Keep docs in `docs/` folder
- Update documentation regularly
- Use clear, descriptive names

## 🔄 **Maintenance**

### **Regular Tasks**
- Update dependencies
- Clean build artifacts
- Organize new files properly
- Update documentation

### **File Cleanup**
- Remove unused files
- Archive old documentation
- Clean temporary files
- Update .gitignore

---

**This structure ensures a clean, organized, and maintainable project that follows industry best practices.**
