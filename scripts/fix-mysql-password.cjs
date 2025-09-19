// MySQL password fix script for Tripsera
// Enhanced password detection with better error handling

const mysql = require('mysql2/promise');

async function detectMySQLPassword() {
    try {
        console.log('🔍 Detecting MySQL password...');
        
        // Try to connect with different passwords
        const passwords = ['root', '', 'password', 'admin', 'mysql', '123456', 'root123'];
        
        for (const password of passwords) {
            try {
                console.log(`🔑 Trying password: ${password || '(empty)'}`);
                
                const connection = await mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: password,
                    connectTimeout: 5000
                });
                
                console.log(`✅ Successfully connected with password: ${password || '(empty)'}`);
                await connection.end();
                
                // Update configuration files with working password
                await updateConfigFiles(password);
                
                return password;
                
            } catch (error) {
                console.log(`❌ Failed with password: ${password || '(empty)'} - ${error.message}`);
            }
        }
        
        console.log('❌ Could not connect with any common passwords');
        console.log('\n🔧 Manual setup required:');
        console.log('1. Check if MySQL is running: mysql -u root -p');
        console.log('2. Update password in backend/config.js');
        console.log('3. Update password in src/config/database.ts');
        console.log('4. Update password in scripts/setup-mysql.js');
        
        return null;
        
    } catch (error) {
        console.error('❌ Error detecting MySQL password:', error.message);
        return null;
    }
}

async function updateConfigFiles(password) {
    try {
        console.log('📝 Updating configuration files...');
        
        // Update backend config
        const backendConfig = `
// MySQL Database Configuration
// Updated automatically by password detection script

module.exports = {
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '${password}',
    database: process.env.MYSQL_DATABASE || 'tripsera_db',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
  },
  server: {
    port: process.env.PORT || 3001
  }
};
`;
        
        const fs = require('fs');
        const path = require('path');
        
        fs.writeFileSync(path.join(__dirname, '..', 'backend', 'config.js'), backendConfig);
        console.log('✅ Updated backend/config.js');
        
        console.log('✅ Configuration files updated successfully!');
        
    } catch (error) {
        console.error('❌ Error updating config files:', error.message);
    }
}

// Run the detection
detectMySQLPassword();
