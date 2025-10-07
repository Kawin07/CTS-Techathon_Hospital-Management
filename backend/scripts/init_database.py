import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import execute_query, execute_insert
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """Create database tables if they don't exist"""
    
    # Patients table
    patients_table = """
        CREATE TABLE IF NOT EXISTS patients (
            patient_id INT AUTO_INCREMENT PRIMARY KEY,
            patient_number VARCHAR(50) UNIQUE NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            date_of_birth DATE NOT NULL,
            gender ENUM('Male', 'Female', 'Other') NOT NULL,
            phone VARCHAR(20),
            email VARCHAR(255),
            address TEXT,
            emergency_contact_name VARCHAR(200),
            emergency_contact_phone VARCHAR(20),
            blood_type VARCHAR(5),
            allergies TEXT,
            medical_history TEXT,
            status ENUM('active', 'inactive', 'admitted', 'deleted') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_patient_number (patient_number),
            INDEX idx_status (status),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """
    
    # Oxygen stations table
    oxygen_stations_table = """
        CREATE TABLE IF NOT EXISTS oxygen_stations (
            station_id INT AUTO_INCREMENT PRIMARY KEY,
            station_name VARCHAR(100) NOT NULL,
            location VARCHAR(255) NOT NULL,
            capacity_liters DECIMAL(10,2) NOT NULL,
            current_level DECIMAL(10,2) NOT NULL DEFAULT 0,
            pressure_psi DECIMAL(8,2),
            flow_rate DECIMAL(8,2),
            status ENUM('operational', 'maintenance', 'offline') DEFAULT 'operational',
            last_refill DATETIME,
            next_maintenance DATETIME,
            supplier VARCHAR(100),
            alerts_enabled BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_station_name (station_name),
            INDEX idx_location (location),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """
    
    # Oxygen readings table
    oxygen_readings_table = """
        CREATE TABLE IF NOT EXISTS oxygen_readings (
            reading_id INT AUTO_INCREMENT PRIMARY KEY,
            station_id INT NOT NULL,
            level_liters DECIMAL(10,2) NOT NULL,
            pressure_psi DECIMAL(8,2),
            flow_rate DECIMAL(8,2),
            temperature DECIMAL(5,2),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (station_id) REFERENCES oxygen_stations(station_id) ON DELETE CASCADE,
            INDEX idx_station_timestamp (station_id, timestamp),
            INDEX idx_timestamp (timestamp)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """
    
    try:
        # Create tables
        logger.info("Creating patients table...")
        execute_query(patients_table)
        
        logger.info("Creating oxygen_stations table...")
        execute_query(oxygen_stations_table)
        
        logger.info("Creating oxygen_readings table...")
        execute_query(oxygen_readings_table)
        
        logger.info("✅ All tables created successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        return False

def insert_sample_data():
    """Insert sample data into tables"""
    try:
        # Sample patients
        patients_data = [
            ('P001', 'John', 'Doe', '1985-05-15', 'Male', '555-0101', 'john.doe@email.com', '123 Main St', 'Jane Doe', '555-0102', 'O+', 'None', 'Healthy'),
            ('P002', 'Jane', 'Smith', '1990-08-22', 'Female', '555-0201', 'jane.smith@email.com', '456 Oak Ave', 'John Smith', '555-0202', 'A+', 'Penicillin', 'Diabetes Type 1'),
            ('P003', 'Robert', 'Johnson', '1978-12-03', 'Male', '555-0301', 'robert.j@email.com', '789 Pine St', 'Mary Johnson', '555-0302', 'B-', 'None', 'Hypertension'),
        ]
        
        for patient in patients_data:
            patient_query = """
                INSERT IGNORE INTO patients 
                (patient_number, first_name, last_name, date_of_birth, gender, phone, email, address, 
                 emergency_contact_name, emergency_contact_phone, blood_type, allergies, medical_history)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            execute_insert(patient_query, list(patient))
        
        logger.info("✅ Sample patients inserted!")
        
        # Sample oxygen stations
        stations_data = [
            ('Main Station A', 'ICU Floor 1', 500.0, 450.0, 150.0, 5.0, 'operational', '2024-01-15 10:00:00', '2024-02-15 10:00:00', 'OxyGen Corp'),
            ('Emergency Station B', 'Emergency Room', 300.0, 200.0, 140.0, 3.0, 'operational', '2024-01-10 14:30:00', '2024-02-10 14:30:00', 'MedGas Ltd'),
            ('Backup Station C', 'Surgery Wing', 400.0, 380.0, 155.0, 4.5, 'maintenance', '2024-01-20 09:15:00', '2024-02-20 09:15:00', 'OxyGen Corp'),
        ]
        
        for station in stations_data:
            station_query = """
                INSERT IGNORE INTO oxygen_stations 
                (station_name, location, capacity_liters, current_level, pressure_psi, flow_rate, 
                 status, last_refill, next_maintenance, supplier)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            execute_insert(station_query, list(station))
        
        logger.info("✅ Sample oxygen stations inserted!")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error inserting sample data: {e}")
        return False

if __name__ == "__main__":
    logger.info("Initializing database...")
    
    if create_tables():
        logger.info("Tables created successfully!")
        
        if insert_sample_data():
            logger.info("Sample data inserted successfully!")
            logger.info("✅ Database initialization complete!")
        else:
            logger.error("❌ Failed to insert sample data")
    else:
        logger.error("❌ Failed to create tables")