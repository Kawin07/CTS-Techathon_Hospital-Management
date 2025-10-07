import React, { useState } from 'react';
import { BarChart3, TrendingUp, FileText, Download, Filter, Eye, Users, Activity, Clock } from 'lucide-react';

const ReportsAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Sample data for reports
  const reportData = {
    patientStats: {
      totalAdmissions: 245,
      totalDischarges: 198,
      currentOccupancy: 85,
      averageStay: 4.2
    },
    departmentStats: [
      { name: 'Emergency', patients: 56, revenue: 10375000, satisfaction: 4.2 },
      { name: 'Surgery', patients: 34, revenue: 29050000, satisfaction: 4.8 },
      { name: 'ICU', patients: 28, revenue: 23240000, satisfaction: 4.5 },
      { name: 'General', patients: 89, revenue: 14940000, satisfaction: 4.3 },
      { name: 'Cardiology', patients: 38, revenue: 18260000, satisfaction: 4.6 }
    ],
    financialData: {
      totalRevenue: 95865000,
      totalExpenses: 73870000,
      netProfit: 21995000,
      profitMargin: 22.9
    },
    staffMetrics: {
      totalStaff: 145,
      consultants: 45,
      workers: 100,
      utilization: 82.5
    }
  };

  const recentReports = [
    {
      id: 1,
      title: 'Monthly Patient Flow Report',
      type: 'Patient Analytics',
      date: '2025-09-20',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Staff Utilization Report',
      type: 'HR Analytics',
      date: '2025-09-18',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 3,
      title: 'Revenue Analysis Q3',
      type: 'Financial',
      date: '2025-09-15',
      status: 'processing',
      downloadUrl: '#'
    },
    {
      id: 4,
      title: 'Equipment Maintenance Report',
      type: 'Operations',
      date: '2025-09-12',
      status: 'completed',
      downloadUrl: '#'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive reporting and analytics dashboard for hospital management</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview Dashboard
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Generate Reports
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Report History
        </button>
      </div>

      {/* Overview Dashboard Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Date Range Selector */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
              </select>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Departments</option>
                <option value="emergency">Emergency</option>
                <option value="surgery">Surgery</option>
                <option value="icu">ICU</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Admissions</p>
                  <p className="text-3xl font-bold">{reportData.patientStats.totalAdmissions}</p>
                  <p className="text-blue-100 text-sm">↑ 12% from last month</p>
                </div>
                <Users className="h-10 w-10 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Revenue</p>
                  <p className="text-3xl font-bold">₹{(reportData.financialData.totalRevenue / 100000).toFixed(1)}L</p>
                  <p className="text-green-100 text-sm">↑ 8% from last month</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Bed Occupancy</p>
                  <p className="text-3xl font-bold">{reportData.patientStats.currentOccupancy}%</p>
                  <p className="text-purple-100 text-sm">↑ 3% from last month</p>
                </div>
                <Activity className="h-10 w-10 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg. Stay</p>
                  <p className="text-3xl font-bold">{reportData.patientStats.averageStay}</p>
                  <p className="text-orange-100 text-sm">days per patient</p>
                </div>
                <Clock className="h-10 w-10 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Department Performance */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Department Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Patients</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.departmentStats.map((dept, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{dept.name}</td>
                      <td className="py-3 px-4 text-gray-600">{dept.patients}</td>
                      <td className="py-3 px-4 text-gray-600">₹{dept.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">{dept.satisfaction}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < Math.floor(dept.satisfaction) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-semibold text-green-600">₹{reportData.financialData.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-semibold text-red-600">₹{reportData.financialData.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-900 font-semibold">Net Profit</span>
                  <span className="font-bold text-green-600">₹{reportData.financialData.netProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profit Margin</span>
                  <span className="font-semibold text-blue-600">{reportData.financialData.profitMargin}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Staff Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Staff</span>
                  <span className="font-semibold text-gray-900">{reportData.staffMetrics.totalStaff}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultants</span>
                  <span className="font-semibold text-blue-600">{reportData.staffMetrics.consultants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Workers</span>
                  <span className="font-semibold text-purple-600">{reportData.staffMetrics.workers}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-900 font-semibold">Utilization Rate</span>
                  <span className="font-bold text-green-600">{reportData.staffMetrics.utilization}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Generate New Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Patient Reports */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Patient Reports</h3>
              </div>
              <p className="text-gray-600 mb-4">Generate comprehensive patient analytics and flow reports</p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• Admission/Discharge patterns</li>
                <li>• Patient demographics</li>
                <li>• Treatment outcomes</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Generate Report
              </button>
            </div>

            {/* Financial Reports */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
              </div>
              <p className="text-gray-600 mb-4">Detailed financial analysis and revenue reports</p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• Revenue by department</li>
                <li>• Cost analysis</li>
                <li>• Profit margins</li>
              </ul>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Generate Report
              </button>
            </div>

            {/* Staff Reports */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Staff Reports</h3>
              </div>
              <p className="text-gray-600 mb-4">Staff utilization and performance analytics</p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• Consultant performance</li>
                <li>• Worker productivity</li>
                <li>• Schedule optimization</li>
              </ul>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Generate Report
              </button>
            </div>

            {/* Operations Reports */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Operations Reports</h3>
              </div>
              <p className="text-gray-600 mb-4">Operational efficiency and resource utilization</p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• Bed occupancy rates</li>
                <li>• Equipment utilization</li>
                <li>• Service delivery metrics</li>
              </ul>
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                Generate Report
              </button>
            </div>

            {/* Quality Reports */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quality Reports</h3>
              </div>
              <p className="text-gray-600 mb-4">Patient satisfaction and quality metrics</p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• Patient satisfaction scores</li>
                <li>• Treatment quality indicators</li>
                <li>• Safety metrics</li>
              </ul>
              <button className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                Generate Report
              </button>
            </div>

            {/* Custom Reports */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Custom Reports</h3>
              </div>
              <p className="text-gray-600 mb-4">Build custom reports with specific parameters</p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• Custom date ranges</li>
                <li>• Specific departments</li>
                <li>• Custom metrics</li>
              </ul>
              <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                Create Custom Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Report History</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>All Types</option>
                  <option>Patient Analytics</option>
                  <option>Financial</option>
                  <option>HR Analytics</option>
                  <option>Operations</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Generated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{report.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{report.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{report.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button className="text-purple-600 hover:text-purple-900 flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        {report.status === 'completed' && (
                          <button className="text-green-600 hover:text-green-900 flex items-center space-x-1 ml-3">
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;