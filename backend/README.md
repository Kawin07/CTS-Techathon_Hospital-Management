# Hospital Management System - Python Backend

This is the Python Flask backend for the Hospital Management System.

## Setup

1. **Install Python 3.8+**
   Make sure you have Python 3.8 or higher installed.

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory with the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hospital_management
   ```

4. **Initialize Database**
   ```bash
   python scripts/init_database.py
   ```

5. **Test Database Connection**
   ```bash
   python test_db_connection.py
   ```

6. **Run the Application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check API and database health
- `GET /stats` - Get system statistics

### Patients
- `GET /api/patients` - Get all patients (with filtering and pagination)
- `POST /api/patients` - Create a new patient
- `GET /api/patients/{id}` - Get patient by ID
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient (soft delete)

### Oxygen Stations
- `GET /api/oxygen/stations` - Get all oxygen stations
- `POST /api/oxygen/stations` - Create a new oxygen station
- `GET /api/oxygen/stations/{id}` - Get oxygen station by ID
- `POST /api/oxygen/stations/{id}/readings` - Create oxygen reading
- `GET /api/oxygen/stations/{id}/readings` - Get readings for station

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── test_db_connection.py  # Database connection test
├── config/
│   └── database.py       # Database configuration and connection
├── services/
│   ├── database_service.py  # Main database service
│   ├── patient_service.py   # Patient operations
│   └── oxygen_service.py    # Oxygen station operations
├── models/
│   └── database.py       # Data models and types
└── scripts/
    └── init_database.py  # Database initialization script
```

## Migration from Node.js/TypeScript

This Python backend provides the same functionality as the original Node.js/TypeScript backend:

- **Database Operations**: MySQL connection pooling and query execution
- **Patient Management**: CRUD operations for patients
- **Oxygen Station Management**: CRUD operations for oxygen stations and readings
- **Health Monitoring**: Health check and statistics endpoints
- **Error Handling**: Comprehensive error handling and logging
- **Type Safety**: Using Python dataclasses for type definitions

## Key Changes from Node.js Version

1. **Language**: TypeScript → Python
2. **Framework**: Node.js → Flask
3. **Database Driver**: mysql2 → mysql-connector-python
4. **Type System**: TypeScript interfaces → Python dataclasses
5. **Error Handling**: Try-catch → Python exception handling
6. **Async Operations**: Async/await → Synchronous operations with connection pooling

## Next Steps

1. Update your frontend to point to the new Python backend (port 5000)
2. Update any environment variables or configuration
3. Test all API endpoints to ensure compatibility
4. Remove or archive the old Node.js backend files