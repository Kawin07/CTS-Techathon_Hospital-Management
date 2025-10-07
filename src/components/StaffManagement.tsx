import React, { useState } from 'react';
import { Users, Clock, Calendar, Award, Phone, Mail, MapPin, Filter } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  role: string;
  type: 'consultant' | 'worker';
  department: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'on-duty' | 'off-duty' | 'on-break' | 'emergency';
  phone: string;
  email: string;
  location: string;
  experience: number;
  specialization: string[];
  workload: number; // 0-100%
  nextShift: string;
}

const StaffManagement: React.FC = () => {
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterShift, setFilterShift] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const staff: Staff[] = [
    {
      id: 'S001',
      name: 'Dr. Sarah Johnson',
      role: 'Senior Consultant',
      type: 'consultant',
      department: 'Emergency',
      shift: 'morning',
      status: 'on-duty',
      phone: '(555) 123-4567',
      email: 'sarah.johnson@hospital.com',
      location: 'Emergency Room',
      experience: 8,
      specialization: ['Emergency Medicine', 'Critical Care'],
      workload: 75,
      nextShift: '2024-01-16 06:00'
    },
    {
      id: 'S002',
      name: 'Emily Davis',
      role: 'ICU Nurse',
      type: 'worker',
      department: 'ICU',
      shift: 'morning',
      status: 'on-duty',
      phone: '(555) 234-5678',
      email: 'emily.davis@hospital.com',
      location: 'ICU Ward',
      experience: 5,
      specialization: ['Critical Care', 'Patient Monitoring'],
      workload: 85,
      nextShift: '2024-01-16 14:00'
    },
    {
      id: 'S003',
      name: 'Dr. Michael Chen',
      role: 'Chief Surgeon',
      type: 'consultant',
      department: 'Surgery',
      shift: 'afternoon',
      status: 'off-duty',
      phone: '(555) 345-6789',
      email: 'michael.chen@hospital.com',
      location: 'Operating Room 2',
      experience: 12,
      specialization: ['Cardiothoracic Surgery', 'General Surgery'],
      workload: 60,
      nextShift: '2024-01-16 14:00'
    },
    {
      id: 'S004',
      name: 'Maria Rodriguez',
      role: 'General Ward Nurse',
      type: 'worker',
      department: 'General',
      shift: 'night',
      status: 'on-break',
      phone: '(555) 456-7890',
      email: 'maria.rodriguez@hospital.com',
      location: 'General Ward',
      experience: 3,
      specialization: ['General Care', 'Medication Administration'],
      workload: 70,
      nextShift: '2024-01-16 22:00'
    },
    {
      id: 'S005',
      name: 'David Wilson',
      role: 'Radiology Technician',
      type: 'worker',
      department: 'Radiology',
      shift: 'morning',
      status: 'on-duty',
      phone: '(555) 567-8901',
      email: 'david.wilson@hospital.com',
      location: 'Radiology Department',
      experience: 7,
      specialization: ['X-Ray', 'CT Scan', 'MRI'],
      workload: 55,
      nextShift: '2024-01-16 06:00'
    },
    {
      id: 'S006',
      name: 'Dr. Jennifer Liu',
      role: 'Cardiology Consultant',
      type: 'consultant',
      department: 'Cardiology',
      shift: 'morning',
      status: 'on-duty',
      phone: '(555) 678-9012',
      email: 'jennifer.liu@hospital.com',
      location: 'Cardiology Unit',
      experience: 15,
      specialization: ['Interventional Cardiology', 'Heart Surgery'],
      workload: 80,
      nextShift: '2024-01-16 06:00'
    },
    {
      id: 'S007',
      name: 'Robert Kim',
      role: 'Lab Technician',
      type: 'worker',
      department: 'Laboratory',
      shift: 'afternoon',
      status: 'on-duty',
      phone: '(555) 789-0123',
      email: 'robert.kim@hospital.com',
      location: 'Central Laboratory',
      experience: 4,
      specialization: ['Blood Analysis', 'Microbiology', 'Chemistry'],
      workload: 65,
      nextShift: '2024-01-16 14:00'
    }
  ];

  const filteredStaff = staff.filter(member => {
    const departmentMatch = filterDepartment === 'all' || member.department === filterDepartment;
    const shiftMatch = filterShift === 'all' || member.shift === filterShift;
    const typeMatch = filterType === 'all' || member.type === filterType;
    return departmentMatch && shiftMatch && typeMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-duty': return 'bg-green-100 text-green-800';
      case 'off-duty': return 'bg-gray-100 text-gray-800';
      case 'on-break': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload > 80) return 'bg-red-500';
    if (workload > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const departments = ['Emergency', 'ICU', 'Surgery', 'General', 'Radiology', 'Cardiology', 'Laboratory'];
  const shifts = ['morning', 'afternoon', 'night'];
  const types = ['consultant', 'worker'];

  const stats = {
    total: staff.length,
    consultants: staff.filter(s => s.type === 'consultant').length,
    workers: staff.filter(s => s.type === 'worker').length,
    onDuty: staff.filter(s => s.status === 'on-duty').length,
    onBreak: staff.filter(s => s.status === 'on-break').length,
    overloaded: staff.filter(s => s.workload > 80).length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consultants & Workers Management</h1>
        <p className="text-gray-600">Manage consultants, workers, schedules, workload optimization, and assignments</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Staff</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.consultants}</p>
            <p className="text-sm text-gray-600">Consultants</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.workers}</p>
            <p className="text-sm text-gray-600">Workers</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.onDuty}</p>
            <p className="text-sm text-gray-600">On Duty</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.onBreak}</p>
            <p className="text-sm text-gray-600">On Break</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.overloaded}</p>
            <p className="text-sm text-gray-600">Overloaded</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </option>
            ))}
          </select>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Shifts</option>
            {shifts.map(shift => (
              <option key={shift} value={shift}>
                {shift.charAt(0).toUpperCase() + shift.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredStaff.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all duration-200 ${
                selectedStaff?.id === member.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedStaff(member)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-gray-600">{member.role} • {member.department}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{member.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {member.status.replace('-', ' ').charAt(0).toUpperCase() + member.status.replace('-', ' ').slice(1)}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{member.shift.charAt(0).toUpperCase() + member.shift.slice(1)} shift</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Workload</span>
                  <span className="font-medium">{member.workload}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getWorkloadColor(member.workload)}`}
                    style={{ width: `${member.workload}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{member.experience} years</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Next: {member.nextShift}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Staff Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedStaff ? (
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStaff.name}</h3>
                  <p className="text-gray-600">{selectedStaff.role}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStaff.status)}`}>
                    {selectedStaff.status.replace('-', ' ').charAt(0).toUpperCase() + selectedStaff.status.replace('-', ' ').slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedStaff.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedStaff.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedStaff.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Work Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Department:</span> {selectedStaff.department}</p>
                    <p><span className="font-medium">Current Shift:</span> {selectedStaff.shift.charAt(0).toUpperCase() + selectedStaff.shift.slice(1)}</p>
                    <p><span className="font-medium">Experience:</span> {selectedStaff.experience} years</p>
                    <p><span className="font-medium">Next Shift:</span> {selectedStaff.nextShift}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Current Workload</h4>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Capacity</span>
                    <span className="font-medium">{selectedStaff.workload}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${getWorkloadColor(selectedStaff.workload)}`}
                      style={{ width: `${selectedStaff.workload}%` }}
                    ></div>
                  </div>
                  {selectedStaff.workload > 80 && (
                    <p className="text-sm text-red-600">⚠️ Staff member is overloaded</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedStaff.specialization.map((spec, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Assign Task
                  </button>
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Schedule Shift
                  </button>
                  <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">
                    View Performance
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select a staff member to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;