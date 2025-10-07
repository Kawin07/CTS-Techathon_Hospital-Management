import React, { useState } from 'react';
import { Calendar, User, Phone, Mail, MapPin, Stethoscope, Plus, Search, Filter } from 'lucide-react';

const AppointmentBooking: React.FC = () => {
  const [activeTab, setActiveTab] = useState('book');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample consultants data
  const consultants = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      experience: '15 years',
      rating: 4.9,
      image: '👩‍⚕️',
      available: true,
      nextSlot: '10:00 AM'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurology',
      experience: '12 years',
      rating: 4.8,
      image: '👨‍⚕️',
      available: true,
      nextSlot: '2:30 PM'
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      specialty: 'Pediatrics',
      experience: '10 years',
      rating: 4.9,
      image: '👩‍⚕️',
      available: false,
      nextSlot: 'Tomorrow 9:00 AM'
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'Orthopedics',
      experience: '18 years',
      rating: 4.7,
      image: '👨‍⚕️',
      available: true,
      nextSlot: '11:30 AM'
    }
  ];

  // Sample appointments data
  const appointments = [
    {
      id: 1,
      patientName: 'John Smith',
      consultant: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: '2025-09-25',
      time: '10:00 AM',
      status: 'confirmed',
      type: 'Follow-up'
    },
    {
      id: 2,
      patientName: 'Maria Garcia',
      consultant: 'Dr. Michael Chen',
      specialty: 'Neurology',
      date: '2025-09-25',
      time: '2:30 PM',
      status: 'pending',
      type: 'Consultation'
    },
    {
      id: 3,
      patientName: 'David Brown',
      consultant: 'Dr. Emily Davis',
      specialty: 'Pediatrics',
      date: '2025-09-26',
      time: '9:00 AM',
      status: 'confirmed',
      type: 'Check-up'
    }
  ];

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  const filteredConsultants = consultants.filter(consultant =>
    consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Management</h1>
        <p className="text-gray-600">Book appointments with our consultants and manage existing bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('book')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'book'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Book Appointment
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'manage'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage Appointments
        </button>
        <button
          onClick={() => setActiveTab('consultants')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'consultants'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          View Consultants
        </button>
      </div>

      {/* Book Appointment Tab */}
      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Book New Appointment</h2>
            
            <form className="space-y-6">
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter patient name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Consultant</label>
                <select
                  value={selectedConsultant}
                  onChange={(e) => setSelectedConsultant(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Choose a consultant</option>
                  {consultants.map((consultant) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name} - {consultant.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Brief description of the reason for appointment"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Book Appointment
              </button>
            </form>
          </div>

          {/* Available Slots */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Available Today</h2>
            
            <div className="space-y-4">
              {consultants.filter(c => c.available).map((consultant) => (
                <div key={consultant.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{consultant.image}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{consultant.name}</h3>
                        <p className="text-sm text-gray-600">{consultant.specialty}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>⭐ {consultant.rating}</span>
                          <span>•</span>
                          <span>{consultant.experience}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-medium">Available</div>
                      <div className="text-xs text-gray-500">Next: {consultant.nextSlot}</div>
                      <button className="mt-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manage Appointments Tab */}
      {activeTab === 'manage' && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Manage Appointments</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                <Plus className="h-4 w-4" />
                <span>New Appointment</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{appointment.patientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.consultant}</div>
                      <div className="text-sm text-gray-500">{appointment.specialty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.date}</div>
                      <div className="text-sm text-gray-500">{appointment.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-teal-600 hover:text-teal-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consultants Tab */}
      {activeTab === 'consultants' && (
        <div>
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search consultants by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
          </div>

          {/* Consultants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultants.map((consultant) => (
              <div key={consultant.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{consultant.image}</div>
                  <h3 className="text-xl font-bold text-gray-900">{consultant.name}</h3>
                  <p className="text-teal-600 font-medium">{consultant.specialty}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4" />
                    <span>{consultant.experience} experience</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>⭐</span>
                    <span>{consultant.rating} rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Main Hospital</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    consultant.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {consultant.available ? 'Available' : 'Busy'}
                  </div>
                  
                  <button 
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      consultant.available
                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!consultant.available}
                  >
                    Book Now
                  </button>
                </div>

                {!consultant.available && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Next available: {consultant.nextSlot}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;