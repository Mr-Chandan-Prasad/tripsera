
// MySQL Database Configuration
// Updated automatically by password detection script

module.exports = {
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'tripsera_data',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
  },
  server: {
    port: process.env.PORT || 3001
  }
};
