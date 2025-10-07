import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
  reconnect: boolean;
  charset: string;
  timezone: string;
}

// Default database configuration
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'hospital_management',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: 'Z'
};

// Create connection pool
const pool: mysql.Pool = mysql.createPool(dbConfig);
console.log('✅ MySQL connection pool created');

export const initializeDatabase = (): mysql.Pool => {
  return pool;
};

export const getDatabase = (): mysql.Pool => {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
};

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    console.log('✅ MySQL connection pool closed');
  }
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Execute query with error handling
export const executeQuery = async <T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> => {
  try {
    const db = getDatabase();
    const [rows] = await db.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Execute transaction
export const executeTransaction = async <T = any>(
  queries: { query: string; params: any[] }[]
): Promise<T[]> => {
  const connection = await getDatabase().getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results: T[] = [];
    for (const { query, params } of queries) {
      const [rows] = await connection.execute(query, params);
      results.push(rows as T);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  testConnection,
  executeQuery,
  executeTransaction,
  dbConfig
};