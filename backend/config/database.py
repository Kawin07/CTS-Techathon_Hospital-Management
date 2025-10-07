import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling, Error
from typing import Optional, Dict, Any, List, Tuple
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Database configuration class"""
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = int(os.getenv('DB_PORT', '3306'))
        self.user = os.getenv('DB_USER', 'root')
        # Handle empty password from environment
        password_env = os.getenv('DB_PASSWORD', 'Kawin@2005')
        self.password = password_env if password_env else None
        self.database = os.getenv('DB_NAME', 'healthcare_db')
        self.charset = 'utf8mb4'
        self.pool_name = 'hospital_pool'
        self.pool_size = 10
        self.pool_reset_session = True

class DatabaseManager:
    """Database connection manager with connection pooling"""
    
    def __init__(self):
        self.config = DatabaseConfig()
        self.pool: Optional[pooling.MySQLConnectionPool] = None
        self._validate_config()
        self._initialize_pool()
    
    def _validate_config(self):
        """Validate database configuration"""
        if not self.config.password or self.config.password == 'your_mysql_password_here':
            logger.error('❌ Database password not configured!')
            logger.error('Please update DB_PASSWORD in backend/.env file with your MySQL root password')
            logger.error('Run: python setup_database.py to configure the database connection')
            logger.error('Or manually edit backend/.env and set: DB_PASSWORD=your_actual_password')
            raise ValueError('Database password not configured. Please run: python setup_database.py')
    
    def _initialize_pool(self):
        """Initialize MySQL connection pool"""
        try:
            pool_config = {
                'pool_name': self.config.pool_name,
                'pool_size': self.config.pool_size,
                'pool_reset_session': self.config.pool_reset_session,
                'host': self.config.host,
                'port': self.config.port,
                'user': self.config.user,
                'database': self.config.database,
                'charset': self.config.charset,
                'autocommit': False,
                'time_zone': '+00:00'
            }
            
            # Only add password if it's not None/empty
            if self.config.password is not None:
                pool_config['password'] = self.config.password
            
            self.pool = pooling.MySQLConnectionPool(**pool_config)
            logger.info('✅ MySQL connection pool created')
            
        except Error as e:
            logger.error(f'❌ Error creating connection pool: {e}')
            raise
    
    def get_connection(self):
        """Get a connection from the pool"""
        if not self.pool:
            raise Exception('Database pool not initialized')
        
        try:
            return self.pool.get_connection()
        except Error as e:
            logger.error(f'Error getting connection from pool: {e}')
            raise
    
    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            with self.get_connection() as connection:
                cursor = connection.cursor()
                cursor.execute('SELECT 1 as test')
                cursor.fetchone()
                cursor.close()
            logger.info('✅ Database connection successful')
            return True
        except Error as e:
            logger.error(f'❌ Database connection failed: {e}')
            return False
    
    def execute_query(self, query: str, params: Optional[List] = None) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results as list of dictionaries"""
        try:
            with self.get_connection() as connection:
                cursor = connection.cursor(dictionary=True)
                cursor.execute(query, params or [])
                results = cursor.fetchall()
                cursor.close()
                return results
        except Error as e:
            logger.error(f'Database query error: {e}')
            raise
    
    def execute_insert(self, query: str, params: Optional[List] = None) -> int:
        """Execute an INSERT query and return the last insert ID"""
        try:
            with self.get_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(query, params or [])
                connection.commit()
                last_id = cursor.lastrowid
                cursor.close()
                return last_id
        except Error as e:
            logger.error(f'Database insert error: {e}')
            connection.rollback()
            raise
    
    def execute_update(self, query: str, params: Optional[List] = None) -> int:
        """Execute an UPDATE/DELETE query and return affected rows"""
        try:
            with self.get_connection() as connection:
                cursor = connection.cursor()
                cursor.execute(query, params or [])
                connection.commit()
                affected_rows = cursor.rowcount
                cursor.close()
                return affected_rows
        except Error as e:
            logger.error(f'Database update error: {e}')
            connection.rollback()
            raise
    
    def execute_transaction(self, queries: List[Tuple[str, Optional[List]]]) -> List[Any]:
        """Execute multiple queries in a transaction"""
        connection = self.get_connection()
        try:
            connection.start_transaction()
            cursor = connection.cursor(dictionary=True)
            results = []
            
            for query, params in queries:
                cursor.execute(query, params or [])
                if query.strip().upper().startswith('SELECT'):
                    results.append(cursor.fetchall())
                else:
                    results.append(cursor.rowcount)
            
            connection.commit()
            cursor.close()
            return results
            
        except Error as e:
            connection.rollback()
            logger.error(f'Transaction error: {e}')
            raise
        finally:
            connection.close()
    
    def close_pool(self):
        """Close all connections in the pool"""
        if self.pool:
            # MySQL connector doesn't have a direct method to close pool
            # Connections will be closed when pool goes out of scope
            self.pool = None
            logger.info('✅ MySQL connection pool closed')

# Global database manager instance
db_manager = DatabaseManager()

def get_database() -> DatabaseManager:
    """Get the global database manager instance"""
    return db_manager

def initialize_database() -> DatabaseManager:
    """Initialize and return database manager"""
    return db_manager

def test_connection() -> bool:
    """Test database connection"""
    return db_manager.test_connection()

def close_database():
    """Close database connections"""
    db_manager.close_pool()

def execute_query(query: str, params: Optional[List] = None) -> List[Dict[str, Any]]:
    """Execute query using global database manager"""
    return db_manager.execute_query(query, params)

def execute_insert(query: str, params: Optional[List] = None) -> int:
    """Execute insert using global database manager"""
    return db_manager.execute_insert(query, params)

def execute_update(query: str, params: Optional[List] = None) -> int:
    """Execute update using global database manager"""
    return db_manager.execute_update(query, params)

def execute_transaction(queries: List[Tuple[str, Optional[List]]]) -> List[Any]:
    """Execute transaction using global database manager"""
    return db_manager.execute_transaction(queries)
