import React from 'react';
import { Calendar, Users, Stethoscope, Heart, TestTube, ArrowRight, Phone } from 'lucide-react';

interface ProfessionalHeroProps {
  onNavigate: (section: string) => void;
}

const ProfessionalHero: React.FC<ProfessionalHeroProps> = ({ onNavigate }) => {
  // const [searchQuery, setSearchQuery] = useState('');

  const quickAccessCards = [
    {
      title: "Emergency Services",
      subtitle: "24/7 Emergency care available",
      icon: Heart,
      color: "bg-red-50 border-red-200 hover:bg-red-100",
      iconColor: "text-red-600",
      onClick: () => onNavigate('emergency')
    },
    {
      title: "Patient Management",
      subtitle: "Comprehensive patient care system",
      icon: Users,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => onNavigate('patients')
    },
    {
      title: "AI Analytics",
      subtitle: "Advanced predictive healthcare insights",
      icon: Stethoscope,
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => onNavigate('predictive')
    },
    {
      title: "Smart Monitoring",
      subtitle: "Real-time health monitoring systems",
      icon: TestTube,
      color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
      iconColor: "text-teal-600",
      onClick: () => onNavigate('oxygen')
    }
  ];

  // const serviceCards = [
  //   {
  //     title: "Dashboard Overview",
  //     subtitle: "Complete hospital management",
  //     icon: Building2,
  //     color: "bg-gradient-to-br from-blue-600 to-blue-700",
  //     onClick: () => onNavigate('dashboard')
  //   },
  //   {
  //     title: "Book Appointment",
  //     subtitle: "Schedule with specialists",
  //     icon: Calendar,
  //     color: "bg-gradient-to-br from-teal-600 to-teal-700",
  //     onClick: () => onNavigate('appointments')
  //   }
  // ];

  const statsCards = [
    { number: "50K+", label: "Patients Served", color: "text-blue-600" },
    { number: "200+", label: "Medical Staff", color: "text-green-600" },
    { number: "24/7", label: "Emergency Care", color: "text-red-600" },
    { number: "99.9%", label: "Uptime", color: "text-purple-600" }
  ];

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-teal-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 to-teal-50/30"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-teal-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
      
      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Healthcare for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Good</span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-700 mb-6">
              Today. Tomorrow. Always
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Advanced Hospital Management System with AI-powered analytics, real-time monitoring, 
              and comprehensive patient care solutions
            </p>
          </div>

          {/* Search Bar */}
          {/* <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for Patients, Staff, Departments, or Services"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-5 pr-16 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 shadow-xl bg-white/90 backdrop-blur-sm"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all shadow-lg">
                <Search className="h-6 w-6" />
              </button>
            </div>
          </div> */}

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {quickAccessCards.map((card, index) => (
              <div
                key={index}
                onClick={card.onClick}
                className={`${card.color} p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group backdrop-blur-sm`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-2xl bg-white/80 ${card.iconColor} group-hover:scale-110 transition-transform shadow-lg`}>
                    <card.icon className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.subtitle}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Service Cards */}
          {/* <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Access Our Services</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {serviceCards.map((card, index) => (
                <div
                  key={index}
                  onClick={card.onClick}
                  className={`${card.color} p-10 rounded-3xl text-white cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 group relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center text-center space-y-6">
                    <div className="p-5 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-all shadow-lg">
                      <card.icon className="h-12 w-12" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                      <p className="text-lg opacity-90">{card.subtitle}</p>
                    </div>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Stats Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-6xl mx-auto mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsCards.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                    {stat.number}
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-10 max-w-6xl mx-auto text-white">
            <h3 className="text-3xl font-bold mb-8">Why Choose Our Healthcare System?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold mb-3">AI-Powered Analytics</h4>
                <p className="text-gray-300">Advanced predictive analytics for better patient outcomes and resource optimization</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold mb-3">Real-time Monitoring</h4>
                <p className="text-gray-300">24/7 patient monitoring with smart alerts and automated response systems</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold mb-3">Comprehensive Care</h4>
                <p className="text-gray-300">Complete healthcare ecosystem with integrated departments and services</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-16 p-8 bg-red-50 border-2 border-red-200 rounded-2xl max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <Phone className="h-8 w-8 text-red-600" />
              <div className="text-left">
                <h4 className="text-xl font-bold text-red-800">Emergency Hotline</h4>
                <p className="text-red-600">24/7 Emergency Services: <strong>+1-800-HOSPITAL</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalHero;