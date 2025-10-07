import React, { useState } from 'react';
import { Search, Plus, Edit, Eye, Phone, Mail, Calendar, User, FileText } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  lastVisit: string;
  condition: string;
  status: 'stable' | 'critical' | 'recovering';
  room?: string;
}

const PatientManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const patients: Patient[] = [
    {
      id: 'P001',
      name: 'John Anderson',
      age: 45,
      gender: 'Male',
      phone: '(555) 123-4567',
      email: 'john.anderson@email.com',
      lastVisit: '2024-01-15',
      condition: 'Hypertension',
      status: 'stable',
      room: '204'
    },
    {
      id: 'P002',
      name: 'Maria Garcia',
      age: 32,
      gender: 'Female',
      phone: '(555) 987-6543',
      email: 'maria.garcia@email.com',
      lastVisit: '2024-01-14',
      condition: 'Post-operative care',
      status: 'recovering',
      room: '301'
    },
    {
      id: 'P003',
      name: 'Robert Johnson',
      age: 67,
      gender: 'Male',
      phone: '(555) 456-7890',
      email: 'robert.johnson@email.com',
      lastVisit: '2024-01-13',
      condition: 'Cardiac arrest',
      status: 'critical',
      room: 'ICU-5'
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'recovering': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage patient records and medical history</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Stable</option>
            <option>Critical</option>
            <option>Recovering</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Patients ({filteredPatients.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{patient.name}</h4>
                      <p className="text-gray-600">ID: {patient.id} • {patient.age} years • {patient.gender}</p>
                      <p className="text-sm text-gray-500">{patient.condition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </span>
                    {patient.room && (
                      <p className="text-sm text-gray-600 mt-1">Room: {patient.room}</p>
                    )}
                    <div className="flex space-x-2 mt-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-800">
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedPatient ? (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h3>
                  <p className="text-gray-600">{selectedPatient.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedPatient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedPatient.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Medical Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Age:</span> {selectedPatient.age} years</p>
                    <p><span className="font-medium">Gender:</span> {selectedPatient.gender}</p>
                    <p><span className="font-medium">Condition:</span> {selectedPatient.condition}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPatient.status)}`}>
                        {selectedPatient.status.charAt(0).toUpperCase() + selectedPatient.status.slice(1)}
                      </span>
                    </p>
                    {selectedPatient.room && (
                      <p><span className="font-medium">Room:</span> {selectedPatient.room}</p>
                    )}
                    <p><span className="font-medium">Last Visit:</span> {selectedPatient.lastVisit}</p>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Medical Records
                  </button>
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Schedule Appointment
                  </button>
                  <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">
                    Update Information
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;