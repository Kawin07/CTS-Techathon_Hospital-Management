import React, { useState } from 'react';
import { Bed, User, Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';

interface BedInfo {
  id: string;
  room: string;
  floor: number;
  type: 'general' | 'icu' | 'emergency' | 'private';
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  patient?: {
    name: string;
    id: string;
    admissionDate: string;
    condition: string;
  };
  equipment: string[];
  lastCleaned: string;
}

const BedManagement: React.FC = () => {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const beds: BedInfo[] = [
    {
      id: 'B001',
      room: '101',
      floor: 1,
      type: 'general',
      status: 'occupied',
      patient: {
        name: 'John Anderson',
        id: 'P001',
        admissionDate: '2024-01-10',
        condition: 'Post-surgery recovery'
      },
      equipment: ['Heart Monitor', 'IV Drip'],
      lastCleaned: '2024-01-15 06:00'
    },
    {
      id: 'B002',
      room: '102',
      floor: 1,
      type: 'general',
      status: 'available',
      equipment: ['Basic Medical'],
      lastCleaned: '2024-01-15 08:00'
    },
    {
      id: 'ICU001',
      room: 'ICU-1',
      floor: 2,
      type: 'icu',
      status: 'occupied',
      patient: {
        name: 'Maria Garcia',
        id: 'P002',
        admissionDate: '2024-01-12',
        condition: 'Critical care'
      },
      equipment: ['Ventilator', 'Heart Monitor', 'Defibrillator', 'IV Drip'],
      lastCleaned: '2024-01-15 04:00'
    },
    {
      id: 'E001',
      room: 'ER-1',
      floor: 1,
      type: 'emergency',
      status: 'cleaning',
      equipment: ['Emergency Equipment'],
      lastCleaned: '2024-01-15 09:30'
    }
  ];

  const filteredBeds = beds.filter(bed => {
    const typeMatch = filterType === 'all' || bed.type === filterType;
    const statusMatch = filterStatus === 'all' || bed.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'cleaning': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'icu': return 'bg-red-50 border-red-200';
      case 'emergency': return 'bg-orange-50 border-orange-200';
      case 'private': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    cleaning: beds.filter(b => b.status === 'cleaning').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bed Management</h1>
        <p className="text-gray-600">Monitor and manage hospital bed availability and assignments</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Beds</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            <p className="text-sm text-gray-600">Available</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.occupied}</p>
            <p className="text-sm text-gray-600">Occupied</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.cleaning}</p>
            <p className="text-sm text-gray-600">Cleaning</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
            <p className="text-sm text-gray-600">Maintenance</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="icu">ICU</option>
            <option value="emergency">Emergency</option>
            <option value="private">Private</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Bed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBeds.map((bed) => (
          <div key={bed.id} className={`bg-white rounded-lg shadow-sm border-2 ${getTypeColor(bed.type)} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Bed className="w-6 h-6 text-gray-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Room {bed.room}</h3>
                  <p className="text-sm text-gray-600">Floor {bed.floor} • {bed.type.toUpperCase()}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bed.status)}`}>
                {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
              </span>
            </div>

            {bed.patient && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">{bed.patient.name}</span>
                </div>
                <p className="text-sm text-blue-700">ID: {bed.patient.id}</p>
                <p className="text-sm text-blue-700">Admitted: {bed.patient.admissionDate}</p>
                <p className="text-sm text-blue-700">{bed.patient.condition}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Equipment:</p>
                <div className="flex flex-wrap gap-1">
                  {bed.equipment.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Last cleaned: {bed.lastCleaned}</span>
              </div>

              <div className="flex space-x-2 pt-2">
                {bed.status === 'available' && (
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Assign Patient
                  </button>
                )}
                {bed.status === 'occupied' && (
                  <>
                    <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Discharge
                    </button>
                    <button className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg hover:bg-orange-700 transition-colors text-sm">
                      Transfer
                    </button>
                  </>
                )}
                {bed.status === 'cleaning' && (
                  <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Clean</span>
                  </button>
                )}
                {bed.status === 'maintenance' && (
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Mark Fixed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BedManagement;