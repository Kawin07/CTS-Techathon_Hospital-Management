import React from 'react';
import { User, Bell, Search, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onModuleChange: (module: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentModule, onModuleChange }) => {
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'predictive', name: 'AI Analytics', icon: '🧠' },
    { id: 'alerts', name: 'Smart Alerts', icon: '🔔' },
    { id: 'patients', name: 'Patients', icon: '👥' },
    { id: 'appointments', name: 'Appointments', icon: '📅' },
    { id: 'beds', name: 'Beds', icon: '🛏️' },
    { id: 'staff', name: 'Staff', icon: '👨‍⚕️' },
    { id: 'oxygen', name: 'Oxygen', icon: '💨' },
    { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
    { id: 'emergency', name: 'Emergency', icon: '🚨' },
    { id: 'reports', name: 'Reports', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H+</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">HealthCare EMR</h1>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patients, appointments..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center space-x-2">
                <User className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Emergency Medicine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <div className="p-6">
            <div className="space-y-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    currentModule === module.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{module.icon}</span>
                  <span className="font-medium">{module.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;