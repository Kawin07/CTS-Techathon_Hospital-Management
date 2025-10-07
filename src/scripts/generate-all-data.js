// Script to generate random data for all major tables in MySQL
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Patients
const firstNames = ['John', 'Maria', 'Robert', 'Emily', 'Michael', 'Sarah', 'David', 'Jessica', 'Daniel', 'Laura'];
const lastNames = ['Anderson', 'Garcia', 'Johnson', 'Smith', 'Lee', 'Brown', 'Martinez', 'Davis', 'Clark', 'Lewis'];
const conditions = ['Hypertension', 'Post-operative care', 'Cardiac arrest', 'Diabetes', 'Asthma', 'Fracture', 'Flu', 'COVID-19', 'Allergy', 'Migraine'];
const patientStatuses = ['admitted', 'discharged', 'transferred', 'outpatient'];
const genders = ['male', 'female', 'other'];
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Staff
const staffRoles = ['Doctor', 'Nurse', 'Surgeon', 'Technician', 'Admin'];
const staffDepartments = ['Emergency', 'ICU', 'Surgery', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Nursing', 'Administration', 'Maintenance', 'Security'];
const staffStatuses = ['active', 'on_leave', 'inactive'];
const shiftTypes = ['day', 'night', 'rotating'];

// Wards
const wardTypes = ['General', 'ICU', 'Emergency', 'Surgery', 'Maternity', 'Pediatrics', 'Isolation'];

// Beds
const bedTypes = ['Standard', 'ICU', 'Emergency', 'Isolation', 'Maternity'];
const bedStatuses = ['available', 'occupied', 'maintenance', 'reserved'];

// Oxygen Stations
const oxygenStatuses = ['normal', 'low', 'critical', 'maintenance'];

async function generatePatients(count = 50) {
  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    // Unique identifier for FHIR patients
    const identifier = `P${i}${randomInt(100000,999999)}`;
    const gender = randomItem(genders); // Already lowercase
    const phone = `555-${randomInt(100,999)}-${randomInt(1000,9999)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
    const condition = randomItem(conditions);
    const blood_type = randomItem(bloodTypes);
    await pool.execute(`INSERT INTO fhir_patients (
      identifier, given_name, family_name, birth_date, gender,
      phone, email, address_line, address_city, address_state, address_postal_code,
      contact_name, contact_phone, contact_relationship, marital_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      identifier,
      firstName,
      lastName,
      `19${randomInt(30, 99)}-01-01`,
      gender, // Valid ENUM value
      phone,
      email,
      `${randomInt(1,999)} Main St`,
      'Springfield',
      'Illinois',
      `${randomInt(10000,99999)}`,
      `${randomItem(firstNames)} ${randomItem(lastNames)}`,
      `555-${randomInt(100,999)}-${randomInt(1000,9999)}`,
      'spouse',
      'married'
    ]);
  }
  console.log('✅ Random patients generated');
}

async function generateStaff(count = 20) {
  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    // Unique staff_id: append index and random number
    const staff_id = `S${i}${randomInt(1000,9999)}`;
    const department = randomItem(staffDepartments);
    const role = randomItem(staffRoles);
    const shift = randomItem(['morning', 'afternoon', 'night']);
    const status = randomItem(['on-duty', 'off-duty', 'on-break']);
    const phone = `555-${randomInt(100,999)}-${randomInt(1000,9999)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}${randomInt(1000,9999)}@hospital.com`;
    const name = `${firstName} ${lastName}`;
    await pool.execute(`INSERT INTO staff (
      id, name, role, department, shift, status, phone, email, location, experience, specialization, workload, next_shift
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      staff_id,
      name,
      role,
      department,
      shift,
      status,
      phone,
      email,
      department + ' Ward',
      randomInt(1,15),
      JSON.stringify([role]),
      randomInt(20,80),
      new Date(Date.now() + randomInt(1,48) * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    ]);
  }
  console.log('✅ Random staff generated');
}

async function generateWards(count = 10) {
  for (let i = 0; i < count; i++) {
    const ward_name = `${randomItem(wardTypes)} Ward ${i+1}`;
    const ward_type = randomItem(wardTypes);
    const total_beds = randomInt(10, 30);
    const available_beds = randomInt(0, total_beds);
    await pool.execute(`INSERT INTO wards (
      ward_name, ward_type, total_beds, available_beds, floor_number, department
    ) VALUES (?, ?, ?, ?, ?, ?)`, [
      ward_name,
      ward_type,
      total_beds,
      available_beds,
      randomInt(1,5),
      randomItem(staffDepartments)
    ]);
  }
  console.log('✅ Random wards generated');
}

async function generateBeds(count = 50) {
  // Fetch all patient and staff IDs
  const [patients] = await pool.query('SELECT patient_id FROM patients');
  const [staff] = await pool.query('SELECT staff_id FROM staff');
  for (let i = 0; i < count; i++) {
    const bed_number = `B${1000 + i}`;
    const ward_id = randomInt(1,100); // assumes wards already generated
    const bed_type = randomItem(bedTypes);
    const status = randomItem(bedStatuses);
    // Assign patient_id and staff_id randomly, or null
    const patient_id = patients.length > 0 && Math.random() < 0.7 ? randomItem(patients).patient_id : null;
    const assigned_staff_id = staff.length > 0 && Math.random() < 0.7 ? randomItem(staff).staff_id : null;
    await pool.execute(`INSERT INTO beds (
      bed_number, ward_id, bed_type, status, patient_id, assigned_staff_id, last_cleaned, equipment_status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      bed_number,
      ward_id,
      bed_type,
      status,
      patient_id,
      assigned_staff_id,
      `2025-09-${randomInt(1,24)} 08:00`,
      'OK',
      'None'
    ]);
  }
  console.log('✅ Random beds generated');
}

async function generateOxygenStations(count = 5) {
  for (let i = 0; i < count; i++) {
    const station_name = `Oxygen Station ${i+1}`;
    const location = `Floor ${randomInt(1,5)} Room ${randomInt(100,399)}`;
    const capacity_liters = randomInt(1000,5000);
    const current_level = randomInt(10,100);
    const status = randomItem(oxygenStatuses);
    await pool.execute(`INSERT INTO oxygen_stations (
      station_name, location, capacity_liters, current_level, status
    ) VALUES (?, ?, ?, ?, ?)`, [
      station_name,
      location,
      capacity_liters,
      current_level,
      status
    ]);
  }
  console.log('✅ Random oxygen stations generated');
}

async function main() {
  await generatePatients(100);
  await generateStaff(100);
  // await generateWards(100); // Skip - table doesn't exist
  // await generateBeds(100);  // Skip - may depend on wards
  // await generateOxygenStations(100); // Skip - may have issues
  await pool.end();
  console.log('✅ All random data generated (patients and staff)');
}

main();
