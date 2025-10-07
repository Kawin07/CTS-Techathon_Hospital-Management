-- Enhanced FHIR-compliant Healthcare Database Schema
-- Covers 2010-2025 healthcare data with real disease trends

USE healthcare_db;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS patient_observations;
DROP TABLE IF EXISTS patient_encounters;
DROP TABLE IF EXISTS patient_conditions;
DROP TABLE IF EXISTS patient_medications;
DROP TABLE IF EXISTS seasonal_disease_patterns;
DROP TABLE IF EXISTS disease_outbreaks;
DROP TABLE IF EXISTS healthcare_statistics;
DROP TABLE IF EXISTS fhir_patients;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS oxygen_stations;
DROP TABLE IF EXISTS beds;
DROP TABLE IF EXISTS wards;

-- Enhanced FHIR Patients table
CREATE TABLE fhir_patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(50) UNIQUE NOT NULL,
    given_name VARCHAR(100) NOT NULL,
    family_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender ENUM('male', 'female', 'other', 'unknown') NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address_line VARCHAR(200),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_postal_code VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'USA',
    contact_name VARCHAR(200),
    contact_phone VARCHAR(20),
    contact_relationship VARCHAR(50),
    marital_status ENUM('single', 'married', 'divorced', 'widowed', 'unknown'),
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    insurance_provider VARCHAR(100),
    insurance_number VARCHAR(50),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Patient Conditions (Diseases/Diagnoses)
CREATE TABLE patient_conditions (
    condition_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    condition_code VARCHAR(20) NOT NULL, -- ICD-10 codes
    condition_name VARCHAR(200) NOT NULL,
    condition_category ENUM('infectious', 'chronic', 'acute', 'seasonal', 'respiratory', 'cardiovascular', 'diabetes', 'cancer', 'mental_health', 'injury', 'other'),
    severity ENUM('mild', 'moderate', 'severe', 'critical'),
    onset_date DATE NOT NULL,
    resolved_date DATE NULL,
    status ENUM('active', 'resolved', 'chronic', 'in_remission') DEFAULT 'active',
    diagnosed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES fhir_patients(patient_id) ON DELETE CASCADE,
    INDEX idx_condition_code (condition_code),
    INDEX idx_onset_date (onset_date),
    INDEX idx_category (condition_category)
);

-- Patient Encounters (Hospital visits, consultations)
CREATE TABLE patient_encounters (
    encounter_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    encounter_type ENUM('inpatient', 'outpatient', 'emergency', 'urgent_care', 'telehealth', 'home_visit'),
    admission_date DATETIME NOT NULL,
    discharge_date DATETIME NULL,
    department VARCHAR(100),
    attending_physician VARCHAR(100),
    chief_complaint TEXT,
    diagnosis_primary VARCHAR(200),
    diagnosis_secondary TEXT,
    treatment_plan TEXT,
    discharge_disposition ENUM('home', 'transfer', 'death', 'left_ama', 'hospice'),
    total_cost DECIMAL(10,2),
    insurance_covered DECIMAL(10,2),
    patient_paid DECIMAL(10,2),
    length_of_stay INT, -- in days
    room_number VARCHAR(20),
    bed_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES fhir_patients(patient_id) ON DELETE CASCADE,
    INDEX idx_admission_date (admission_date),
    INDEX idx_encounter_type (encounter_type),
    INDEX idx_department (department)
);

-- Patient Observations (Vital signs, lab results, oxygen levels)
CREATE TABLE patient_observations (
    observation_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    encounter_id INT NULL,
    observation_type ENUM('vital_signs', 'lab_result', 'oxygen_saturation', 'blood_pressure', 'temperature', 'heart_rate', 'weight', 'height', 'bmi', 'glucose', 'cholesterol', 'other'),
    observation_code VARCHAR(20), -- LOINC codes
    observation_name VARCHAR(200) NOT NULL,
    value_numeric DECIMAL(10,3),
    value_text VARCHAR(500),
    unit VARCHAR(20),
    reference_range_low DECIMAL(10,3),
    reference_range_high DECIMAL(10,3),
    status ENUM('normal', 'abnormal', 'critical', 'high', 'low') DEFAULT 'normal',
    observed_date DATETIME NOT NULL,
    observed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES fhir_patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (encounter_id) REFERENCES patient_encounters(encounter_id) ON DELETE SET NULL,
    INDEX idx_observation_type (observation_type),
    INDEX idx_observed_date (observed_date),
    INDEX idx_status (status)
);

-- Patient Medications
CREATE TABLE patient_medications (
    medication_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    encounter_id INT NULL,
    medication_name VARCHAR(200) NOT NULL,
    medication_code VARCHAR(20), -- RxNorm codes
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route ENUM('oral', 'iv', 'im', 'topical', 'inhalation', 'sublingual', 'other'),
    prescribed_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    prescribed_by VARCHAR(100),
    pharmacy VARCHAR(100),
    status ENUM('active', 'completed', 'discontinued', 'on_hold') DEFAULT 'active',
    side_effects TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES fhir_patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (encounter_id) REFERENCES patient_encounters(encounter_id) ON DELETE SET NULL,
    INDEX idx_prescribed_date (prescribed_date),
    INDEX idx_medication_name (medication_name),
    INDEX idx_status (status)
);

-- Seasonal Disease Patterns (Historical data for realistic generation)
CREATE TABLE seasonal_disease_patterns (
    pattern_id INT AUTO_INCREMENT PRIMARY KEY,
    year_period INT NOT NULL,
    month_period INT NOT NULL,
    disease_category VARCHAR(100) NOT NULL,
    disease_name VARCHAR(200) NOT NULL,
    icd10_code VARCHAR(20),
    peak_month INT, -- 1-12
    cases_per_100k INT NOT NULL, -- Cases per 100,000 population
    mortality_rate DECIMAL(5,2), -- Percentage
    affected_age_groups JSON, -- ["0-5", "6-17", "18-64", "65+"]
    geographic_regions JSON, -- ["northeast", "southeast", "midwest", "southwest", "west"]
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_year_month (year_period, month_period),
    INDEX idx_disease_category (disease_category),
    INDEX idx_peak_month (peak_month)
);

-- Disease Outbreaks (Major health events 2010-2025)
CREATE TABLE disease_outbreaks (
    outbreak_id INT AUTO_INCREMENT PRIMARY KEY,
    outbreak_name VARCHAR(200) NOT NULL,
    disease_name VARCHAR(200) NOT NULL,
    icd10_code VARCHAR(20),
    start_date DATE NOT NULL,
    end_date DATE NULL,
    affected_regions JSON,
    total_cases INT,
    total_deaths INT,
    case_fatality_rate DECIMAL(5,2),
    outbreak_type ENUM('pandemic', 'epidemic', 'endemic', 'outbreak'),
    severity ENUM('low', 'moderate', 'high', 'severe'),
    response_measures TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_start_date (start_date),
    INDEX idx_disease_name (disease_name),
    INDEX idx_outbreak_type (outbreak_type)
);

-- Healthcare Statistics (Population health data)
CREATE TABLE healthcare_statistics (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    year_period INT NOT NULL,
    region VARCHAR(100) DEFAULT 'USA',
    population_total INT,
    life_expectancy_male DECIMAL(4,1),
    life_expectancy_female DECIMAL(4,1),
    infant_mortality_rate DECIMAL(5,2),
    obesity_rate DECIMAL(5,2),
    diabetes_prevalence DECIMAL(5,2),
    hypertension_prevalence DECIMAL(5,2),
    smoking_rate DECIMAL(5,2),
    healthcare_spending_per_capita DECIMAL(10,2),
    hospital_beds_per_1000 DECIMAL(4,1),
    physicians_per_1000 DECIMAL(4,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_year_period (year_period),
    INDEX idx_region (region)
);

-- Enhanced Staff table
CREATE TABLE staff (
    staff_id VARCHAR(20) PRIMARY KEY,
    employee_number VARCHAR(50) UNIQUE,
    given_name VARCHAR(100) NOT NULL,
    family_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role ENUM('Doctor', 'Nurse', 'Surgeon', 'Technician', 'Admin', 'Pharmacist', 'Therapist', 'Social_Worker') NOT NULL,
    department VARCHAR(100),
    shift ENUM('morning', 'afternoon', 'night', 'rotating') DEFAULT 'morning',
    status ENUM('on-duty', 'off-duty', 'on-break', 'vacation', 'sick-leave') DEFAULT 'off-duty',
    location VARCHAR(100),
    specialization JSON,
    years_experience INT DEFAULT 0,
    license_number VARCHAR(50),
    hire_date DATE,
    salary DECIMAL(10,2),
    workload INT DEFAULT 0, -- 0-100 percentage
    next_shift DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_department (department),
    INDEX idx_status (status)
);

-- Enhanced Wards table
CREATE TABLE wards (
    ward_id INT AUTO_INCREMENT PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL,
    ward_code VARCHAR(20) UNIQUE,
    ward_type ENUM('General', 'ICU', 'Emergency', 'Surgery', 'Maternity', 'Pediatrics', 'Isolation', 'Oncology', 'Cardiac', 'Psychiatric'),
    floor_number INT,
    building VARCHAR(50),
    total_beds INT NOT NULL,
    available_beds INT DEFAULT 0,
    occupied_beds INT DEFAULT 0,
    maintenance_beds INT DEFAULT 0,
    department VARCHAR(100),
    head_nurse VARCHAR(20),
    phone_extension VARCHAR(10),
    specialized_equipment JSON,
    infection_control_level ENUM('standard', 'contact', 'droplet', 'airborne', 'protective'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (head_nurse) REFERENCES staff(staff_id) ON DELETE SET NULL,
    INDEX idx_ward_type (ward_type),
    INDEX idx_department (department)
);

-- Enhanced Beds table  
CREATE TABLE beds (
    bed_id INT AUTO_INCREMENT PRIMARY KEY,
    bed_number VARCHAR(20) NOT NULL,
    ward_id INT NOT NULL,
    bed_type ENUM('Standard', 'ICU', 'Emergency', 'Isolation', 'Maternity', 'Pediatric', 'Bariatric'),
    status ENUM('available', 'occupied', 'maintenance', 'reserved', 'cleaning') DEFAULT 'available',
    patient_id INT NULL,
    assigned_staff_id VARCHAR(20) NULL,
    last_cleaned DATETIME,
    last_maintenance DATETIME,
    equipment_status ENUM('OK', 'Needs_Maintenance', 'Out_of_Order') DEFAULT 'OK',
    special_features JSON, -- ["oxygen", "cardiac_monitor", "ventilator", "isolation_capable"]
    daily_rate DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_id) REFERENCES wards(ward_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES fhir_patients(patient_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_bed_type (bed_type),
    INDEX idx_ward_id (ward_id)
);

-- Enhanced Oxygen Stations table
CREATE TABLE oxygen_stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_code VARCHAR(20) UNIQUE NOT NULL,
    station_name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    ward_id INT NULL,
    bed_id INT NULL,
    capacity_liters INT NOT NULL,
    current_level_liters INT NOT NULL,
    current_level_percentage DECIMAL(5,2) GENERATED ALWAYS AS (ROUND((current_level_liters / capacity_liters) * 100, 2)) STORED,
    pressure_psi DECIMAL(6,2),
    flow_rate_lpm DECIMAL(5,2), -- Liters per minute
    patient_id INT NULL,
    assigned_staff_id VARCHAR(20) NULL,
    status ENUM('normal', 'low', 'critical', 'maintenance', 'offline') DEFAULT 'normal',
    last_refilled DATETIME,
    last_maintenance DATETIME,
    next_maintenance_due DATE,
    supplier VARCHAR(100),
    cost_per_refill DECIMAL(8,2),
    alert_threshold_low INT DEFAULT 20, -- percentage
    alert_threshold_critical INT DEFAULT 10, -- percentage
    equipment_serial VARCHAR(50),
    installation_date DATE,
    warranty_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_id) REFERENCES wards(ward_id) ON DELETE SET NULL,
    FOREIGN KEY (bed_id) REFERENCES beds(bed_id) ON DELETE SET NULL,
    FOREIGN KEY (patient_id) REFERENCES fhir_patients(patient_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_current_level_percentage (current_level_percentage),
    INDEX idx_location (location)
);

-- Create indexes for better performance
CREATE INDEX idx_patients_birth_date ON fhir_patients (birth_date);
CREATE INDEX idx_patients_gender ON fhir_patients (gender);
CREATE INDEX idx_patients_blood_type ON fhir_patients (blood_type);
CREATE INDEX idx_patients_created_at ON fhir_patients (created_at);

-- Views for common queries
CREATE VIEW patient_summary AS
SELECT 
    p.patient_id,
    p.identifier,
    CONCAT(p.given_name, ' ', p.family_name) as full_name,
    p.birth_date,
    TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as age,
    p.gender,
    p.blood_type,
    COUNT(DISTINCT pc.condition_id) as condition_count,
    COUNT(DISTINCT pe.encounter_id) as encounter_count,
    MAX(pe.admission_date) as last_visit
FROM fhir_patients p
LEFT JOIN patient_conditions pc ON p.patient_id = pc.patient_id AND pc.status = 'active'
LEFT JOIN patient_encounters pe ON p.patient_id = pe.patient_id
WHERE p.is_active = TRUE
GROUP BY p.patient_id;

CREATE VIEW oxygen_monitoring_view AS
SELECT 
    os.station_id,
    os.station_code,
    os.station_name,
    os.location,
    os.current_level_percentage,
    os.pressure_psi,
    os.flow_rate_lpm,
    os.status,
    CASE 
        WHEN p.patient_id IS NOT NULL THEN CONCAT(p.given_name, ' ', p.family_name)
        ELSE 'No Patient'
    END as patient_name,
    p.identifier as patient_identifier,
    CASE 
        WHEN s.staff_id IS NOT NULL THEN CONCAT(s.given_name, ' ', s.family_name)
        ELSE 'Unassigned'
    END as assigned_staff,
    w.ward_name,
    b.bed_number,
    os.last_maintenance,
    os.next_maintenance_due
FROM oxygen_stations os
LEFT JOIN fhir_patients p ON os.patient_id = p.patient_id
LEFT JOIN staff s ON os.assigned_staff_id = s.staff_id
LEFT JOIN wards w ON os.ward_id = w.ward_id
LEFT JOIN beds b ON os.bed_id = b.bed_id
ORDER BY os.station_code;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE GetPatientHistory(IN patient_identifier VARCHAR(50))
BEGIN
    SELECT 
        p.identifier,
        CONCAT(p.given_name, ' ', p.family_name) as patient_name,
        pc.condition_name,
        pc.onset_date,
        pc.status as condition_status,
        pe.encounter_type,
        pe.admission_date,
        pe.diagnosis_primary
    FROM fhir_patients p
    LEFT JOIN patient_conditions pc ON p.patient_id = pc.patient_id
    LEFT JOIN patient_encounters pe ON p.patient_id = pe.patient_id
    WHERE p.identifier = patient_identifier
    ORDER BY COALESCE(pe.admission_date, pc.onset_date) DESC;
END //

CREATE PROCEDURE UpdateOxygenLevel(IN station_code VARCHAR(20), IN new_level_liters INT)
BEGIN
    UPDATE oxygen_stations 
    SET current_level_liters = new_level_liters,
        status = CASE 
            WHEN (new_level_liters / capacity_liters) * 100 <= alert_threshold_critical THEN 'critical'
            WHEN (new_level_liters / capacity_liters) * 100 <= alert_threshold_low THEN 'low'
            ELSE 'normal'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE station_code = station_code;
END //

DELIMITER ;