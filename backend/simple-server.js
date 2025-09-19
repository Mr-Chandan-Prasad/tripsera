const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('uploads'));

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

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.log('❌ MySQL Connection Error:', err.message);
  } else {
    console.log('✅ MySQL Connected successfully!');
    connection.release();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MySQL API is running',
    timestamp: new Date().toISOString()
  });
});

// Generic CRUD operations for all tables
const tables = ['destinations', 'services', 'bookings', 'addons', 'booking_addons', 'gallery', 'testimonials', 'advertisements', 'offers', 'inquiries', 'site_settings'];

tables.forEach(table => {
  // GET all records
  app.get(`/api/${table}`, (req, res) => {
    const query = `SELECT * FROM ${table}`;
    pool.query(query, (err, results) => {
      if (err) {
        console.error(`Error fetching ${table}:`, err);
        res.status(500).json({ error: err.message });
      } else {
        res.json(results);
      }
    });
  });

  // GET single record
  app.get(`/api/${table}/:id`, (req, res) => {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    pool.query(query, [req.params.id], (err, results) => {
      if (err) {
        console.error(`Error fetching ${table} ${req.params.id}:`, err);
        res.status(500).json({ error: err.message });
      } else {
        res.json(results[0] || null);
      }
    });
  });

  // POST create record
  app.post(`/api/${table}`, (req, res) => {
    const data = req.body;
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    pool.query(query, values, (err, results) => {
      if (err) {
        console.error(`Error creating ${table}:`, err);
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: results.insertId, ...data });
      }
    });
  });

  // PUT update record
  app.put(`/api/${table}/:id`, (req, res) => {
    const data = req.body;
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    
    pool.query(query, [...values, req.params.id], (err, results) => {
      if (err) {
        console.error(`Error updating ${table} ${req.params.id}:`, err);
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: req.params.id, ...data });
      }
    });
  });

  // DELETE record
  app.delete(`/api/${table}/:id`, (req, res) => {
    const query = `DELETE FROM ${table} WHERE id = ?`;
    pool.query(query, [req.params.id], (err, results) => {
      if (err) {
        console.error(`Error deleting ${table} ${req.params.id}:`, err);
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Record deleted successfully' });
      }
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 MySQL API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
  console.log(`📋 Available endpoints:`);
  tables.forEach(table => {
    console.log(`   - GET/POST/PUT/DELETE /api/${table}`);
  });
});

module.exports = app;
