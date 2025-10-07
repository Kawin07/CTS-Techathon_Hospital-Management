from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import logging
import signal
import sys
from datetime import datetime

# Import services
from services.database_service import DatabaseService
from services.patient_service import PatientService
from services.oxygen_service import OxygenService

# Import models
from models.database import (
    CreatePatient, UpdatePatient, PatientFilter,
    CreateOxygenStation, UpdateOxygenStation, OxygenStationFilter,
    CreateOxygenReading, PaginationParams
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ============================================================================
# HEALTH CHECK ROUTES
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    health = DatabaseService.health_check()
    status_code = 200 if health['status'] == 'healthy' else 503
    return jsonify(health), status_code

@app.route('/stats', methods=['GET'])
def system_stats():
    """Get system statistics"""
    stats = DatabaseService.get_system_stats()
    return jsonify(stats)

# ============================================================================
# PATIENT ROUTES
# ============================================================================

@app.route('/api/patients', methods=['GET'])
def get_patients():
    """Get all patients with filtering and pagination"""
    try:
        # Parse query parameters
        filters = PatientFilter(
            status=request.args.get('status'),
            gender=request.args.get('gender'),
            blood_type=request.args.get('blood_type'),
            search=request.args.get('search')
        )
        
        pagination = PaginationParams(
            page=int(request.args.get('page', 1)),
            limit=int(request.args.get('limit', 50)),
            sort_by=request.args.get('sort_by', 'patient_id'),
            sort_order=request.args.get('sort_order', 'ASC')
        )
        
        result = PatientService.find_all(filters, pagination)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': {
                    'patients': [p.__dict__ for p in result.data.data],
                    'pagination': {
                        'total': result.data.total,
                        'page': result.data.page,
                        'limit': result.data.limit,
                        'total_pages': result.data.total_pages
                    }
                }
            })
        else:
            return jsonify({'success': False, 'error': result.error}), 400
            
    except Exception as e:
        logger.error(f"Error in get_patients: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/patients', methods=['POST'])
def create_patient():
    """Create a new patient"""
    try:
        data = request.get_json()
        
        # Convert date string to datetime object
        if 'date_of_birth' in data and isinstance(data['date_of_birth'], str):
            data['date_of_birth'] = datetime.fromisoformat(data['date_of_birth'].replace('Z', '+00:00'))
        
        patient_data = CreatePatient(**data)
        result = PatientService.create(patient_data)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': result.data.__dict__,
                'insert_id': result.insert_id
            }), 201
        else:
            return jsonify({'success': False, 'error': result.error}), 400
            
    except Exception as e:
        logger.error(f"Error in create_patient: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient_by_id(patient_id):
    """Get patient by ID"""
    try:
        result = PatientService.find_by_id(patient_id)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': result.data.__dict__
            })
        else:
            return jsonify({'success': False, 'error': result.error}), 404
            
    except Exception as e:
        logger.error(f"Error in get_patient_by_id: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    """Update patient"""
    try:
        data = request.get_json()
        
        # Convert date string to datetime object if present
        if 'date_of_birth' in data and isinstance(data['date_of_birth'], str):
            data['date_of_birth'] = datetime.fromisoformat(data['date_of_birth'].replace('Z', '+00:00'))
        
        update_data = UpdatePatient(**data)
        result = PatientService.update(patient_id, update_data)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': result.data.__dict__
            })
        else:
            return jsonify({'success': False, 'error': result.error}), 400
            
    except Exception as e:
        logger.error(f"Error in update_patient: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    """Delete patient (soft delete)"""
    try:
        result = PatientService.delete(patient_id)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': result.data
            })
        else:
            return jsonify({'success': False, 'error': result.error}), 404
            
    except Exception as e:
        logger.error(f"Error in delete_patient: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# OXYGEN STATION ROUTES
# ============================================================================

@app.route('/api/oxygen/stations', methods=['GET'])
def get_oxygen_stations():
    """Get all oxygen stations with filtering and pagination"""
    try:
        filters = OxygenStationFilter(
            status=request.args.get('status'),
            location=request.args.get('location'),
            low_level_threshold=float(request.args.get('low_level_threshold', 0)) if request.args.get('low_level_threshold') else None
        )
        
        pagination = PaginationParams(
            page=int(request.args.get('page', 1)),
            limit=int(request.args.get('limit', 50)),
            sort_by=request.args.get('sort_by', 'station_name'),
            sort_order=request.args.get('sort_order', 'ASC')
        )
        
        result = OxygenService.find_all_stations(filters, pagination)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': {
                    'stations': [s.__dict__ for s in result.data.data],
                    'pagination': {
                        'total': result.data.total,
                        'page': result.data.page,
                        'limit': result.data.limit,
                        'total_pages': result.data.total_pages
                    }
                }
            })
        else:
            return jsonify({'success': False, 'error': result.error}), 400
            
    except Exception as e:
        logger.error(f"Error in get_oxygen_stations: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# AI (Gemini) PROXY ROUTE
# ============================================================================

@app.route('/api/ai/gemini', methods=['POST'])
def proxy_gemini_generate():
    """Proxy requests to Google Gemini to avoid exposing API key in frontend and CORS issues."""
    try:
        body = request.get_json() or {}
        prompt = (body.get('prompt') or '').strip()
        system_prompt = body.get('systemPrompt') or body.get('system_prompt') or ''
        # Optional overrides for development
        override_model = body.get('model')
        provided_api_key = body.get('apiKey') or body.get('api_key')

        if not prompt:
            return jsonify({
                'success': False,
                'error': 'Missing prompt'
            }), 400

        # Prefer server env API key; allow provided_api_key only as a fallback for local/dev
        api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY') or provided_api_key
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'Server is not configured with GEMINI_API_KEY'
            }), 500

        # Prefer newer 1.5-flash model for availability/speed; allow override
        model = override_model or 'gemini-1.5-flash'
        model_url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'

        payload = {
            'contents': [
                {
                    'parts': [
                        {
                            'text': f"{system_prompt}\n\nUser Query: {prompt}"
                        }
                    ]
                }
            ],
            'generationConfig': {
                'temperature': 0.7,
                'topK': 40,
                'topP': 0.95,
                'maxOutputTokens': 800
            },
            'safetySettings': [
                {
                    'category': 'HARM_CATEGORY_HARASSMENT',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    'category': 'HARM_CATEGORY_HATE_SPEECH',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        }

        headers = {
            'Content-Type': 'application/json',
            'x-goog-api-key': api_key
        }

        resp = requests.post(model_url, json=payload, headers=headers, timeout=20)
        if not resp.ok:
            try:
                err = resp.json()
            except Exception:
                err = {'error': {'message': resp.text}}
            return jsonify({
                'success': False,
                'status': resp.status_code,
                'error': err.get('error', {}).get('message') or resp.reason
            }), resp.status_code

        data = resp.json()
        text = None
        try:
            text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text')
        except Exception:
            text = None

        if not text:
            return jsonify({
                'success': False,
                'error': 'No valid response received from AI service'
            }), 502

        return jsonify({'success': True, 'text': text})
    except requests.Timeout:
        return jsonify({'success': False, 'error': 'Upstream AI service timeout'}), 504
    except Exception as e:
        logger.error(f"Error in proxy_gemini_generate: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/oxygen/stations', methods=['POST'])
def create_oxygen_station():
    """Create a new oxygen station"""
    try:
        data = request.get_json()
        
        # Convert date strings to datetime objects
        for date_field in ['last_refill', 'next_maintenance']:
            if date_field in data and isinstance(data[date_field], str):
                data[date_field] = datetime.fromisoformat(data[date_field].replace('Z', '+00:00'))
        
        station_data = CreateOxygenStation(**data)
        result = OxygenService.create_station(station_data)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': result.data.__dict__,
                'insert_id': result.insert_id
            }), 201
        else:
            return jsonify({'success': False, 'error': result.error}), 400
            
    except Exception as e:
        logger.error(f"Error in create_oxygen_station: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/oxygen/stations/<int:station_id>', methods=['GET'])
def get_oxygen_station_by_id(station_id):
    """Get oxygen station by ID"""
    try:
        result = OxygenService.find_station_by_id(station_id)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': result.data.__dict__
            })
        else:
            return jsonify({'success': False, 'error': result.error}), 404
            
    except Exception as e:
        logger.error(f"Error in get_oxygen_station_by_id: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/oxygen/stations/<int:station_id>/readings', methods=['POST'])
def create_oxygen_reading(station_id):
    """Create a new oxygen reading for a station"""
    try:
        data = request.get_json()
        data['station_id'] = station_id
        
        reading_data = CreateOxygenReading(**data)
        result = OxygenService.create_reading(reading_data)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': result.data
            }), 201
        else:
            return jsonify({'success': False, 'error': result.error}), 400
            
    except Exception as e:
        logger.error(f"Error in create_oxygen_reading: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/oxygen/stations/<int:station_id>/readings', methods=['GET'])
def get_oxygen_readings(station_id):
    """Get readings for a specific oxygen station"""
    try:
        pagination = PaginationParams(
            page=int(request.args.get('page', 1)),
            limit=int(request.args.get('limit', 50)),
            sort_by=request.args.get('sort_by', 'timestamp'),
            sort_order=request.args.get('sort_order', 'DESC')
        )
        
        result = OxygenService.get_readings_for_station(station_id, pagination)
        
        if result.success:
            return jsonify({
                'success': True,
                'data': {
                    'readings': [r.__dict__ for r in result.data.data],
                    'pagination': {
                        'total': result.data.total,
                        'page': result.data.page,
                        'limit': result.data.limit,
                        'total_pages': result.data.total_pages
                    }
                }
            })
        else:
            return jsonify({'success': False, 'error': result.error}), 400
            
    except Exception as e:
        logger.error(f"Error in get_oxygen_readings: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================================
# APPLICATION INITIALIZATION
# ============================================================================

def graceful_shutdown(signum, frame):
    """Handle graceful shutdown"""
    logger.info('Received shutdown signal, shutting down database service...')
    DatabaseService.shutdown()
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGINT, graceful_shutdown)
signal.signal(signal.SIGTERM, graceful_shutdown)

if __name__ == '__main__':
    # Initialize database
    if not DatabaseService.initialize():
        logger.error('Failed to initialize database service. Exiting.')
        sys.exit(1)
    
    # Start Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )