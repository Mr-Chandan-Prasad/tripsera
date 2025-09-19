// MySQL setup script for Tripsera
// Complete setup with password detection and error handling

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function findMySQLPassword() {
    const passwords = ['root', '', 'password', 'admin', 'mysql'];
    
    for (const password of passwords) {
        try {
            const connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: password,
                multipleStatements: true
            });
            
            console.log(`✅ Found working password: ${password || '(empty)'}`);
            await connection.end();
            return password;
        } catch (error) {
            console.log(`❌ Failed with password: ${password || '(empty)'}`);
        }
    }
    
    throw new Error('Could not connect to MySQL with any common passwords');
}

async function setupMySQL() {
    try {
        console.log('🔍 Detecting MySQL password...');
        const password = await findMySQLPassword();
        
        console.log('📖 Reading SQL setup file...');
        const sqlFile = path.join(__dirname, '..', 'database', 'mysql_setup.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('🔌 Connecting to MySQL server...');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: password,
            multipleStatements: true
        });
        
        console.log('✅ Connected to MySQL server successfully!');
        
        console.log('🏗️ Setting up database and tables...');
        await connection.execute(sqlContent);
        console.log('✅ Database setup completed successfully!');
        
        console.log('📊 Verifying tables...');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`✅ Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
        
        await connection.end();
        console.log('🔌 Connection closed');
        
        console.log('\n🎉 MySQL setup completed successfully!');
        console.log('📋 Next steps:');
        console.log('1. Start the backend server: npm run start:backend');
        console.log('2. Start the frontend: npm run dev');
        console.log('3. Visit: http://localhost:5174');
        
    } catch (error) {
        console.error('❌ Error setting up MySQL:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure MySQL is installed and running');
        console.log('2. Check if MySQL service is started');
        console.log('3. Try running: mysql -u root -p');
        console.log('4. Update password in scripts/setup-mysql.js if needed');
    }
}

// Run the setup
setupMySQL();
