import { initializeDatabase, testConnection, closeDatabase } from '../config/database';
import { PatientService } from './PatientService';
import { OxygenService } from './OxygenService';

// Re-export all services for easy importing
export { PatientService } from './PatientService';
export { OxygenService } from './OxygenService';

/**
 * Main Database Service
 * Central hub for all database operations and services
 */
export class DatabaseService {
  private static initialized = false;

  /**
   * Initialize the database connection and all services
   */
  static async initialize(): Promise<boolean> {
    try {
      if (this.initialized) {
        console.log('Database already initialized');
        return true;
      }

      console.log('Initializing database connection...');
      
      // Initialize connection pool
      initializeDatabase();
      
      // Test the connection
      const isConnected = await testConnection();
      
      if (!isConnected) {
        throw new Error('Failed to connect to database');
      }

      this.initialized = true;
      console.log('✅ Database service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize database service:', error);
      return false;
    }
  }

  /**
   * Close all database connections
   */
  static async shutdown(): Promise<void> {
    try {
      await closeDatabase();
      this.initialized = false;
      console.log('✅ Database service shut down successfully');
    } catch (error) {
      console.error('❌ Error during database shutdown:', error);
    }
  }

  /**
   * Check if database service is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Test database connectivity
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    timestamp: Date;
  }> {
    try {
      const isHealthy = await testConnection();
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        message: isHealthy ? 'Database connection is working' : 'Database connection failed',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown database error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get database statistics
   */
  static async getSystemStats(): Promise<{
    patients: any;
    oxygen: any;
    timestamp: Date;
  }> {
    try {
      const [patientStats, oxygenStats] = await Promise.all([
        PatientService.getStatistics(),
        OxygenService.getStatistics()
      ]);

      return {
        patients: patientStats.success ? patientStats.data : null,
        oxygen: oxygenStats.success ? oxygenStats.data : null,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {
        patients: null,
        oxygen: null,
        timestamp: new Date()
      };
    }
  }
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down database service...');
  await DatabaseService.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down database service...');
  await DatabaseService.shutdown();
  process.exit(0);
});

export default DatabaseService;