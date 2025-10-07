-- Sample Data for Hospital Management System
-- This file contains test data for development and testing

-- ============================================================================
-- SAMPLE WARDS
-- ============================================================================
INSERT INTO wards (ward_name, ward_type, total_beds, available_beds, floor_number, department) VALUES
('General Ward A', 'General', 20, 15, 1, 'General Medicine'),
('ICU Wing', 'ICU', 10, 3, 2, 'Critical Care'),
('Emergency Ward', 'Emergency', 15, 8, 1, 'Emergency Medicine'),
('Surgery Recovery', 'Surgery', 12, 7, 2, 'Surgery'),
('Pediatrics Ward', 'Pediatrics', 16, 12, 3, 'Pediatrics'),
('Maternity Ward', 'Maternity', 8, 5, 3, 'Obstetrics');

-- ============================================================================
-- SAMPLE STAFF
-- ============================================================================
INSERT INTO staff (employee_id, first_name, last_name, email, phone, department, position, shift_type, status, hire_date, salary) VALUES
('EMP001', 'Dr. Sarah', 'Johnson', 'sarah.johnson@hospital.com', '+1-555-0101', 'Emergency', 'Emergency Physician', 'day', 'active', '2020-03-15', 120000.00),
('EMP002', 'Dr. Michael', 'Chen', 'michael.chen@hospital.com', '+1-555-0102', 'ICU', 'ICU Specialist', 'night', 'active', '2019-08-22', 135000.00),
('EMP003', 'Nurse Emily', 'Davis', 'emily.davis@hospital.com', '+1-555-0103', 'Nursing', 'Head Nurse', 'day', 'active', '2018-01-10', 75000.00),
('EMP004', 'Dr. Robert', 'Wilson', 'robert.wilson@hospital.com', '+1-555-0104', 'Surgery', 'Surgeon', 'day', 'active', '2017-05-30', 180000.00),
('EMP005', 'Nurse Amanda', 'Brown', 'amanda.brown@hospital.com', '+1-555-0105', 'Nursing', 'ICU Nurse', 'night', 'active', '2021-02-14', 68000.00),
('EMP006', 'Dr. Lisa', 'Martinez', 'lisa.martinez@hospital.com', '+1-555-0106', 'Pediatrics', 'Pediatrician', 'day', 'active', '2019-11-08', 125000.00),
('EMP007', 'John', 'Anderson', 'john.anderson@hospital.com', '+1-555-0107', 'Maintenance', 'Maintenance Supervisor', 'day', 'active', '2016-09-12', 55000.00),
('EMP008', 'Nurse Rachel', 'Thompson', 'rachel.thompson@hospital.com', '+1-555-0108', 'Nursing', 'Emergency Nurse', 'rotating', 'active', '2020-07-03', 72000.00);

-- ============================================================================
-- SAMPLE PATIENTS
-- ============================================================================
INSERT INTO patients (patient_number, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_type, status) VALUES
('PAT001', 'James', 'Smith', '1975-06-15', 'M', '+1-555-1001', 'james.smith@email.com', '123 Main St, City, State 12345', 'Mary Smith', '+1-555-1002', 'O+', 'admitted'),
('PAT002', 'Jennifer', 'Garcia', '1988-03-22', 'F', '+1-555-1003', 'jennifer.garcia@email.com', '456 Oak Ave, City, State 12345', 'Carlos Garcia', '+1-555-1004', 'A+', 'admitted'),
('PAT003', 'William', 'Johnson', '1962-11-08', 'M', '+1-555-1005', 'william.johnson@email.com', '789 Pine St, City, State 12345', 'Susan Johnson', '+1-555-1006', 'B-', 'admitted'),
('PAT004', 'Maria', 'Rodriguez', '1993-09-14', 'F', '+1-555-1007', 'maria.rodriguez@email.com', '321 Elm St, City, State 12345', 'Jose Rodriguez', '+1-555-1008', 'AB+', 'outpatient'),
('PAT005', 'David', 'Brown', '1980-01-25', 'M', '+1-555-1009', 'david.brown@email.com', '654 Maple Ave, City, State 12345', 'Lisa Brown', '+1-555-1010', 'O-', 'admitted'),
('PAT006', 'Sarah', 'Davis', '1999-07-03', 'F', '+1-555-1011', 'sarah.davis@email.com', '987 Cedar St, City, State 12345', 'Mike Davis', '+1-555-1012', 'A-', 'outpatient');

-- ============================================================================
-- SAMPLE BEDS
-- ============================================================================
INSERT INTO beds (bed_number, ward_id, bed_type, status, patient_id, assigned_staff_id) VALUES
-- General Ward A (ward_id: 1)
('A001', 1, 'Standard', 'occupied', 1, 3),
('A002', 1, 'Standard', 'occupied', 2, 3),
('A003', 1, 'Standard', 'available', NULL, NULL),
('A004', 1, 'Standard', 'occupied', 3, 3),
('A005', 1, 'Standard', 'available', NULL, NULL),
-- ICU Wing (ward_id: 2)
('ICU001', 2, 'ICU', 'occupied', 5, 5),
('ICU002', 2, 'ICU', 'available', NULL, NULL),
('ICU003', 2, 'ICU', 'maintenance', NULL, NULL),
-- Emergency Ward (ward_id: 3)
('ER001', 3, 'Emergency', 'available', NULL, NULL),
('ER002', 3, 'Emergency', 'available', NULL, NULL),
('ER003', 3, 'Emergency', 'occupied', 4, 8);

-- ============================================================================
-- SAMPLE OXYGEN STATIONS
-- ============================================================================
INSERT INTO oxygen_stations (station_name, location, capacity_liters, current_level, pressure_psi, flow_rate, status, supplier) VALUES
('Main O2 Tank 1', 'ICU Wing - Floor 2', 5000.00, 85.5, 2200.0, 15.5, 'normal', 'Medical Gas Supply Co.'),
('Main O2 Tank 2', 'Emergency Ward - Floor 1', 5000.00, 22.3, 2180.0, 12.8, 'low', 'Medical Gas Supply Co.'),
('Backup O2 Tank 1', 'Surgery Recovery - Floor 2', 3000.00, 95.2, 2220.0, 8.2, 'normal', 'Medical Gas Supply Co.'),
('Portable O2 Unit 1', 'General Ward A - Floor 1', 500.00, 15.8, 2100.0, 5.0, 'critical', 'Portable Medical Solutions'),
('Main O2 Tank 3', 'Pediatrics Ward - Floor 3', 4000.00, 78.9, 2190.0, 10.5, 'normal', 'Medical Gas Supply Co.'),
('Emergency O2 Tank', 'Emergency Department', 2000.00, 45.6, 2150.0, 20.0, 'normal', 'Emergency Medical Supply');

-- ============================================================================
-- SAMPLE OXYGEN READINGS (Recent readings)
-- ============================================================================
INSERT INTO oxygen_readings (station_id, oxygen_level, pressure_psi, flow_rate, temperature, recorded_by_staff_id) VALUES
-- Recent readings for each station
(1, 85.5, 2200.0, 15.5, 20.5, 2),
(2, 22.3, 2180.0, 12.8, 21.2, 1),
(3, 95.2, 2220.0, 8.2, 19.8, 4),
(4, 15.8, 2100.0, 5.0, 22.1, 3),
(5, 78.9, 2190.0, 10.5, 20.0, 6),
(6, 45.6, 2150.0, 20.0, 21.5, 8),
-- Historical readings (last hour)
(1, 87.2, 2205.0, 15.2, 20.3, 2),
(2, 25.1, 2185.0, 13.1, 21.0, 1),
(3, 94.8, 2218.0, 8.5, 19.9, 4),
(4, 18.2, 2105.0, 5.2, 22.0, 3);

-- ============================================================================
-- SAMPLE EQUIPMENT
-- ============================================================================
INSERT INTO equipment (equipment_name, equipment_type, model, serial_number, manufacturer, location, status, last_maintenance) VALUES
('Ventilator Unit 1', 'medical', 'VentMax Pro 2000', 'VM2000-001', 'MedTech Solutions', 'ICU Wing - Room 201', 'active', '2024-08-15'),
('Cardiac Monitor', 'monitoring', 'CardioWatch Elite', 'CW-2024-015', 'HeartTech Inc', 'ICU Wing - Room 202', 'active', '2024-07-20'),
('X-Ray Machine', 'diagnostic', 'ImagePro 5000', 'IP5000-A12', 'RadiologyTech', 'Radiology Department', 'active', '2024-06-30'),
('Defibrillator Unit 1', 'medical', 'LifeSaver AED', 'LS-AED-101', 'Emergency Medical Corp', 'Emergency Ward', 'active', '2024-09-01'),
('Oxygen Concentrator', 'medical', 'OxyFlow 3000', 'OF3000-B45', 'Respiratory Solutions', 'General Ward A', 'maintenance', '2024-08-25');

-- ============================================================================
-- SAMPLE APPOINTMENTS
-- ============================================================================
INSERT INTO appointments (patient_id, staff_id, appointment_type, scheduled_datetime, duration_minutes, status, department, reason) VALUES
(4, 1, 'consultation', '2024-09-25 10:00:00', 30, 'scheduled', 'Emergency', 'Follow-up consultation'),
(6, 6, 'consultation', '2024-09-25 14:30:00', 45, 'scheduled', 'Pediatrics', 'Regular checkup'),
(1, 4, 'surgery', '2024-09-26 08:00:00', 120, 'scheduled', 'Surgery', 'Minor surgical procedure'),
(2, 2, 'follow_up', '2024-09-25 16:00:00', 30, 'confirmed', 'ICU', 'Post-ICU follow-up'),
(3, 3, 'consultation', '2024-09-24 11:00:00', 30, 'completed', 'Nursing', 'Wound care assessment');

-- ============================================================================
-- SAMPLE MEDICAL RECORDS
-- ============================================================================
INSERT INTO medical_records (patient_id, staff_id, record_type, title, description, vital_signs) VALUES
(1, 1, 'diagnosis', 'Emergency Assessment', 'Patient presented with chest pain and shortness of breath', '{"blood_pressure": "140/90", "heart_rate": 95, "temperature": 98.6, "oxygen_saturation": 96}'),
(2, 2, 'treatment', 'ICU Treatment Plan', 'Intensive monitoring and respiratory support', '{"blood_pressure": "120/80", "heart_rate": 88, "temperature": 99.1, "oxygen_saturation": 94}'),
(3, 3, 'note', 'Nursing Assessment', 'Patient stable, wound healing well', '{"blood_pressure": "130/85", "heart_rate": 78, "temperature": 98.4, "oxygen_saturation": 98}');

-- ============================================================================
-- SAMPLE PREDICTION MODELS AND DATA
-- ============================================================================
INSERT INTO prediction_models (model_name, model_type, model_version, accuracy_score, training_data_period, parameters, is_active) VALUES
('Bed Occupancy Predictor v2.1', 'bed_occupancy', '2.1.0', 0.8750, 'Last 6 months', '{"algorithm": "random_forest", "features": ["historical_occupancy", "day_of_week", "season", "emergency_load"]}', TRUE),
('Staff Workload Optimizer v1.5', 'staff_workload', '1.5.2', 0.8200, 'Last 3 months', '{"algorithm": "neural_network", "features": ["patient_acuity", "staff_count", "shift_patterns"]}', TRUE),
('Oxygen Consumption Forecaster', 'oxygen_consumption', '1.8.1', 0.9100, 'Last 4 months', '{"algorithm": "time_series", "features": ["historical_usage", "patient_count", "weather"]}', TRUE);

-- ============================================================================
-- SAMPLE PREDICTIONS
-- ============================================================================
INSERT INTO predictions (model_id, prediction_type, target_resource, predicted_value, confidence_score, risk_level, prediction_horizon, recommendations) VALUES
(1, 'bed_occupancy', 'ICU beds', 8.5, 0.87, 'high', '4 hours', '["Prepare additional ICU capacity", "Review discharge plans", "Monitor emergency admissions"]'),
(2, 'staff_workload', 'nursing_staff', 92.3, 0.82, 'high', '6 hours', '["Call in additional nursing staff", "Redistribute patient assignments", "Defer non-critical tasks"]'),
(3, 'oxygen_consumption', 'oxygen_station_2', 18.2, 0.91, 'critical', '2 hours', '["Schedule immediate refill", "Activate backup oxygen supply", "Monitor patient oxygen needs"]');

-- ============================================================================
-- SAMPLE PERFORMANCE METRICS
-- ============================================================================
INSERT INTO performance_metrics (metric_name, metric_category, metric_value, unit, target_value, measurement_period, department) VALUES
('Average Bed Occupancy Rate', 'bed_utilization', 78.5, 'percentage', 85.0, 'daily', 'Hospital-wide'),
('Staff Efficiency Score', 'staff_efficiency', 82.3, 'score', 80.0, 'weekly', 'Nursing'),
('Oxygen Usage Rate', 'oxygen_usage', 145.7, 'liters_per_hour', 150.0, 'hourly', 'ICU'),
('Patient Throughput', 'patient_flow', 24.5, 'patients_per_day', 30.0, 'daily', 'Emergency'),
('Average Response Time', 'emergency_response', 4.2, 'minutes', 5.0, 'shift', 'Emergency'),
('System Uptime', 'system_performance', 99.8, 'percentage', 99.5, 'daily', 'IT');

-- ============================================================================
-- SAMPLE ALERTS (Some current active alerts)
-- ============================================================================
INSERT INTO alerts (alert_type, category, title, message, priority, affected_resources, estimated_impact, status) VALUES
('critical', 'oxygen', 'Critical Oxygen Level - Portable O2 Unit 1', 'Oxygen level at 15.8% in General Ward A - Floor 1. Immediate attention required.', 9, '["General Ward A - Floor 1"]', 'Patient safety risk', 'active'),
('warning', 'oxygen', 'Low Oxygen Level - Main O2 Tank 2', 'Oxygen level at 22.3% in Emergency Ward - Floor 1. Refill recommended.', 6, '["Emergency Ward - Floor 1"]', 'Potential service interruption', 'active'),
('warning', 'staff', 'High Staff Workload - ICU', 'ICU staff workload at 92%. Risk of burnout and errors.', 7, '["ICU"]', 'Decreased care quality, staff fatigue', 'acknowledged'),
('info', 'system', 'Scheduled Maintenance', 'Oxygen Concentrator in General Ward A scheduled for maintenance.', 3, '["General Ward A"]', 'Temporary equipment unavailability', 'active');

-- ============================================================================
-- SAMPLE ALERT RECOMMENDATIONS
-- ============================================================================
INSERT INTO alert_recommendations (alert_id, action_description, priority, estimated_time, impact_description, cost_level, departments, automation_available, success_rate) VALUES
(1, 'Replace oxygen tank immediately', 'immediate', '15 minutes', 'Restore safe oxygen levels', 'low', '["Maintenance", "Respiratory Therapy"]', FALSE, 95),
(1, 'Activate backup oxygen supply', 'immediate', '5 minutes', 'Provide temporary oxygen supply', 'none', '["Respiratory Therapy"]', TRUE, 98),
(2, 'Schedule oxygen tank refill', 'high', '45 minutes', 'Prevent oxygen shortage', 'medium', '["Maintenance", "Purchasing"]', FALSE, 90),
(3, 'Call in additional ICU staff', 'high', '60 minutes', 'Reduce individual workload', 'high', '["Human Resources", "ICU Management"]', TRUE, 75),
(3, 'Redistribute non-critical patients', 'medium', '30 minutes', 'Balance workload across units', 'none', '["Nursing Management"]', FALSE, 85);

-- ============================================================================
-- UPDATE TRIGGERS TO REFLECT CURRENT DATA
-- ============================================================================

-- Update ward available beds count
UPDATE wards w SET available_beds = (
    SELECT COUNT(*) FROM beds b 
    WHERE b.ward_id = w.ward_id AND b.status = 'available'
);

-- Update patient admission dates for admitted patients
UPDATE patients SET admission_date = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 5) + 1 DAY) 
WHERE status = 'admitted' AND admission_date IS NULL;

-- Set last maintenance dates for equipment
UPDATE equipment SET 
    last_maintenance = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 90) + 1 DAY),
    next_maintenance = DATE_ADD(NOW(), INTERVAL FLOOR(RAND() * 30) + 30 DAY)
WHERE last_maintenance IS NULL;