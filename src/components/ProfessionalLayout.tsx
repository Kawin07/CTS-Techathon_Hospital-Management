import React, { useState } from 'react';
import ProfessionalHeader from './ProfessionalHeader';
import ProfessionalHero from './ProfessionalHero';

interface ProfessionalLayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onModuleChange: (module: string) => void;
}

const ProfessionalLayout: React.FC<ProfessionalLayoutProps> = ({ 
  children, 
  currentModule, 
  onModuleChange 
}) => {
  const [showHero, setShowHero] = useState(currentModule === 'home');

  const handleNavigation = (section: string) => {
    if (section === 'home') {
      setShowHero(true);
    } else {
      setShowHero(false);
    }
    onModuleChange(section);
  };

  // Show hero section for home/landing page
  if (showHero || currentModule === 'home') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader onNavigate={handleNavigation} currentSection={currentModule} />
        <ProfessionalHero onNavigate={handleNavigation} />
        
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">HealthCare EMR</h3>
                <p className="text-gray-400">Professional Hospital Management System with advanced features.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => handleNavigation('dashboard')} className="hover:text-white">Dashboard</button></li>
                  <li><button onClick={() => handleNavigation('patients')} className="hover:text-white">Patients</button></li>
                  <li><button onClick={() => handleNavigation('appointments')} className="hover:text-white">Appointments</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => handleNavigation('emergency')} className="hover:text-white">Emergency</button></li>
                  <li><button onClick={() => handleNavigation('oxygen')} className="hover:text-white">Monitoring</button></li>
                  <li><button onClick={() => handleNavigation('pharmacy')} className="hover:text-white">Pharmacy</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <p className="text-gray-400">Emergency: +1-800-HOSPITAL<br />General: +1-800-HEALTH</p>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 HealthCare EMR. Professional Hospital Management System.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Show application interface for other modules
  return (
    <div className="min-h-screen bg-gray-50">
      <ProfessionalHeader onNavigate={handleNavigation} currentSection={currentModule} />
      
      {/* Module Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button 
              onClick={() => handleNavigation('home')} 
              className="hover:text-teal-600 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium capitalize">
              {currentModule === 'predictive' ? 'AI Analytics' : 
               currentModule === 'alerts' ? 'Smart Alerts' : 
               currentModule}
            </span>
          </nav>
        </div>

        {/* Module Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 capitalize mb-2">
                  {currentModule === 'predictive' ? 'AI Analytics Dashboard' : 
                   currentModule === 'alerts' ? 'Smart Alert Management' : 
                   currentModule === 'oxygen' ? 'Oxygen Monitoring System' :
                   currentModule === 'beds' ? 'Bed Management System' :
                   currentModule === 'staff' ? 'Consultants & Workers Management' :
                   `${currentModule} Management`}
                </h1>
                <p className="text-gray-600">
                  {currentModule === 'dashboard' ? 'Comprehensive overview of hospital operations and key metrics' :
                   currentModule === 'predictive' ? 'Advanced AI-powered analytics and predictive insights' :
                   currentModule === 'alerts' ? 'Real-time alert monitoring and management system' :
                   currentModule === 'patients' ? 'Complete patient information and care management' :
                   currentModule === 'appointments' ? 'Schedule and manage patient appointments' :
                   currentModule === 'beds' ? 'Hospital bed allocation and availability tracking' :
                   currentModule === 'staff' ? 'Consultants and workers scheduling and information management' :
                   currentModule === 'oxygen' ? 'Real-time oxygen level monitoring and alerts' :
                   currentModule === 'pharmacy' ? 'Medication inventory and prescription management' :
                   currentModule === 'emergency' ? '24/7 emergency services and response coordination' :
                   currentModule === 'reports' ? 'Comprehensive reporting and analytics dashboard' :
                   'Professional hospital management system'}
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                {currentModule !== 'home' && (
                  <button
                    onClick={() => handleNavigation('home')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Home
                  </button>
                )}
                <button
                  onClick={() => handleNavigation('dashboard')}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ProfessionalLayout;