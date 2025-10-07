import logging
from datetime import datetime
from config.database import initialize_database, test_connection, close_database
from services.patient_service import PatientService
from services.oxygen_service import OxygenService

logger = logging.getLogger(__name__)

class DatabaseService:
    """Main Database Service - Central hub for all database operations and services"""
    
    _initialized = False
    
    @classmethod
    def initialize(cls) -> bool:
        """Initialize the database connection and all services"""
        try:
            if cls._initialized:
                logger.info('Database already initialized')
                return True
            
            logger.info('Initializing database connection...')
            
            # Initialize connection pool
            initialize_database()
            
            # Test the connection
            is_connected = test_connection()
            
            if not is_connected:
                raise Exception('Failed to connect to database')
            
            cls._initialized = True
            logger.info('✅ Database service initialized successfully')
            
            return True
            
        except Exception as e:
            logger.error(f'❌ Failed to initialize database service: {e}')
            return False
    
    @classmethod
    def shutdown(cls):
        """Close all database connections"""
        try:
            close_database()
            cls._initialized = False
            logger.info('✅ Database service shut down successfully')
            
        except Exception as e:
            logger.error(f'❌ Error during database shutdown: {e}')
    
    @classmethod
    def is_initialized(cls) -> bool:
        """Check if database service is initialized"""
        return cls._initialized
    
    @classmethod
    def health_check(cls) -> dict:
        """Test database connectivity"""
        try:
            is_healthy = test_connection()
            
            return {
                'status': 'healthy' if is_healthy else 'unhealthy',
                'message': 'Database connection is working' if is_healthy else 'Database connection failed',
                'timestamp': str(datetime.now())
            }
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'message': str(e),
                'timestamp': str(datetime.now())
            }
    
    @classmethod
    def get_system_stats(cls) -> dict:
        """Get database statistics"""
        try:
            patient_stats = PatientService.get_statistics()
            oxygen_stats = OxygenService.get_statistics()
            
            return {
                'patients': patient_stats.data if patient_stats.success else None,
                'oxygen': oxygen_stats.data if oxygen_stats.success else None,
                'timestamp': str(datetime.now())
            }
            
        except Exception as e:
            logger.error(f'Error getting system stats: {e}')
            return {
                'patients': None,
                'oxygen': None,
                'timestamp': str(datetime.now())
            }