import React, { useState } from 'react';
import { TrendingUp, Users, Bed, Activity, AlertTriangle, Clock, CheckCircle, Calendar, ArrowUpDown, Stethoscope, ShoppingCart, UserCheck, X } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<string>('');
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    department: '',
    condition: ''
  });
  const [appointmentData, setAppointmentData] = useState({
    patientName: '',
    doctorName: '',
    department: '',
    date: '',
    time: '',
    type: ''
  });
  const [transferData, setTransferData] = useState({
    patientId: '',
    fromWard: '',
    toWard: '',
    reason: '',
    priority: ''
  });

  const handleAdmitPatient = () => {
    setShowAdmitModal(true);
  };

  const handleScheduleAppointment = () => {
    setShowScheduleModal(true);
  };

  const handleEmergencyAlert = () => {
    setShowEmergencyModal(true);
  };

  const handleTransferPatient = () => {
    setShowTransferModal(true);
  };

  const submitAdmission = () => {
    // Here you would typically send data to backend
    console.log('Admitting patient:', patientData);
    alert('Patient admission initiated successfully!');
    setShowAdmitModal(false);
    setPatientData({ name: '', age: '', gender: '', contact: '', department: '', condition: '' });
  };

  const submitAppointment = () => {
    console.log('Scheduling appointment:', appointmentData);
    alert('Appointment scheduled successfully!');
    setShowScheduleModal(false);
    setAppointmentData({ patientName: '', doctorName: '', department: '', date: '', time: '', type: '' });
  };

  const submitEmergencyAlert = () => {
    console.log('Emergency alert:', emergencyAlert);
    alert('Emergency alert broadcasted to all departments!');
    setShowEmergencyModal(false);
    setEmergencyAlert('');
  };

  const submitTransfer = () => {
    console.log('Transferring patient:', transferData);
    alert('Patient transfer initiated successfully!');
    setShowTransferModal(false);
    setTransferData({ patientId: '', fromWard: '', toWard: '', reason: '', priority: '' });
  };
  const stats = [
    { title: 'Total Patients', value: '1,247', change: '+12%', icon: Users, color: 'blue' },
    { title: 'Available Beds', value: '23/156', change: '-5%', icon: Bed, color: 'green' },
    { title: 'Staff On Duty', value: '89', change: '+3%', icon: Activity, color: 'purple' },
    { title: 'Emergency Cases', value: '7', change: '+2', icon: AlertTriangle, color: 'red' },
  ];

  const recentAlerts = [
    { time: '5 min ago', action: 'Patient John Doe admitted to ICU', type: 'in-patient' },
    { time: '15 min ago', action: 'Patient Sarah Wilson discharged from Ward A', type: 'out-patient' },
    { time: '30 min ago', action: 'Patient moved from ICU to General Ward', type: 'ward-change' },
    { time: '45 min ago', action: '10 Oxygen cylinders purchased and delivered', type: 'oxygen-purchase' },
    { time: '1 hour ago', action: 'Emergency patient transferred to OR-3', type: 'emergency-transfer' },
    { time: '1.5 hours ago', action: 'Lab results updated for 12 patients', type: 'lab-update' },
  ];

  const consultantDistribution = [
    {
      department: 'Cardiology',
      doctors: { total: 4, active: 3 },
      nurses: { total: 8, active: 7 },
      staff: { total: 3, active: 2 },
      total: 15,
      activeTotal: 12
    },
    {
      department: 'Neurology',
      doctors: { total: 3, active: 2 },
      nurses: { total: 6, active: 5 },
      staff: { total: 2, active: 2 },
      total: 11,
      activeTotal: 9
    },
    {
      department: 'Orthopedics',
      doctors: { total: 5, active: 4 },
      nurses: { total: 10, active: 8 },
      staff: { total: 4, active: 3 },
      total: 19,
      activeTotal: 15
    },
    {
      department: 'Emergency',
      doctors: { total: 6, active: 6 },
      nurses: { total: 12, active: 11 },
      staff: { total: 5, active: 4 },
      total: 23,
      activeTotal: 21
    },
    {
      department: 'ICU',
      doctors: { total: 4, active: 3 },
      nurses: { total: 15, active: 14 },
      staff: { total: 3, active: 3 },
      total: 22,
      activeTotal: 20
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'in-patient':
        return 'bg-blue-500';
      case 'out-patient':
        return 'bg-green-500';
      case 'ward-change':
        return 'bg-purple-500';
      case 'oxygen-purchase':
        return 'bg-orange-500';
      case 'emergency-transfer':
        return 'bg-red-500';
      case 'lab-update':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Dr. Johnson. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from yesterday
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`w-3 h-3 rounded-full ${getAlertIcon(alert.type)}`}></div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{alert.action}</p>
                  <p className="text-gray-500 text-sm flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={handleAdmitPatient}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Admit New Patient</span>
              </div>
            </button>
            <button 
              onClick={handleScheduleAppointment}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Schedule Appointment</span>
              </div>
            </button>
            <button 
              onClick={handleEmergencyAlert}
              className="w-full bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Alert</span>
              </div>
            </button>
            <button 
              onClick={handleTransferPatient}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4" />
                <span>Transfer Patient</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bed Occupancy</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>ICU</span>
                <span>18/20 (90%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>General Ward</span>
                <span>45/80 (56%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '56%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Emergency</span>
                <span>8/15 (53%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '53%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-gray-600" />
              <span>Consultant Distribution</span>
            </div>
          </h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {consultantDistribution.map((dept, index) => (
              <div key={index} className="border-b border-gray-100 pb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{dept.department}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {dept.activeTotal} Active
                    </span>
                    <span className="text-xs text-gray-600">Total: {dept.total}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Doctors</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-medium">{dept.doctors.active}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{dept.doctors.total}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">Nurses</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-medium">{dept.nurses.active}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{dept.nurses.total}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Staff</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-medium">{dept.staff.active}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-600">{dept.staff.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Components */}
      
      {/* Admit Patient Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Admit New Patient</h2>
              <button onClick={() => setShowAdmitModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Patient Name"
                value={patientData.name}
                onChange={(e) => setPatientData({...patientData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Age"
                  value={patientData.age}
                  onChange={(e) => setPatientData({...patientData, age: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={patientData.gender}
                  onChange={(e) => setPatientData({...patientData, gender: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <input
                type="tel"
                placeholder="Contact Number"
                value={patientData.contact}
                onChange={(e) => setPatientData({...patientData, contact: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={patientData.department}
                onChange={(e) => setPatientData({...patientData, department: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                <option value="Emergency">Emergency</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="ICU">ICU</option>
              </select>
              <textarea
                placeholder="Medical Condition/Reason for Admission"
                value={patientData.condition}
                onChange={(e) => setPatientData({...patientData, condition: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={submitAdmission}
                  className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Admit Patient
                </button>
                <button
                  onClick={() => setShowAdmitModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Schedule Appointment</h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Patient Name"
                value={appointmentData.patientName}
                onChange={(e) => setAppointmentData({...appointmentData, patientName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Doctor Name"
                value={appointmentData.doctorName}
                onChange={(e) => setAppointmentData({...appointmentData, doctorName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                value={appointmentData.department}
                onChange={(e) => setAppointmentData({...appointmentData, department: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Dermatology">Dermatology</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="time"
                  value={appointmentData.time}
                  onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={appointmentData.type}
                onChange={(e) => setAppointmentData({...appointmentData, type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Appointment Type</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Check-up">Check-up</option>
                <option value="Emergency">Emergency</option>
              </select>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={submitAppointment}
                  className="flex-1 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Schedule
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Alert Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2" />
                Emergency Alert
              </h2>
              <button onClick={() => setShowEmergencyModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ This will broadcast an emergency alert to all departments and staff members.
                </p>
              </div>
              <textarea
                placeholder="Describe the emergency situation in detail..."
                value={emergencyAlert}
                onChange={(e) => setEmergencyAlert(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={submitEmergencyAlert}
                  className="flex-1 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Broadcast Alert
                </button>
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Patient Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Transfer Patient</h2>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Patient ID or Name"
                value={transferData.patientId}
                onChange={(e) => setTransferData({...transferData, patientId: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={transferData.fromWard}
                  onChange={(e) => setTransferData({...transferData, fromWard: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">From Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="General Ward">General Ward</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Cardiology">Cardiology</option>
                </select>
                <select
                  value={transferData.toWard}
                  onChange={(e) => setTransferData({...transferData, toWard: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">To Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="General Ward">General Ward</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Cardiology">Cardiology</option>
                </select>
              </div>
              <select
                value={transferData.priority}
                onChange={(e) => setTransferData({...transferData, priority: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Transfer Priority</option>
                <option value="Emergency">Emergency</option>
                <option value="Urgent">Urgent</option>
                <option value="Routine">Routine</option>
              </select>
              <textarea
                placeholder="Reason for transfer"
                value={transferData.reason}
                onChange={(e) => setTransferData({...transferData, reason: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={submitTransfer}
                  className="flex-1 bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Transfer Patient
                </button>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;