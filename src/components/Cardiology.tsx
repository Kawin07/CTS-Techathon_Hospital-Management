import React, { useState } from "react";
import {
  Heart,
  Monitor,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import CardiologyVisualization3D from "./Cardiology3D";

const Cardiology: React.FC = () => {
  const [show3D, setShow3D] = useState(false);

  const cardiologyStats = [
    {
      title: "ICU Patients",
      value: "18",
      change: "+2",
      icon: Monitor,
      color: "red",
    },
    {
      title: "Scheduled Procedures",
      value: "12",
      change: "+4",
      icon: Calendar,
      color: "blue",
    },
    {
      title: "Critical Alerts",
      value: "3",
      change: "0",
      icon: AlertTriangle,
      color: "orange",
    },
    {
      title: "Recovery Rate",
      value: "94%",
      change: "+2%",
      icon: TrendingUp,
      color: "green",
    },
  ];

  const criticalPatients = [
    {
      id: "CCU001",
      patient: "Michael Torres",
      age: 62,
      condition: "Acute MI",
      physician: "Dr. Jennifer Park",
      status: "Post-Op Monitoring",
      heartRate: 78,
      bloodPressure: "120/80",
      priority: "Critical",
    },
    {
      id: "CCU002",
      patient: "Sandra Kim",
      age: 58,
      condition: "Heart Failure",
      physician: "Dr. Robert Chen",
      status: "Stable",
      heartRate: 65,
      bloodPressure: "110/70",
      priority: "High",
    },
    {
      id: "CCU003",
      patient: "David Miller",
      age: 71,
      condition: "Arrhythmia",
      physician: "Dr. Lisa Wong",
      status: "Under Observation",
      heartRate: 82,
      bloodPressure: "130/85",
      priority: "Medium",
    },
    {
      id: "CCU004",
      patient: "Maria Rodriguez",
      age: 66,
      condition: "Cardiac Catheterization",
      physician: "Dr. Ahmed Hassan",
      status: "Pre-Procedure",
      heartRate: 70,
      bloodPressure: "125/75",
      priority: "Medium",
    },
  ];

  const scheduledProcedures = [
    {
      time: "09:00",
      procedure: "Cardiac Catheterization",
      patient: "John Smith",
      physician: "Dr. Park",
      room: "Cath Lab 1",
    },
    {
      time: "10:30",
      procedure: "Echocardiogram",
      patient: "Lisa Johnson",
      physician: "Dr. Chen",
      room: "Echo Room A",
    },
    {
      time: "11:00",
      procedure: "Stress Test",
      patient: "Robert Davis",
      physician: "Dr. Wong",
      room: "Stress Lab",
    },
    {
      time: "14:00",
      procedure: "Pacemaker Implant",
      patient: "Mary Wilson",
      physician: "Dr. Hassan",
      room: "OR 3",
    },
    {
      time: "15:30",
      procedure: "Angioplasty",
      patient: "James Brown",
      physician: "Dr. Park",
      room: "Cath Lab 2",
    },
  ];

  const recentAlerts = [
    {
      time: "14:23",
      patient: "CCU001",
      alert: "Irregular Heart Rhythm",
      severity: "High",
      status: "Resolved",
    },
    {
      time: "13:45",
      patient: "CCU003",
      alert: "BP Elevation",
      severity: "Medium",
      status: "Monitoring",
    },
    {
      time: "12:30",
      patient: "CCU002",
      alert: "Low Oxygen Saturation",
      severity: "High",
      status: "Resolved",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-orange-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getHeartRateColor = (heartRate: number) => {
    if (heartRate < 60 || heartRate > 100) return "text-red-600";
    if (heartRate < 65 || heartRate > 95) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <span>Cardiology Department</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced cardiac care and cardiovascular surgery management
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
            <span>Emergency Cath</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>Monitor Board</span>
          </button>
        </div>
      </div>

      {/* Cardiology Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardiologyStats.map((stat, index) => {
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
                        : stat.change === "0"
                        ? "text-gray-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change === "0"
                      ? "No change"
                      : `${stat.change} from yesterday`}
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
        {/* Critical Patients */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-red-600" />
              <span>CCU Patients</span>
            </h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {criticalPatients.length} Active
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {criticalPatients.map((patient, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900">
                      {patient.id}
                    </span>
                    <span className="text-gray-700">{patient.patient}</span>
                    <span className="text-gray-500 text-sm">
                      Age {patient.age}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getPriorityColor(
                        patient.priority
                      )}`}
                    >
                      {patient.priority}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Condition: {patient.condition}
                    </p>
                    <p className="text-sm text-gray-600">
                      Physician: {patient.physician}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Status: {patient.status}
                    </p>
                    <div className="flex space-x-4 text-sm">
                      <span
                        className={`flex items-center ${getHeartRateColor(
                          patient.heartRate
                        )}`}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        {patient.heartRate} BPM
                      </span>
                      <span className="text-gray-600">
                        BP: {patient.bloodPressure}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                    View Chart
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors">
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Recent Alerts</span>
          </h3>
          <div className="space-y-4">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {alert.patient}
                  </span>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{alert.alert}</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    {alert.severity} Priority
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      alert.status === "Resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm">
              Emergency Actions
            </h4>
            <button className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Code Blue - Cardiac</span>
              </div>
            </button>
            <button className="w-full bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>STEMI Alert</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Scheduled Procedures */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Today's Procedures Schedule</span>
          </h3>
          <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            View Full Schedule
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduledProcedures.map((procedure, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-600">
                  {procedure.time}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {procedure.room}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">
                {procedure.procedure}
              </h4>
              <p className="text-sm text-gray-600 mb-1">
                Patient: {procedure.patient}
              </p>
              <p className="text-sm text-gray-600">
                Physician: {procedure.physician}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Department Resources */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cardiology Resources Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Cath Labs</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cath Lab 1</span>
                <span className="text-red-600 font-medium">In Use</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cath Lab 2</span>
                <span className="text-green-600 font-medium">Available</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Echo Rooms</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Echo Room A</span>
                <span className="text-red-600 font-medium">Occupied</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Echo Room B</span>
                <span className="text-green-600 font-medium">Ready</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">CCU Beds</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Capacity</span>
                <span className="text-gray-600 font-medium">20 beds</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Occupied</span>
                <span className="text-red-600 font-medium">18 beds</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span className="text-green-600 font-medium">2 beds</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Staff on Duty</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cardiologists</span>
                <span className="text-green-600 font-medium">4/4 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>CCU Nurses</span>
                <span className="text-green-600 font-medium">8/8 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Technicians</span>
                <span className="text-yellow-600 font-medium">5/6 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Visualization */}
      {show3D && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-[600px] relative">
            <CardiologyVisualization3D
              patients={criticalPatients.map((patient: any) => ({
                id: patient.id,
                name: patient.patient,
                heartRate: patient.heartRate,
                bloodPressure: patient.bloodPressure,
                condition: patient.condition,
                severity: patient.priority?.toLowerCase() || "medium",
                roomNumber: patient.id,
                admissionTime: "Today",
              }))}
              stats={{
                totalPatients: parseInt(cardiologyStats[0].value),
                criticalPatients: criticalPatients.filter(
                  (p: any) => p.priority === "Critical"
                ).length,
                availableBeds: 2,
                activeMonitors: criticalPatients.length,
                averageHeartRate: Math.round(
                  criticalPatients.reduce(
                    (sum: number, p: any) => sum + p.heartRate,
                    0
                  ) / criticalPatients.length
                ),
                emergencyAlerts: parseInt(cardiologyStats[2].value),
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

export default Cardiology;
