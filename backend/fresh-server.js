const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3003; // Use a different port

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'tripsera_db',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fresh server is running',
    timestamp: new Date().toISOString()
  });
});

// Destinations endpoint
app.get('/api/destinations', (req, res) => {
  const query = 'SELECT * FROM destinations';
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching destinations:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Services endpoint
app.get('/api/services', (req, res) => {
  const query = 'SELECT * FROM services';
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching services:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Fresh server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
});

module.exports = app;
