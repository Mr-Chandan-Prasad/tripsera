// Quick MySQL test
const mysql = require('mysql2/promise');

async function testMySQL() {
  try {
    console.log('🔍 Testing MySQL connection...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'tripsera_db'
    });
    
    console.log('✅ MySQL connected successfully!');
    
    // Test a simple query
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('📊 Tables found:', rows.length);
    
    await connection.end();
    console.log('🎉 MySQL is ready to use!');
    
  } catch (error) {
    console.log('❌ MySQL error:', error.message);
  }
}

testMySQL();
