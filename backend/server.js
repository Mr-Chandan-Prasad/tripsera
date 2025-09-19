const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Import configuration
const config = require('./config');

// MySQL Database Configuration
const dbConfig = config.mysql;
const PORT = config.server.port;

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MySQL API is running' });
});

// Generic CRUD operations for all tables
const tables = ['destinations', 'services', 'bookings', 'addons', 'booking_addons', 'gallery', 'testimonials', 'advertisements', 'offers', 'inquiries', 'site_settings'];

// GET all records from a table
app.get('/api/:table', (req, res) => {
  const table = req.params.table;
  
  if (!tables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  const query = `SELECT * FROM ${table}`;
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error(`Error fetching from ${table}:`, err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// GET single record by ID
app.get('/api/:table/:id', (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  
  if (!tables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  const query = `SELECT * FROM ${table} WHERE id = ?`;
  
  pool.query(query, [id], (err, results) => {
    if (err) {
      console.error(`Error fetching from ${table}:`, err);
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// POST - Create new record
app.post('/api/:table', (req, res) => {
  const table = req.params.table;
  
  if (!tables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  const data = req.body;
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map(() => '?').join(', ');

  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
  
  pool.query(query, values, (err, results) => {
    if (err) {
      console.error(`Error inserting into ${table}:`, err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ 
        id: results.insertId, 
        message: 'Record created successfully',
        data: { ...data, id: results.insertId }
      });
    }
  });
});

// PUT - Update record
app.put('/api/:table/:id', (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  
  if (!tables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  const data = req.body;
  const columns = Object.keys(data);
  const values = Object.values(data);
  const setClause = columns.map(col => `${col} = ?`).join(', ');

  const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
  
  pool.query(query, [...values, id], (err, results) => {
    if (err) {
      console.error(`Error updating ${table}:`, err);
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.json({ 
        message: 'Record updated successfully',
        affectedRows: results.affectedRows
      });
    }
  });
});

// DELETE - Delete record
app.delete('/api/:table/:id', (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  
  if (!tables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  const query = `DELETE FROM ${table} WHERE id = ?`;
  
  pool.query(query, [id], (err, results) => {
    if (err) {
      console.error(`Error deleting from ${table}:`, err);
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.json({ 
        message: 'Record deleted successfully',
        affectedRows: results.affectedRows
      });
    }
  });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    message: 'File uploaded successfully',
    fileUrl: fileUrl,
    filename: req.file.filename
  });
});

// Test database connection
app.get('/api/test-connection', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection failed:', err);
      res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed',
        error: err.message
      });
    } else {
      connection.release();
      res.json({ 
        status: 'success', 
        message: 'Database connection successful',
        config: {
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database
        }
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MySQL API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Test connection: http://localhost:${PORT}/api/test-connection`);
  
  // Test database connection on startup
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
      console.log('💡 Make sure MySQL is running and database exists');
    } else {
      console.log('✅ Database connection successful');
      connection.release();
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 MySQL API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️ Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
});

module.exports = app;