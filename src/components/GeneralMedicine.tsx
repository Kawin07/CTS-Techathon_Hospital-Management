import React, { useState } from "react";
import {
  User,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  Bed,
  Stethoscope,
  Pill,
  Activity,
  UserCheck,
  ClipboardList,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import GeneralMedicineVisualization3D from "./GeneralMedicine3D";

const GeneralMedicine: React.FC = () => {
  const [show3D, setShow3D] = useState(false);

  // Bed statistics - this will come from your API/backend data
  // The value format supported: "available/total" OR "occupied/total" (auto-detected)
  const generalMedStats = [
    {
      title: "Current Patients",
      value: "89",
      change: "+12",
      icon: Users,
      color: "blue",
    },
    {
      title: "Daily Admissions",
      value: "23",
      change: "+5",
      icon: UserCheck,
      color: "green",
    },
    {
      title: "Beds (Avail/Total)",
      value: "10/30", // Edit this string. Either Avail/Total or Occupied/Total; parser will detect.
      change: "-3",
      icon: Bed,
      color: "orange",
    },
    {
      title: "Avg Length of Stay",
      value: "3.2 days",
      change: "-0.3",
      icon: Clock,
      color: "purple",
    },
  ];

  // Parse bed statistics (supports both Available/Total and Occupied/Total)
  const bedInfo = generalMedStats.find((stat) => stat.title.startsWith("Beds"));
  let availableBeds = 12;
  let totalBeds = 45;
  if (bedInfo?.value) {
    const parts = bedInfo.value.split("/").map((p) => parseInt(p.trim()));
    if (parts.length === 2 && !parts.some(isNaN)) {
      const a = parts[0];
      const b = parts[1];
      // Determine which number is total (the larger one is assumed total)
      const detectedTotal = Math.max(a, b);
      // const other = Math.min(a, b); // not needed now
      // Heuristic: if the first number (a) > detectedTotal/2 AND label originally implied Available, treat first as available.
      // Simpler approach: assume original format was Avail/Total if a <= b. If a > b (unlikely), treat a as Occupied.
      if (a <= b) {
        // a is Available, b is Total
        availableBeds = a;
        totalBeds = b;
      } else {
        // a is Occupied, b is Total
        totalBeds = a; // guard but logically shouldn't happen: adjust to ensure correctness
        availableBeds = Math.max(0, b - (a - b));
      }
      // Final safety clamp
      availableBeds = Math.min(availableBeds, detectedTotal);
      totalBeds = detectedTotal;
    }
  }
  const occupiedBeds = Math.max(0, totalBeds - availableBeds);

  const recentAdmissions = [
    {
      id: "GM001",
      patient: "Robert Wilson",
      age: 67,
      condition: "Diabetes Management",
      physician: "Dr. Sarah Chen",
      admitted: "2 hours ago",
      room: "A-204",
    },
    {
      id: "GM002",
      patient: "Mary Thompson",
      age: 45,
      condition: "Hypertension",
      physician: "Dr. Michael Ross",
      admitted: "4 hours ago",
      room: "B-312",
    },
    {
      id: "GM003",
      patient: "James Lee",
      age: 58,
      condition: "Respiratory Infection",
      physician: "Dr. Emily Davis",
      admitted: "6 hours ago",
      room: "A-118",
    },
    {
      id: "GM004",
      patient: "Patricia Garcia",
      age: 72,
      condition: "Chronic Pain Management",
      physician: "Dr. David Kumar",
      admitted: "8 hours ago",
      room: "C-205",
    },
  ];

  const upcomingRounds = [
    {
      time: "08:00",
      ward: "Ward A",
      physician: "Dr. Sarah Chen",
      patients: 15,
    },
    {
      time: "09:30",
      ward: "Ward B",
      physician: "Dr. Michael Ross",
      patients: 12,
    },
    {
      time: "11:00",
      ward: "Ward C",
      physician: "Dr. Emily Davis",
      patients: 18,
    },
    {
      time: "14:00",
      ward: "Ward D",
      physician: "Dr. David Kumar",
      patients: 14,
    },
  ];

  const chronicCarePatients = [
    {
      name: "John Anderson",
      condition: "Type 2 Diabetes",
      lastVisit: "2024-01-15",
      nextAppointment: "2024-01-29",
      status: "Stable",
    },
    {
      name: "Linda Martinez",
      condition: "Hypertension",
      lastVisit: "2024-01-18",
      nextAppointment: "2024-02-01",
      status: "Monitoring",
    },
    {
      name: "William Brown",
      condition: "COPD",
      lastVisit: "2024-01-20",
      nextAppointment: "2024-01-27",
      status: "Stable",
    },
    {
      name: "Susan Taylor",
      condition: "Osteoarthritis",
      lastVisit: "2024-01-22",
      nextAppointment: "2024-02-05",
      status: "Improving",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "stable":
        return "bg-green-100 text-green-800 border-green-200";
      case "monitoring":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "improving":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <span>General Medicine</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive internal medicine and primary care management
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShow3D(!show3D)}
            className={`${
              show3D
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gray-600 hover:bg-gray-700"
            } text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
          >
            {show3D ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span>{show3D ? "Hide 3D View" : "Show 3D View"}</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Schedule Rounds</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Patient Reports</span>
          </button>
        </div>
      </div>

      {/* General Medicine Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {generalMedStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      stat.change.startsWith("+")
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Recent Admissions</span>
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Last 24 hours
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentAdmissions.map((admission, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900">
                      {admission.patient}
                    </span>
                    <span className="text-gray-500 text-sm">
                      Age {admission.age}
                    </span>
                    <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                      {admission.room}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {admission.condition}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Physician: {admission.physician}</span>
                  <span>Admitted: {admission.admitted}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Rounds */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
            <ClipboardList className="w-5 h-5 text-green-600" />
            <span>Today's Rounds Schedule</span>
          </h3>
          <div className="space-y-4">
            {upcomingRounds.map((round, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {round.time}
                    </div>
                    <div className="text-xs text-gray-500">Time</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {round.ward}
                    </div>
                    <div className="text-sm text-gray-600">
                      {round.physician}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {round.patients}
                  </div>
                  <div className="text-xs text-gray-500">Patients</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chronic Care Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span>Chronic Care Management</span>
          </h3>
          <button className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors text-sm">
            View All Patients
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chronicCarePatients.map((patient, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">
                  {patient.name}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusColor(
                    patient.status
                  )}`}
                >
                  {patient.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{patient.condition}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <span className="block">Last Visit:</span>
                  <span className="font-medium">{patient.lastVisit}</span>
                </div>
                <div>
                  <span className="block">Next Appointment:</span>
                  <span className="font-medium">{patient.nextAppointment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Department Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Patient Satisfaction</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Rating</span>
                <span className="text-green-600 font-medium">4.7/5.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Care Quality</span>
                <span className="text-green-600 font-medium">96%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Communication</span>
                <span className="text-green-600 font-medium">94%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Efficiency Metrics</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg Consultation Time</span>
                <span className="text-blue-600 font-medium">22 min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Wait Time</span>
                <span className="text-green-600 font-medium">8 min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discharge Processing</span>
                <span className="text-blue-600 font-medium">45 min</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Pill className="w-4 h-4 text-green-600" />
              <span>Treatment Outcomes</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Recovery Rate</span>
                <span className="text-green-600 font-medium">92%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Readmission Rate</span>
                <span className="text-green-600 font-medium">3.2%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Medication Adherence</span>
                <span className="text-blue-600 font-medium">87%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Visualization */}
      {show3D && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-[600px] relative">
            <GeneralMedicineVisualization3D
              patients={[
                ...recentAdmissions,
                ...chronicCarePatients.slice(0, 8),
              ].map((patient: any, index: number) => ({
                id: patient.id || `GM${index.toString().padStart(3, "0")}`,
                name: patient.patient || patient.name,
                age: patient.age,
                condition: patient.condition,
                severity: patient.status || "Stable",
                roomNumber: patient.room || `GM-${index + 200}`,
                admissionDate: patient.admitted || patient.lastVisit || "Today",
                expectedDischarge: patient.nextAppointment || "Tomorrow",
                vitals: {
                  temperature: 98.0 + Math.random() * 2,
                  heartRate: 60 + Math.floor(Math.random() * 40),
                  bloodPressure: "120/80",
                  respirationRate: 12 + Math.floor(Math.random() * 8),
                },
              }))}
              stats={{
                totalPatients: parseInt(generalMedStats[0].value),
                totalBeds: totalBeds,
                occupiedBeds: occupiedBeds,
                availableBeds: availableBeds,
                occupancyRate:
                  totalBeds > 0
                    ? Math.round((occupiedBeds / totalBeds) * 100)
                    : 0,
                averageStayDuration: 3.2,
                dischargesPlanned: 8,
                admissionsToday: parseInt(generalMedStats[1].value),
                criticalCases: 2,
              }}
              onPatientSelect={(patient) => {
                console.log("Selected patient:", patient);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralMedicine;
