import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit, Trash2, Filter, Search, ChevronLeft, ChevronRight, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

interface Schedule {
  id: string;
  staffId: string;
  staffName: string;
  staffType: 'consultant' | 'worker';
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  location: string;
  notes?: string;
}

interface StaffMember {
  id: string;
  name: string;
  type: 'consultant' | 'worker';
  department: string;
  specialization: string[];
  maxHoursPerWeek: number;
  preferredShifts: string[];
}

const StaffScheduling: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStaffType, setSelectedStaffType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [formData, setFormData] = useState({
    staffId: '',
    department: '',
    date: '',
    startTime: '',
    endTime: '',
    shift: 'morning' as 'morning' | 'afternoon' | 'night',
    location: '',
    notes: ''
  });

  const staffMembers: StaffMember[] = [
    {
      id: 'S001',
      name: 'Dr. Sarah Johnson',
      type: 'consultant',
      department: 'Emergency',
      specialization: ['Emergency Medicine', 'Critical Care'],
      maxHoursPerWeek: 60,
      preferredShifts: ['morning', 'afternoon']
    },
    {
      id: 'S002',
      name: 'Emily Davis',
      type: 'worker',
      department: 'ICU',
      specialization: ['Critical Care', 'Patient Monitoring'],
      maxHoursPerWeek: 40,
      preferredShifts: ['morning', 'night']
    },
    {
      id: 'S003',
      name: 'Dr. Michael Chen',
      type: 'consultant',
      department: 'Surgery',
      specialization: ['Cardiothoracic Surgery', 'General Surgery'],
      maxHoursPerWeek: 50,
      preferredShifts: ['morning', 'afternoon']
    },
    {
      id: 'S004',
      name: 'Maria Rodriguez',
      type: 'worker',
      department: 'General',
      specialization: ['General Care', 'Medication Administration'],
      maxHoursPerWeek: 40,
      preferredShifts: ['afternoon', 'night']
    },
    {
      id: 'S005',
      name: 'David Wilson',
      type: 'worker',
      department: 'Radiology',
      specialization: ['X-Ray', 'CT Scan', 'MRI'],
      maxHoursPerWeek: 40,
      preferredShifts: ['morning', 'afternoon']
    }
  ];

  // Initialize schedules with sample data
  useEffect(() => {
    const initialSchedules: Schedule[] = [
      {
        id: 'SCH001',
        staffId: 'S001',
        staffName: 'Dr. Sarah Johnson',
        staffType: 'consultant',
        department: 'Emergency',
        date: '2025-09-25',
        startTime: '06:00',
        endTime: '14:00',
        shift: 'morning',
        status: 'confirmed',
        location: 'Emergency Room',
        notes: 'Primary emergency consultant'
      },
      {
        id: 'SCH002',
        staffId: 'S002',
        staffName: 'Emily Davis',
        staffType: 'worker',
        department: 'ICU',
        date: '2025-09-25',
        startTime: '06:00',
        endTime: '14:00',
        shift: 'morning',
        status: 'confirmed',
        location: 'ICU Ward'
      },
      {
        id: 'SCH003',
        staffId: 'S003',
        staffName: 'Dr. Michael Chen',
        staffType: 'consultant',
        department: 'Surgery',
        date: '2025-09-25',
        startTime: '14:00',
        endTime: '22:00',
        shift: 'afternoon',
        status: 'scheduled',
        location: 'Operating Room 2'
      },
      {
        id: 'SCH004',
        staffId: 'S004',
        staffName: 'Maria Rodriguez',
        staffType: 'worker',
        department: 'General',
        date: '2025-09-26',
        startTime: '22:00',
        endTime: '06:00',
        shift: 'night',
        status: 'scheduled',
        location: 'General Ward'
      },
      {
        id: 'SCH005',
        staffId: 'S005',
        staffName: 'David Wilson',
        staffType: 'worker',
        department: 'Radiology',
        date: '2025-09-26',
        startTime: '08:00',
        endTime: '16:00',
        shift: 'morning',
        status: 'confirmed',
        location: 'Radiology Department'
      }
    ];
    setSchedules(initialSchedules);
  }, []);

  const departments = ['Emergency', 'ICU', 'Surgery', 'General', 'Radiology', 'Cardiology', 'Laboratory'];
  const shifts = ['morning', 'afternoon', 'night'];

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      staffId: '',
      department: '',
      date: '',
      startTime: '',
      endTime: '',
      shift: 'morning',
      location: '',
      notes: ''
    });
  };

  // Get staff member by ID
  const getStaffMember = (staffId: string) => {
    return staffMembers.find(staff => staff.id === staffId);
  };

  // Determine shift based on time
  const determineShift = (startTime: string): 'morning' | 'afternoon' | 'night' => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 6 && hour < 14) return 'morning';
    if (hour >= 14 && hour < 22) return 'afternoon';
    return 'night';
  };

  // Validate schedule
  const validateSchedule = (data: typeof formData): string | null => {
    if (!data.staffId) return 'Please select a staff member';
    if (!data.date) return 'Please select a date';
    if (!data.startTime || !data.endTime) return 'Please select start and end times';
    if (!data.location) return 'Please enter a location';
    
    const startHour = parseInt(data.startTime.split(':')[0]);
    const endHour = parseInt(data.endTime.split(':')[0]);
    
    // Check for time conflicts (basic validation)
    if (startHour >= endHour && !(startHour >= 22 || endHour <= 6)) {
      return 'End time must be after start time';
    }

    // Check for existing conflicts
    const conflicts = schedules.filter(schedule => 
      schedule.staffId === data.staffId && 
      schedule.date === data.date &&
      schedule.id !== editingSchedule?.id
    );
    
    if (conflicts.length > 0) {
      return 'Staff member already has a schedule for this date';
    }

    return null;
  };

  const filteredSchedules = schedules.filter(schedule => {
    const departmentMatch = selectedDepartment === 'all' || schedule.department === selectedDepartment;
    const typeMatch = selectedStaffType === 'all' || schedule.staffType === selectedStaffType;
    const searchMatch = schedule.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       schedule.department.toLowerCase().includes(searchTerm.toLowerCase());
    return departmentMatch && typeMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning': return 'bg-yellow-100 text-yellow-800';
      case 'afternoon': return 'bg-orange-100 text-orange-800';
      case 'night': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateHours = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let start = startHour * 60 + startMin;
    let end = endHour * 60 + endMin;
    
    // Handle overnight shifts
    if (end < start) {
      end += 24 * 60;
    }
    
    return ((end - start) / 60).toFixed(1);
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      staffId: schedule.staffId,
      department: schedule.department,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      shift: schedule.shift,
      location: schedule.location,
      notes: schedule.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
      showNotification('success', 'Schedule deleted successfully');
    }
  };

  const handleSaveSchedule = () => {
    const validation = validateSchedule(formData);
    if (validation) {
      showNotification('error', validation);
      return;
    }

    const staffMember = getStaffMember(formData.staffId);
    if (!staffMember) {
      showNotification('error', 'Selected staff member not found');
      return;
    }

    const scheduleData: Schedule = {
      id: editingSchedule ? editingSchedule.id : `SCH${Date.now()}`,
      staffId: formData.staffId,
      staffName: staffMember.name,
      staffType: staffMember.type,
      department: formData.department || staffMember.department,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      shift: formData.shift,
      status: 'scheduled',
      location: formData.location,
      notes: formData.notes
    };

    if (editingSchedule) {
      setSchedules(schedules.map(schedule => 
        schedule.id === editingSchedule.id ? scheduleData : schedule
      ));
      showNotification('success', 'Schedule updated successfully');
    } else {
      setSchedules([...schedules, scheduleData]);
      showNotification('success', 'Schedule created successfully');
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleStatusChange = (scheduleId: string, newStatus: Schedule['status']) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === scheduleId ? { ...schedule, status: newStatus } : schedule
    ));
    showNotification('success', `Schedule ${newStatus} successfully`);
  };

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-determine shift when time changes
      if (field === 'startTime' && value) {
        updated.shift = determineShift(value);
      }
      
      // Auto-set department based on staff selection
      if (field === 'staffId' && value) {
        const staff = getStaffMember(value);
        if (staff) {
          updated.department = staff.department;
        }
      }
      
      return updated;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getCurrentWeekDates = () => {
    const startDate = new Date(currentDate);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day;
    startDate.setDate(diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredSchedules.filter(schedule => schedule.date === dateStr);
  };

  const weekDates = getCurrentWeekDates();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Scheduling</h1>
        <p className="text-gray-600">Manage consultant and worker schedules, shifts, and assignments</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        {/* Top Row - View Controls and Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month View
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
                {viewMode === 'week' 
                  ? `Week of ${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
              </div>
              
              <button
                onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setCurrentDate(new Date())}
                className="ml-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row - Filters and Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2 w-full sm:w-auto">
              <select
                value={selectedStaffType}
                onChange={(e) => setSelectedStaffType(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                <option value="consultant">Consultants</option>
                <option value="worker">Workers</option>
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Schedule Button */}
          <div className="w-full sm:w-auto">
            <button
              onClick={handleAddSchedule}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-8 gap-0">
            {/* Time column header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
              Time
            </div>
            
            {/* Day headers */}
            {weekDates.map((date, index) => (
              <div key={index} className="p-4 border-b border-gray-200 bg-gray-50 text-center">
                <div className="font-semibold text-gray-900">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm text-gray-500">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {['06:00-14:00', '14:00-22:00', '22:00-06:00'].map((timeSlot, timeIndex) => (
            <div key={timeIndex} className="grid grid-cols-8 gap-0 border-b border-gray-100">
              {/* Time slot label */}
              <div className="p-4 bg-gray-50 border-r border-gray-200 font-medium text-gray-700">
                {timeSlot}
                <div className="text-xs text-gray-500 mt-1">
                  {timeIndex === 0 ? 'Morning' : timeIndex === 1 ? 'Afternoon' : 'Night'}
                </div>
              </div>
              
              {/* Day columns */}
              {weekDates.map((date, dayIndex) => {
                const daySchedules = getSchedulesForDate(date).filter(schedule => {
                  const shiftTimeRanges = {
                    morning: '06:00-14:00',
                    afternoon: '14:00-22:00',
                    night: '22:00-06:00'
                  };
                  return shiftTimeRanges[schedule.shift as keyof typeof shiftTimeRanges] === timeSlot;
                });

                return (
                  <div key={dayIndex} className="p-2 border-r border-gray-100 min-h-[120px]">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`mb-2 p-2 rounded-lg border text-xs ${getStatusColor(schedule.status)} hover:shadow-md transition-shadow group`}
                      >
                        <div className="font-semibold truncate">{schedule.staffName}</div>
                        <div className="text-xs opacity-75">{schedule.department}</div>
                        <div className="text-xs opacity-75">{schedule.location}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`px-1 py-0.5 rounded text-xs ${getShiftColor(schedule.shift)}`}>
                            {schedule.shift}
                          </span>
                          <span className="text-xs">
                            {calculateHours(schedule.startTime, schedule.endTime)}h
                          </span>
                        </div>
                        {/* Quick Actions - Show on hover */}
                        <div className="flex justify-end space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSchedule(schedule);
                            }}
                            className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSchedule(schedule.id);
                            }}
                            className="p-1 hover:bg-white hover:bg-opacity-50 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Month View - List Format */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Overview</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{schedule.staffName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        schedule.staffType === 'consultant' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {schedule.staffType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(schedule.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      <div className="text-xs text-gray-500">
                        ({calculateHours(schedule.startTime, schedule.endTime)} hours)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShiftColor(schedule.shift)}`}>
                        {schedule.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={schedule.status}
                        onChange={(e) => handleStatusChange(schedule.id, e.target.value as Schedule['status'])}
                        className={`text-xs font-semibold rounded-full border px-2 py-1 ${getStatusColor(schedule.status)} cursor-pointer hover:opacity-80`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="text-teal-600 hover:text-teal-900 p-1 hover:bg-teal-50 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{filteredSchedules.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredSchedules.filter(s => s.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredSchedules.filter(s => s.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Filter className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredSchedules.reduce((total, schedule) => 
                  total + parseFloat(calculateHours(schedule.startTime, schedule.endTime)), 0
                ).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center space-x-2 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Modal for Add/Edit Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Staff Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Member *
                  </label>
                  <select
                    value={formData.staffId}
                    onChange={(e) => handleFormChange('staffId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Select staff member</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.type} - {staff.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleFormChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleFormChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleFormChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => handleFormChange('shift', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="morning">Morning (6AM - 2PM)</option>
                    <option value="afternoon">Afternoon (2PM - 10PM)</option>
                    <option value="night">Night (10PM - 6AM)</option>
                  </select>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    placeholder="e.g., Emergency Room, ICU Ward, Operating Room 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Additional notes or special instructions..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
              </div>

              {/* Selected Staff Info */}
              {formData.staffId && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Staff Information</h4>
                  {(() => {
                    const staff = getStaffMember(formData.staffId);
                    return staff ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-2 font-medium capitalize">{staff.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Department:</span>
                          <span className="ml-2 font-medium">{staff.department}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Max Hours/Week:</span>
                          <span className="ml-2 font-medium">{staff.maxHoursPerWeek}h</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Specializations:</span>
                          <span className="ml-2 font-medium">{staff.specialization.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Preferred Shifts:</span>
                          <span className="ml-2 font-medium capitalize">{staff.preferredShifts.join(', ')}</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{editingSchedule ? 'Update' : 'Create'} Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffScheduling;