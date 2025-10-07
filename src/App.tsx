import React, { useState } from "react";
import ProfessionalLayout from "./components/ProfessionalLayout";
import Dashboard from "./components/Dashboard";
import PatientManagement from "./components/PatientManagement";
import BedManagement from "./components/BedManagement";
import OxygenMonitoring from "./components/OxygenMonitoring";
import StaffManagement from "./components/StaffManagement";
import StaffScheduling from "./components/StaffScheduling";
import PredictiveDashboard from "./components/PredictiveDashboard";
import AlertManagement from "./components/AlertManagement";
import AppointmentBooking from "./components/AppointmentBooking";
import ReportsAnalytics from "./components/ReportsAnalytics";
import AmbulanceTracking from "./components/AmbulanceTracking";
import HospitalVisualization3D from "./components/HospitalVisualization3D";
import WhatIfAnalysis from "./components/WhatIfAnalysis";

// Department-specific components
import EmergencyDepartment from "./components/EmergencyDepartment";
import GeneralMedicine from "./components/GeneralMedicine";
import Cardiology from "./components/Cardiology";
import Neurology from "./components/Neurology";

function App() {
  const [currentModule, setCurrentModule] = useState("home");

  const renderModule = () => {
    switch (currentModule) {
      case "home":
        return null; // Hero section is handled by ProfessionalLayout
      case "dashboard":
        return <Dashboard />;
      case "predictive":
        return <PredictiveDashboard />;
      case "alerts":
        return <AlertManagement />;
      case "patients":
        return <PatientManagement />;
      case "beds":
        return <BedManagement />;
      case "oxygen":
        return <OxygenMonitoring />;
      case "staff":
        return <StaffManagement />;
      case "scheduling":
        return <StaffScheduling />;
      case "appointments":
        return <AppointmentBooking />;
      case "pharmacy":
        return (
          <div className="p-8 text-center py-12 text-gray-500">
            <h2 className="text-2xl font-bold mb-4">Pharmacy Management</h2>
            <p>
              Medication inventory and prescription management coming soon...
            </p>
          </div>
        );
      case "dept-emergency":
        return <EmergencyDepartment />;
      case "dept-general-medicine":
        return <GeneralMedicine />;
      case "dept-cardiology":
        return <Cardiology />;
      case "dept-neurology":
        return <Neurology />;
      case "emergency":
        return <EmergencyDepartment />;
      case "ambulance":
        return <AmbulanceTracking />;
      case "3d":
        return <HospitalVisualization3D />;
      case "reports":
        return <ReportsAnalytics />;
      case "whatif":
        return <WhatIfAnalysis />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProfessionalLayout
      currentModule={currentModule}
      onModuleChange={setCurrentModule}
    >
      {renderModule()}
    </ProfessionalLayout>
  );
}

export default App;
