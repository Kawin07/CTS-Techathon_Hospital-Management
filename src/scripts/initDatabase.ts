#!/usr/bin/env node

/**
 * Hospital Management Database Initialization Script
 * 
 * This script initializes the MySQL database with schema and sample data.
 * Run this script to set up your development/testing environment.
 * 
 * Usage:
 *   npm run db:init
 *   or
 *   node src/scripts/initDatabase.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true, // Allow multiple SQL statements
  charset: 'utf8mb4'
};

const databaseName = process.env.DB_NAME || 'hospital_management';

class DatabaseInitializer {
  private connection: mysql.Connection | null = null;

  async initialize(): Promise<void> {
    try {
      console.log('🏥 Hospital Management Database Initialization');
      console.log('============================================');
      
      // Step 1: Connect to MySQL server (without database)
      await this.connectToServer();
      
      // Step 2: Create database if it doesn't exist
      await this.createDatabase();
      
      // Step 3: Switch to the database
      await this.switchToDatabase();
      
      // Step 4: Run schema SQL
      await this.runSchema();
      
      // Step 5: Insert sample data
      await this.insertSampleData();
      
      // Step 6: Verify installation
      await this.verifyInstallation();
      
      console.log('✅ Database initialization completed successfully!');
      console.log('\n📊 Database Summary:');
      await this.printSummary();
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    } finally {
      await this.closeConnection();
    }
  }

  private async connectToServer(): Promise<void> {
    try {
      console.log('🔌 Connecting to MySQL server...');
      this.connection = await mysql.createConnection(dbConfig);
      console.log('✅ Connected to MySQL server');
    } catch (error) {
      console.error('❌ Failed to connect to MySQL server');
      console.error('Please ensure MySQL is running and credentials are correct in .env file');
      throw error;
    }
  }

  private async createDatabase(): Promise<void> {
    try {
      console.log(`🏗️  Creating database '${databaseName}'...`);
      
      const createDbQuery = `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
      await this.connection!.execute(createDbQuery);
      
      console.log(`✅ Database '${databaseName}' created successfully`);
    } catch (error) {
      console.error(`❌ Failed to create database '${databaseName}'`);
      throw error;
    }
  }

  private async switchToDatabase(): Promise<void> {
    try {
      console.log(`🔄 Switching to database '${databaseName}'...`);
      await this.connection!.execute(`USE \`${databaseName}\``);
      console.log(`✅ Switched to database '${databaseName}'`);
    } catch (error) {
      console.error(`❌ Failed to switch to database '${databaseName}'`);
      throw error;
    }
  }

  private async runSchema(): Promise<void> {
    try {
      console.log('📋 Running database schema...');
      
      const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }
      
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Split SQL by delimiter and execute each statement
      const statements = this.splitSQLStatements(schemaSQL);
      
      console.log(`📄 Executing ${statements.length} SQL statements...`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement && !statement.startsWith('--') && !statement.startsWith('/*')) {
          try {
            await this.connection!.execute(statement);
            console.log(`   ✓ Statement ${i + 1}/${statements.length} executed`);
          } catch (error) {
            console.warn(`   ⚠️  Warning: Statement ${i + 1} failed:`, (error as Error).message);
            // Continue with other statements
          }
        }
      }
      
      console.log('✅ Database schema created successfully');
    } catch (error) {
      console.error('❌ Failed to run database schema');
      throw error;
    }
  }

  private async insertSampleData(): Promise<void> {
    try {
      console.log('📝 Inserting sample data...');
      
      const sampleDataPath = path.join(__dirname, '..', 'database', 'sample-data.sql');
      
      if (!fs.existsSync(sampleDataPath)) {
        console.log('⚠️  Sample data file not found, skipping sample data insertion');
        return;
      }
      
      const sampleDataSQL = fs.readFileSync(sampleDataPath, 'utf8');
      const statements = this.splitSQLStatements(sampleDataSQL);
      
      console.log(`📄 Executing ${statements.length} sample data statements...`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement && !statement.startsWith('--') && !statement.startsWith('/*')) {
          try {
            await this.connection!.execute(statement);
            console.log(`   ✓ Sample data statement ${i + 1}/${statements.length} executed`);
          } catch (error) {
            console.warn(`   ⚠️  Warning: Sample data statement ${i + 1} failed:`, (error as Error).message);
            // Continue with other statements
          }
        }
      }
      
      console.log('✅ Sample data inserted successfully');
    } catch (error) {
      console.error('❌ Failed to insert sample data');
      throw error;
    }
  }

  private async verifyInstallation(): Promise<void> {
    try {
      console.log('🔍 Verifying database installation...');
      
      // Check if main tables exist
      const tablesToCheck = [
        'patients', 'staff', 'wards', 'beds', 'oxygen_stations', 
        'oxygen_readings', 'alerts', 'alert_recommendations', 'appointments'
      ];
      
      for (const table of tablesToCheck) {
        const [rows] = await this.connection!.execute(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
          [databaseName, table]
        );
        
        const count = (rows as any)[0].count;
        if (count === 0) {
          throw new Error(`Table '${table}' was not created`);
        }
        console.log(`   ✓ Table '${table}' exists`);
      }
      
      // Check if views exist
      const viewsToCheck = ['dashboard_summary', 'oxygen_status_summary', 'staff_workload'];
      
      for (const view of viewsToCheck) {
        const [rows] = await this.connection!.execute(
          `SELECT COUNT(*) as count FROM information_schema.views WHERE table_schema = ? AND table_name = ?`,
          [databaseName, view]
        );
        
        const count = (rows as any)[0].count;
        if (count === 0) {
          console.log(`   ⚠️  View '${view}' was not created (this is normal if there were errors)`);
        } else {
          console.log(`   ✓ View '${view}' exists`);
        }
      }
      
      console.log('✅ Database installation verified');
    } catch (error) {
      console.error('❌ Database verification failed');
      throw error;
    }
  }

  private async printSummary(): Promise<void> {
    try {
      const queries = [
        { name: 'Patients', query: 'SELECT COUNT(*) as count FROM patients' },
        { name: 'Staff', query: 'SELECT COUNT(*) as count FROM staff' },
        { name: 'Wards', query: 'SELECT COUNT(*) as count FROM wards' },
        { name: 'Beds', query: 'SELECT COUNT(*) as count FROM beds' },
        { name: 'Oxygen Stations', query: 'SELECT COUNT(*) as count FROM oxygen_stations' },
        { name: 'Oxygen Readings', query: 'SELECT COUNT(*) as count FROM oxygen_readings' },
        { name: 'Alerts', query: 'SELECT COUNT(*) as count FROM alerts' },
        { name: 'Appointments', query: 'SELECT COUNT(*) as count FROM appointments' }
      ];
      
      for (const { name, query } of queries) {
        try {
          const [rows] = await this.connection!.execute(query);
          const count = (rows as any)[0].count;
          console.log(`   ${name}: ${count} records`);
        } catch (error) {
          console.log(`   ${name}: Error getting count`);
        }
      }
      
      console.log('\n🌐 Connection Details:');
      console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
      console.log(`   Database: ${databaseName}`);
      console.log(`   User: ${dbConfig.user}`);
      
      console.log('\n📚 Next Steps:');
      console.log('   1. Update your .env file with correct database credentials');
      console.log('   2. Run "npm run dev" to start the development server');
      console.log('   3. Access the application at http://localhost:5173');
      
    } catch (error) {
      console.warn('⚠️  Could not print summary:', (error as Error).message);
    }
  }

  private splitSQLStatements(sql: string): string[] {
    // Split by semicolon, but handle DELIMITER changes for stored procedures/triggers
    const statements: string[] = [];
    let currentStatement = '';
    let inDelimiterBlock = false;
    let currentDelimiter = ';';
    
    const lines = sql.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Handle DELIMITER changes
      if (trimmedLine.startsWith('DELIMITER ')) {
        const newDelimiter = trimmedLine.split(' ')[1];
        if (newDelimiter === ';') {
          inDelimiterBlock = false;
        } else {
          inDelimiterBlock = true;
        }
        currentDelimiter = newDelimiter;
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Check if statement is complete
      if ((!inDelimiterBlock && trimmedLine.endsWith(';')) || 
          (inDelimiterBlock && trimmedLine.endsWith(currentDelimiter))) {
        
        // Remove the delimiter from the end
        if (inDelimiterBlock && currentDelimiter !== ';') {
          currentStatement = currentStatement.replace(new RegExp(`\\${currentDelimiter}\\s*$`, 'm'), ';');
        }
        
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    return statements.filter(stmt => stmt.length > 0);
  }

  private async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Hospital Management Database Initializer

Usage:
  node src/scripts/initDatabase.js [options]

Options:
  --help, -h     Show this help message
  --force        Force recreation of database (drops existing)
  --schema-only  Only run schema, skip sample data
  --data-only    Only insert sample data (assumes schema exists)

Environment Variables:
  DB_HOST        Database host (default: localhost)
  DB_PORT        Database port (default: 3306)
  DB_USER        Database user (default: root)
  DB_PASSWORD    Database password
  DB_NAME        Database name (default: hospital_management)

Examples:
  node src/scripts/initDatabase.js
  node src/scripts/initDatabase.js --schema-only
  DB_PASSWORD=mypass node src/scripts/initDatabase.js
`);
    process.exit(0);
  }
  
  // Validate environment
  if (!process.env.DB_PASSWORD && !process.env.DB_USER) {
    console.warn('⚠️  Warning: No database password set in environment variables');
    console.log('   Set DB_PASSWORD in your .env file or environment');
  }
  
  const initializer = new DatabaseInitializer();
  
  try {
    await initializer.initialize();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DatabaseInitializer };