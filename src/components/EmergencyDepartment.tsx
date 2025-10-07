import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock,
  Users,
  Bed,
  Heart,
  Stethoscope,
  Ambulance,
  UserCheck,
  Timer,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import EmergencyVisualization3D, {
  getPredictedDischarge as getEmergencyDischargeEstimate,
  normalizeDischargeEstimate,
} from "./Emergency3D";

const EmergencyDepartment: React.FC = () => {
  const [show3D, setShow3D] = useState(false);

  const emergencyStats = [
    {
      title: "Current Patients",
      value: "47",
      change: "+8",
      icon: Users,
      color: "red",
    },
    {
      title: "Critical Cases",
      value: "12",
      change: "+3",
      icon: AlertTriangle,
      color: "orange",
    },
    {
      title: "Available Trauma Beds",
      value: "3/15",
      change: "-2",
      icon: Bed,
      color: "blue",
    },
    {
      title: "Avg Wait Time",
      value: "18 min",
      change: "-5 min",
      icon: Clock,
      color: "green",
    },
  ];

  const traumaBedStat = emergencyStats.find(
    (stat) => stat.title === "Available Trauma Beds"
  );

  let parsedAvailableBeds = 3;
  let parsedTotalBeds = 15;

  if (traumaBedStat?.value) {
    const parts = traumaBedStat.value.split("/").map((part) => part.trim());
    if (parts.length === 2) {
      const avail = parseInt(parts[0], 10);
      const total = parseInt(parts[1], 10);
      if (!Number.isNaN(avail)) {
        parsedAvailableBeds = avail;
      }
      if (!Number.isNaN(total)) {
        parsedTotalBeds = total;
      }
    }
  }

  parsedTotalBeds = Math.max(0, parsedTotalBeds);
  parsedAvailableBeds = Math.min(
    Math.max(parsedAvailableBeds, 0),
    parsedTotalBeds || parsedAvailableBeds
  );
  const parsedOccupiedBeds = Math.max(0, parsedTotalBeds - parsedAvailableBeds);

  const getDischargeEstimate = (severity: string, status: string) => {
    const severityValue = severity || "Moderate";
    const normalizedStatus = status?.toLowerCase?.() || "";

    let estimate: string | undefined;

    if (
      normalizedStatus.includes("surgery") ||
      normalizedStatus.includes("icu")
    ) {
      estimate = "1 week";
    } else if (normalizedStatus.includes("waiting")) {
      estimate = "Same day";
    } else if (normalizedStatus.includes("observation")) {
      estimate = "1 day";
    } else if (normalizedStatus.includes("stabil")) {
      estimate = "2 days";
    } else if (
      normalizedStatus.includes("x-ray") ||
      normalizedStatus.includes("imaging")
    ) {
      estimate = "Same day";
    }

    if (!estimate) {
      estimate = getEmergencyDischargeEstimate(severityValue);
    }

    return normalizeDischargeEstimate(estimate, severityValue);
  };

  const traumaCases = [
    {
      id: "T001",
      patient: "John Mitchell",
      age: 34,
      condition: "Motor Vehicle Accident",
      severity: "Critical",
      timeArrived: "14:23",
      status: "In Surgery",
    },
    {
      id: "T002",
      patient: "Sarah Adams",
      age: 28,
      condition: "Fall Injury",
      severity: "Moderate",
      timeArrived: "14:45",
      status: "X-Ray",
    },
    {
      id: "T003",
      patient: "Mike Johnson",
      age: 52,
      condition: "Cardiac Event",
      severity: "Critical",
      timeArrived: "15:10",
      status: "Treatment",
    },
    {
      id: "T004",
      patient: "Lisa Brown",
      age: 19,
      condition: "Sports Injury",
      severity: "Minor",
      timeArrived: "15:20",
      status: "Waiting",
    },
  ];

  const ambulanceQueue = [
    { id: "AMB-101", eta: "5 min", condition: "Chest Pain", priority: "High" },
    { id: "AMB-102", eta: "12 min", condition: "Fracture", priority: "Medium" },
    { id: "AMB-103", eta: "18 min", condition: "Minor Cuts", priority: "Low" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "minor":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <span>Emergency Department</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time emergency care management and trauma response
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShow3D(!show3D)}
            className={`${
              show3D
                ? "bg-purple-600 hover:bg-purple-700"
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
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Emergency Alert</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Ambulance className="w-4 h-4" />
            <span>Dispatch Ambulance</span>
          </button>
        </div>
      </div>

      {/* Emergency Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {emergencyStats.map((stat, index) => {
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
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {stat.change} from last hour
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
        {/* Active Trauma Cases */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-red-600" />
              <span>Active Trauma Cases</span>
            </h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {traumaCases.length} Cases
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {traumaCases.map((case_item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold text-gray-900">
                      {case_item.id}
                    </span>
                    <span className="text-gray-700">{case_item.patient}</span>
                    <span className="text-gray-500 text-sm">
                      Age {case_item.age}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {case_item.condition}
                  </p>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getSeverityColor(
                        case_item.severity
                      )}`}
                    >
                      {case_item.severity}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Arrived: {case_item.timeArrived}
                    </span>
                    <span className="text-xs font-medium text-blue-600">
                      {case_item.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Stethoscope className="w-4 h-4" />
                  </button>
                  <button className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Ambulances */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
            <Ambulance className="w-5 h-5 text-blue-600" />
            <span>Incoming Ambulances</span>
          </h3>
          <div className="space-y-4">
            {ambulanceQueue.map((ambulance, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    {ambulance.id}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getPriorityColor(
                        ambulance.priority
                      )}`}
                    ></div>
                    <span className="text-xs text-gray-600">
                      {ambulance.priority}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {ambulance.condition}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Timer className="w-3 h-3 mr-1" />
                    ETA: {ambulance.eta}
                  </span>
                  <button className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Quick Actions */}
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">
              Quick Actions
            </h4>
            <button className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors text-left">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Code Blue Alert</span>
              </div>
            </button>
            <button className="w-full bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 transition-colors text-left">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Mass Casualty</span>
              </div>
            </button>
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors text-left">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Triage Assignment</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Resource Status */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Emergency Resource Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Trauma Rooms</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Trauma Room 1</span>
                <span className="text-red-600 font-medium">Occupied</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trauma Room 2</span>
                <span className="text-red-600 font-medium">Occupied</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trauma Room 3</span>
                <span className="text-green-600 font-medium">Available</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">OR Availability</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Emergency OR 1</span>
                <span className="text-red-600 font-medium">In Use</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Emergency OR 2</span>
                <span className="text-green-600 font-medium">Ready</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Staff Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Emergency Physicians</span>
                <span className="text-green-600 font-medium">6/6 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trauma Nurses</span>
                <span className="text-green-600 font-medium">11/12 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Support Staff</span>
                <span className="text-yellow-600 font-medium">4/5 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Visualization */}
      {show3D && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-[600px] relative">
            <EmergencyVisualization3D
              patients={traumaCases.map((patient: any) => ({
                id: patient.id,
                name: patient.patient,
                age: patient.age,
                severity: patient.severity,
                condition: patient.condition,
                arrivalTime: patient.timeArrived,
                waitTime: Math.floor(
                  (new Date().getTime() -
                    new Date(
                      `2024-01-01T${patient.timeArrived}:00`
                    ).getTime()) /
                    60000
                ),
                assignedBay:
                  patient.assignedBay ||
                  `Bed ${Math.floor(Math.random() * 8) + 1}`,
                expectedDischarge: getDischargeEstimate(
                  patient.severity,
                  patient.status
                ),
                vitals: {
                  heartRate: 70 + Math.floor(Math.random() * 50),
                  bloodPressure: "120/80",
                  oxygen: 95 + Math.floor(Math.random() * 5),
                  temperature: 98.0 + Math.random() * 2,
                },
              }))}
              stats={{
                totalPatients: parseInt(emergencyStats[0].value),
                totalBeds: parsedTotalBeds,
                occupiedBeds: parsedOccupiedBeds,
                availableBeds: parsedAvailableBeds,
                criticalCases: parseInt(emergencyStats[1].value),
                averageWaitTime: 25,
                activeCases: traumaCases.length,
                dischargedToday: 23,
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

export default EmergencyDepartment;
