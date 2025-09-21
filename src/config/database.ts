// MySQL Database Configuration
// Replace these with your actual MySQL database credentials

export const MYSQL_CONFIG = {
  host: import.meta.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_MYSQL_PORT || '3306'),
  user: import.meta.env.VITE_MYSQL_USER || 'root',
  password: import.meta.env.VITE_MYSQL_PASSWORD || '',
  database: import.meta.env.VITE_MYSQL_DATABASE || 'tripsera_data',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Instructions for setup:
// 1. Create a .env.local file in your project root
// 2. Add the following variables:
//    VITE_MYSQL_HOST=localhost
//    VITE_MYSQL_PORT=3306
//    VITE_MYSQL_USER=root
//    VITE_MYSQL_PASSWORD=your_password
//    VITE_MYSQL_DATABASE=tripsera_db
// 3. Replace the values with your actual MySQL database credentials
// 4. Make sure MySQL server is running
// 5. Restart your development server