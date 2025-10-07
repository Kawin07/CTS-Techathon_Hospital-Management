-- Hospital Management System Database Schema
-- Created: September 2025
-- Database: MySQL 8.0+

-- Create database (run this first)
-- CREATE DATABASE IF NOT EXISTS hospital_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE hospital_management;

-- ============================================================================
-- PATIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS fhir_patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(64) UNIQUE, -- FHIR identifier
    family_name VARCHAR(100) NOT NULL, -- FHIR: name.family
    given_name VARCHAR(100) NOT NULL,  -- FHIR: name.given
    birth_date DATE NOT NULL,          -- FHIR: birthDate
    gender ENUM('male', 'female', 'other', 'unknown') NOT NULL, -- FHIR: gender
    phone VARCHAR(20),                 -- FHIR: telecom (system=phone)
    email VARCHAR(255),                -- FHIR: telecom (system=email)
    address_line VARCHAR(255),         -- FHIR: address.line
    address_city VARCHAR(100),         -- FHIR: address.city
    address_state VARCHAR(100),        -- FHIR: address.state
    address_postal_code VARCHAR(20),   -- FHIR: address.postalCode
    address_country VARCHAR(100),      -- FHIR: address.country
    contact_name VARCHAR(200),         -- FHIR: contact.name.text
    contact_phone VARCHAR(20),         -- FHIR: contact.telecom
    contact_relationship VARCHAR(100), -- FHIR: contact.relationship
    deceased BOOLEAN DEFAULT FALSE,    -- FHIR: deceasedBoolean
    marital_status VARCHAR(50),        -- FHIR: maritalStatus
    communication_language VARCHAR(50),-- FHIR: communication.language
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- STAFF TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS fhir_staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(64) UNIQUE,         -- FHIR: identifier
    family_name VARCHAR(100) NOT NULL,     -- FHIR: name.family
    given_name VARCHAR(100) NOT NULL,      -- FHIR: name.given
    gender ENUM('male', 'female', 'other', 'unknown'), -- FHIR: gender
    birth_date DATE,                       -- FHIR: birthDate (optional)
    telecom_phone VARCHAR(20),             -- FHIR: telecom (system=phone)
    telecom_email VARCHAR(255),            -- FHIR: telecom (system=email)
    address_line VARCHAR(255),             -- FHIR: address.line
    address_city VARCHAR(100),             -- FHIR: address.city
    address_state VARCHAR(100),            -- FHIR: address.state
    address_postal_code VARCHAR(20),       -- FHIR: address.postalCode
    address_country VARCHAR(100),          -- FHIR: address.country
    department VARCHAR(100),               -- FHIR: PractitionerRole.organization/department
    role VARCHAR(100),                     -- FHIR: PractitionerRole.code
    status ENUM('active', 'inactive', 'on-leave') DEFAULT 'active', -- FHIR: PractitionerRole.active
    qualification TEXT,                    -- FHIR: qualification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ============================================================================
-- WARDS AND BEDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS fhir_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(64) UNIQUE,         -- FHIR: identifier
    name VARCHAR(100) NOT NULL,            -- FHIR: name (e.g., "ICU Bed 1")
    type VARCHAR(50),                      -- FHIR: type (e.g., "bed", "ward")
    status ENUM('active', 'suspended', 'inactive') DEFAULT 'active', -- FHIR: status
    ward_name VARCHAR(100),                -- FHIR: partOf (reference to parent ward)
    bed_type VARCHAR(50),                  -- FHIR: physicalType (e.g., "bed")
    floor_number INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- CREATE TABLE IF NOT EXISTS beds (
--     bed_id INT PRIMARY KEY AUTO_INCREMENT,
--     bed_number VARCHAR(20) NOT NULL,
--     ward_id INT NOT NULL,
--     bed_type ENUM('Standard', 'ICU', 'Emergency', 'Isolation', 'Maternity') NOT NULL,
--     status ENUM('available', 'occupied', 'maintenance', 'reserved') DEFAULT 'available',
--     patient_id INT NULL,
--     assigned_staff_id INT NULL,
--     last_cleaned DATETIME,
--     equipment_status TEXT,
--     notes TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (ward_id) REFERENCES wards(ward_id) ON DELETE CASCADE,
--     FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE SET NULL,
--     FOREIGN KEY (assigned_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
--     UNIQUE KEY unique_bed_ward (bed_number, ward_id),
--     INDEX idx_status (status),
--     INDEX idx_bed_type (bed_type),
--     INDEX idx_patient_id (patient_id)
-- );
CREATE TABLE IF NOT EXISTS fhir_encounters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(64) UNIQUE,         -- FHIR: identifier
    status ENUM('planned', 'arrived', 'in-progress', 'onleave', 'finished', 'cancelled') DEFAULT 'planned', -- FHIR: status
    class VARCHAR(50),                     -- FHIR: class (e.g., "inpatient", "emergency")
    patient_id INT NOT NULL,               -- FHIR: subject (reference to fhir_patients)
    practitioner_id INT,                   -- FHIR: participant (reference to fhir_practitioners)
    location_id INT,                       -- FHIR: location (reference to fhir_locations)
    period_start DATETIME,                 -- FHIR: period.start
    period_end DATETIME,                   -- FHIR: period.end
    reason TEXT,                           -- FHIR: reasonCode
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES fhir_patients(id) ON DELETE CASCADE,
    FOREIGN KEY (practitioner_id) REFERENCES fhir_practitioners(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES fhir_locations(id) ON DELETE SET NULL
);
-- ============================================================================
-- OXYGEN MONITORING
-- ============================================================================
CREATE TABLE IF NOT EXISTS fhir_observations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(64) UNIQUE,         -- FHIR: identifier
    status ENUM('registered', 'preliminary', 'final', 'amended') DEFAULT 'final', -- FHIR: status
    category VARCHAR(50),                  -- FHIR: category (e.g., "vital-signs", "laboratory")
    code VARCHAR(100),                     -- FHIR: code (e.g., "oxygen-saturation")
    subject_id INT,                        -- FHIR: subject (reference to fhir_patients)
    encounter_id INT,                      -- FHIR: encounter (reference to fhir_encounters)
    performer_id INT,                      -- FHIR: performer (reference to fhir_practitioners)
    value_quantity DECIMAL(10, 2),         -- FHIR: valueQuantity.value (e.g., oxygen level)
    value_unit VARCHAR(20),                -- FHIR: valueQuantity.unit (e.g., "%", "L/min")
    effective_datetime DATETIME,           -- FHIR: effectiveDateTime
    issued DATETIME,                       -- FHIR: issued
    interpretation VARCHAR(50),            -- FHIR: interpretation (e.g., "normal", "critical")
    notes TEXT,                            -- FHIR: note
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES fhir_patients(id) ON DELETE SET NULL,
    FOREIGN KEY (encounter_id) REFERENCES fhir_encounters(id) ON DELETE SET NULL,
    FOREIGN KEY (performer_id) REFERENCES fhir_practitioners(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS oxygen_readings (
    reading_id INT PRIMARY KEY AUTO_INCREMENT,
    station_id INT NOT NULL,
    oxygen_level DECIMAL(5, 2) NOT NULL,
    pressure_psi DECIMAL(8, 2),
    flow_rate DECIMAL(8, 2),
    temperature DECIMAL(5, 2),
    reading_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by_staff_id INT,
    notes TEXT,
    FOREIGN KEY (station_id) REFERENCES oxygen_stations(station_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    INDEX idx_station_timestamp (station_id, reading_timestamp),
    INDEX idx_oxygen_level (oxygen_level)
);

-- ============================================================================
-- ALERTS AND NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    alert_type ENUM('critical', 'warning', 'info', 'success') NOT NULL,
    category ENUM('oxygen', 'beds', 'staff', 'emergency', 'system', 'patient') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority INT NOT NULL DEFAULT 5, -- 1-10, 10 being highest
    status ENUM('active', 'acknowledged', 'resolved') DEFAULT 'active',
    affected_resources JSON,
    estimated_impact TEXT,
    auto_resolve BOOLEAN DEFAULT FALSE,
    created_by_system BOOLEAN DEFAULT TRUE,
    created_by_staff_id INT NULL,
    acknowledged_by_staff_id INT NULL,
    resolved_by_staff_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (created_by_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    FOREIGN KEY (acknowledged_by_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_type_category (alert_type, category),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS alert_recommendations (
    recommendation_id INT PRIMARY KEY AUTO_INCREMENT,
    alert_id INT NOT NULL,
    action_description TEXT NOT NULL,
    priority ENUM('immediate', 'high', 'medium', 'low') NOT NULL,
    estimated_time VARCHAR(50),
    impact_description TEXT,
    cost_level ENUM('none', 'low', 'medium', 'high') DEFAULT 'none',
    departments JSON, -- Array of department names
    automation_available BOOLEAN DEFAULT FALSE,
    success_rate INT DEFAULT 75, -- 0-100%
    executed_at TIMESTAMP NULL,
    executed_by_staff_id INT NULL,
    execution_result ENUM('success', 'failed', 'partial') NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES alerts(alert_id) ON DELETE CASCADE,
    FOREIGN KEY (executed_by_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    INDEX idx_alert_id (alert_id),
    INDEX idx_priority (priority),
    INDEX idx_automation (automation_available)
);

-- ============================================================================
-- APPOINTMENTS AND SCHEDULING
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    staff_id INT NOT NULL,
    appointment_type ENUM('consultation', 'surgery', 'follow_up', 'emergency', 'diagnostic') NOT NULL,
    scheduled_datetime DATETIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    department VARCHAR(100),
    room_number VARCHAR(20),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    INDEX idx_scheduled_datetime (scheduled_datetime),
    INDEX idx_status (status),
    INDEX idx_patient_staff (patient_id, staff_id)
);

-- ============================================================================
-- MEDICAL RECORDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS medical_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    staff_id INT NOT NULL,
    record_type ENUM('diagnosis', 'treatment', 'surgery', 'lab_result', 'prescription', 'note') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    diagnosis_codes VARCHAR(500), -- ICD-10 codes
    treatment_plan TEXT,
    medications JSON,
    lab_results JSON,
    vital_signs JSON,
    attachments JSON, -- File paths/URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    INDEX idx_patient_date (patient_id, created_at),
    INDEX idx_record_type (record_type)
);

-- ============================================================================
-- EQUIPMENT AND RESOURCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS equipment (
    equipment_id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_name VARCHAR(200) NOT NULL,
    equipment_type ENUM('medical', 'diagnostic', 'surgical', 'monitoring', 'support') NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    manufacturer VARCHAR(100),
    purchase_date DATE,
    warranty_expiry DATE,
    location VARCHAR(200),
    status ENUM('active', 'maintenance', 'repair', 'retired') DEFAULT 'active',
    last_maintenance DATE,
    next_maintenance DATE,
    maintenance_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_equipment_type (equipment_type),
    INDEX idx_location (location)
);

-- ============================================================================
-- SYSTEM LOGS AND AUDIT
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    log_level ENUM('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL') NOT NULL,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(200) NOT NULL,
    user_id INT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_data JSON,
    response_data JSON,
    execution_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    INDEX idx_log_level (log_level),
    INDEX idx_module_action (module, action),
    INDEX idx_created_at (created_at)
);

-- ============================================================================
-- PREDICTIVE ANALYTICS DATA
-- ============================================================================
CREATE TABLE IF NOT EXISTS prediction_models (
    model_id INT PRIMARY KEY AUTO_INCREMENT,
    model_name VARCHAR(100) NOT NULL,
    model_type ENUM('bed_occupancy', 'staff_workload', 'oxygen_consumption', 'emergency_load', 'resource_optimization') NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    accuracy_score DECIMAL(5, 4),
    training_data_period VARCHAR(50),
    last_trained TIMESTAMP,
    parameters JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_model_type (model_type),
    INDEX idx_active (is_active)
);

CREATE TABLE IF NOT EXISTS predictions (
    prediction_id INT PRIMARY KEY AUTO_INCREMENT,
    model_id INT NOT NULL,
    prediction_type VARCHAR(100) NOT NULL,
    target_resource VARCHAR(100) NOT NULL,
    predicted_value DECIMAL(10, 4),
    confidence_score DECIMAL(5, 4),
    risk_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    prediction_horizon VARCHAR(50), -- e.g., '4 hours', '1 day'
    input_data JSON,
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES prediction_models(model_id) ON DELETE CASCADE,
    INDEX idx_model_type (model_id, prediction_type),
    INDEX idx_risk_level (risk_level),
    INDEX idx_valid_until (valid_until)
);

-- ============================================================================
-- PERFORMANCE METRICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_metrics (
    metric_id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_category ENUM('bed_utilization', 'staff_efficiency', 'oxygen_usage', 'patient_flow', 'emergency_response', 'system_performance') NOT NULL,
    metric_value DECIMAL(15, 6) NOT NULL,
    unit VARCHAR(50),
    target_value DECIMAL(15, 6),
    measurement_period VARCHAR(50),
    department VARCHAR(100),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    INDEX idx_category_name (metric_category, metric_name),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_department (department)
);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update ward available beds when bed status changes
DELIMITER //
CREATE TRIGGER update_ward_available_beds 
AFTER UPDATE ON beds
FOR EACH ROW
BEGIN
    UPDATE wards 
    SET available_beds = (
        SELECT COUNT(*) 
        FROM beds 
        WHERE ward_id = NEW.ward_id AND status = 'available'
    )
    WHERE ward_id = NEW.ward_id;
END//
DELIMITER ;

-- Update patient status when bed is assigned/unassigned
DELIMITER //
CREATE TRIGGER update_patient_bed_status 
AFTER UPDATE ON beds
FOR EACH ROW
BEGIN
    -- If bed is newly assigned to a patient
    IF NEW.patient_id IS NOT NULL AND OLD.patient_id IS NULL THEN
        UPDATE patients 
        SET status = 'admitted', admission_date = NOW() 
        WHERE patient_id = NEW.patient_id;
    END IF;
    
    -- If bed is unassigned from a patient
    IF NEW.patient_id IS NULL AND OLD.patient_id IS NOT NULL THEN
        UPDATE patients 
        SET status = 'discharged', discharge_date = NOW() 
        WHERE patient_id = OLD.patient_id;
    END IF;
END//
DELIMITER ;

-- Auto-create alerts for critical oxygen levels
DELIMITER //
CREATE TRIGGER oxygen_level_alert 
AFTER INSERT ON oxygen_readings
FOR EACH ROW
BEGIN
    DECLARE station_name VARCHAR(100);
    DECLARE station_location VARCHAR(200);
    
    IF NEW.oxygen_level < 20 THEN
        SELECT station_name, location INTO station_name, station_location 
        FROM oxygen_stations 
        WHERE station_id = NEW.station_id;
        
        INSERT INTO alerts (
            alert_type, category, title, message, priority, 
            affected_resources, estimated_impact, created_by_system
        ) VALUES (
            'critical', 'oxygen', 
            CONCAT('Critical Oxygen Level - ', station_name),
            CONCAT('Oxygen level at ', NEW.oxygen_level, '% in ', station_location, '. Immediate attention required.'),
            9,
            JSON_ARRAY(station_location),
            'Patient safety risk',
            TRUE
        );
        
        -- Update station status
        UPDATE oxygen_stations 
        SET status = 'critical' 
        WHERE station_id = NEW.station_id;
    END IF;
END//
DELIMITER ;

-- ============================================================================
-- INITIAL DATA VIEWS
-- ============================================================================

-- Dashboard summary view
CREATE VIEW dashboard_summary AS
SELECT 
    (SELECT COUNT(*) FROM patients WHERE status = 'admitted') as total_admitted_patients,
    (SELECT COUNT(*) FROM beds WHERE status = 'available') as available_beds,
    (SELECT COUNT(*) FROM beds WHERE status = 'occupied') as occupied_beds,
    (SELECT COUNT(*) FROM staff WHERE status = 'active') as active_staff,
    (SELECT COUNT(*) FROM alerts WHERE status = 'active') as active_alerts,
    (SELECT COUNT(*) FROM alerts WHERE status = 'active' AND alert_type = 'critical') as critical_alerts;

-- Oxygen status view
CREATE VIEW oxygen_status_summary AS
SELECT 
    os.station_id,
    os.station_name,
    os.location,
    os.current_level,
    os.status,
    CASE 
        WHEN os.current_level < 20 THEN 'critical'
        WHEN os.current_level < 40 THEN 'warning'
        ELSE 'normal'
    END as alert_level,
    MAX(oro.reading_timestamp) as last_reading_time
FROM oxygen_stations os
LEFT JOIN oxygen_readings oro ON os.station_id = oro.station_id
GROUP BY os.station_id;

-- Staff workload view
CREATE VIEW staff_workload AS
SELECT 
    s.staff_id,
    s.first_name,
    s.last_name,
    s.department,
    s.position,
    COUNT(DISTINCT b.bed_id) as assigned_beds,
    COUNT(DISTINCT a.appointment_id) as scheduled_appointments,
    CASE 
        WHEN COUNT(DISTINCT b.bed_id) + COUNT(DISTINCT a.appointment_id) > 8 THEN 'high'
        WHEN COUNT(DISTINCT b.bed_id) + COUNT(DISTINCT a.appointment_id) > 5 THEN 'medium'
        ELSE 'low'
    END as workload_level
FROM staff s
LEFT JOIN beds b ON s.staff_id = b.assigned_staff_id
LEFT JOIN appointments a ON s.staff_id = a.staff_id 
    AND a.scheduled_datetime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
    AND a.status IN ('scheduled', 'confirmed')
WHERE s.status = 'active'
GROUP BY s.staff_id;