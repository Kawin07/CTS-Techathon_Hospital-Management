import React, { useState, useEffect, useRef } from "react";
import { Stethoscope, Menu, X, ChevronDown } from "lucide-react";

interface ProfessionalHeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({
  onNavigate,
  currentSection,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      title: "Departments",
      items: [
        { name: "Emergency", id: "dept-emergency" },
        { name: "General Medicine", id: "dept-general-medicine" },
        { name: "Cardiology", id: "dept-cardiology" },
        { name: "Neurology", id: "dept-neurology" },
      ],
    },
    {
      title: "Monitoring",
      items: [
        { name: "Dashboard", id: "dashboard" },
        { name: "3D analysis", id: "3d" },
        { name: "Smart Alerts", id: "alerts" },
      ],
    },
    {
      title: "Analytics",
      items: [
        { name: "AI Predictive Analytics", id: "predictive" },
        { name: "What-If Analysis", id: "whatif" },
      ],
    },
    {
      title: "Medical Services",
      items: [
        { name: "Bed Management", id: "beds" },
        { name: "Oxygen Monitoring", id: "oxygen" },
        // { name: 'Pharmacy', id: 'pharmacy' },
        { name: "Ambulance Tracking", id: "ambulance" },
      ],
    },
    {
      title: "Consultants & Workers",
      items: [
        { name: "Consultants Management", id: "staff" },
        { name: "Staff Scheduling", id: "scheduling" },
      ],
    },
    {
      title: "Reports",
      items: [
        { name: "Analytics Dashboard", id: "reports" },
        { name: "Financial Reports", id: "reports" },
        { name: "Patient Reports", id: "reports" },
        { name: "Staff Reports", id: "reports" },
      ],
    },
  ];

  const handleDropdown = (title: string) => {
    setActiveDropdown(activeDropdown === title ? null : title);
  };

  const handleNavigation = (id: string) => {
    onNavigate(id);
    setActiveDropdown(null);
    setIsMenuOpen(false);
  };

  return (
    <header ref={headerRef} className="bg-white shadow-lg relative z-50">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HealthCare</h1>
                <p className="text-sm text-teal-600 font-medium">
                  Professional EMR System
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <div key={item.title} className="relative">
                <button
                  onClick={() => handleDropdown(item.title)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-teal-600 font-medium transition-colors py-2"
                >
                  <span>{item.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      activeDropdown === item.title ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === item.title && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {item.items.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleNavigation(subItem.id)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${
                          currentSection === subItem.id
                            ? "text-teal-600 bg-teal-50 border-l-4 border-teal-600"
                            : "text-gray-700 hover:text-teal-600"
                        }`}
                      >
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-teal-600"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center justify-center space-x-4 pb-4">
          {/* <button 
            onClick={() => handleNavigation('appointments')}
            className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Book Appointment</span>
          </button> */}

          <button
            onClick={() => handleNavigation("reports")}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Stethoscope className="h-5 w-5" />
            <span className="font-medium">View Reports</span>
          </button>

          <button
            onClick={() => handleNavigation("dashboard")}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Stethoscope className="h-5 w-5" />
            <span className="font-medium">Access Dashboard</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="px-4 py-6 space-y-4">
            {menuItems.map((item) => (
              <div key={item.title}>
                <button
                  onClick={() => handleDropdown(item.title)}
                  className="flex items-center justify-between w-full text-left text-gray-700 font-medium py-2"
                >
                  <span>{item.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      activeDropdown === item.title ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeDropdown === item.title && (
                  <div className="ml-4 mt-2 space-y-2">
                    {item.items.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleNavigation(subItem.id)}
                        className={`block w-full text-left text-sm py-2 px-2 rounded ${
                          currentSection === subItem.id
                            ? "text-teal-600 bg-teal-50"
                            : "text-gray-600 hover:text-teal-600"
                        }`}
                      >
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              {/* <button 
                onClick={() => handleNavigation('appointments')}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-lg"
              >
                <Calendar className="h-5 w-5" />
                <span>Book Appointment</span>
              </button> */}

              <button
                onClick={() => handleNavigation("reports")}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg"
              >
                <Stethoscope className="h-5 w-5" />
                <span>View Reports</span>
              </button>

              <button
                onClick={() => handleNavigation("dashboard")}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg"
              >
                <Stethoscope className="h-5 w-5" />
                <span>Access Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default ProfessionalHeader;
