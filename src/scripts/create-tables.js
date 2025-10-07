import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management'
};

const databaseName = process.env.DB_NAME || 'hospital_management';

async function createTables() {
  let connection = null;
  
  try {
    console.log('🏥 Creating Hospital Management Database...');
    
    // Connect to MySQL server without database first
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    connection = await mysql.createConnection(tempConfig);
    
    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${databaseName}' created`);
    
    // Close connection and reconnect with database
    await connection.end();
    connection = await mysql.createConnection(dbConfig);
    
    // Create fhir_patients table
    await connection.query('CREATE TABLE IF NOT EXISTS fhir_patients (id INT PRIMARY KEY AUTO_INCREMENT, identifier VARCHAR(64) UNIQUE, family_name VARCHAR(100) NOT NULL, given_name VARCHAR(100) NOT NULL, birth_date DATE NOT NULL, gender ENUM("male", "female", "other", "unknown") NOT NULL, phone VARCHAR(20), email VARCHAR(255), address_line VARCHAR(255), address_city VARCHAR(100), address_state VARCHAR(100), address_postal_code VARCHAR(20), address_country VARCHAR(100), contact_name VARCHAR(200), contact_phone VARCHAR(20), contact_relationship VARCHAR(100), deceased BOOLEAN DEFAULT FALSE, marital_status VARCHAR(50), communication_language VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
    console.log('✅ fhir_patients table created');

    // Create staff table
    await connection.query('CREATE TABLE IF NOT EXISTS staff (staff_id INT PRIMARY KEY AUTO_INCREMENT, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, position VARCHAR(100) NOT NULL, department VARCHAR(100), email VARCHAR(255), phone VARCHAR(20), status ENUM("active", "inactive", "on_leave") DEFAULT "active", created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    console.log('✅ staff table created');

    // Create beds table
    await connection.query('CREATE TABLE IF NOT EXISTS beds (bed_id INT PRIMARY KEY AUTO_INCREMENT, bed_number VARCHAR(20) UNIQUE NOT NULL, ward VARCHAR(100), bed_type ENUM("standard", "icu", "private", "shared") DEFAULT "standard", status ENUM("available", "occupied", "maintenance", "reserved") DEFAULT "available", assigned_staff_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
    console.log('✅ beds table created');

    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Created tables:', tables.map(row => Object.values(row)[0]).join(', '));
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTables();