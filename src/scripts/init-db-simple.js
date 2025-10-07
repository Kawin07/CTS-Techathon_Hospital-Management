import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const databaseName = process.env.DB_NAME || 'hospital_management';

async function initializeDatabase() {
  let connection = null;
  
  try {
    console.log('🏥 Creating Hospital Management Database...');
    
    // Connect to MySQL server
    connection = await mysql.createConnection(dbConfig);
    
    // Create database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${databaseName}' created`);
    
    // Switch to database
    await connection.execute(`USE \`${databaseName}\``);
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.warn('Warning:', error.message);
          }
        }
      }
    }
    
    console.log('✅ Database schema created successfully');
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
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

initializeDatabase();