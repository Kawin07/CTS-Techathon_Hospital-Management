import React, { useState } from "react";
import {
  Brain,
  Activity,
  Zap,
  Eye as EyeIcon,
  EyeOff,
  Calendar,
  AlertTriangle,
  Monitor,
  TrendingUp,
} from "lucide-react";
import NeurologyVisualization3D from "./Neurology3D";

const Neurology: React.FC = () => {
  const [show3D, setShow3D] = useState(false);

  const neurologyStats = [
    {
      title: "ICU Patients",
      value: "14",
      change: "+1",
      icon: Monitor,
      color: "purple",
    },
    {
      title: "Scheduled MRIs",
      value: "8",
      change: "+2",
      icon: Brain,
      color: "blue",
    },
    {
      title: "Stroke Alerts",
      value: "2",
      change: "0",
      icon: AlertTriangle,
      color: "red",
    },
    {
      title: "Recovery Progress",
      value: "91%",
      change: "+3%",
      icon: TrendingUp,
      color: "green",
    },
  ];

  const neuroICUPatients = [
    {
      id: "NICU001",
      patient: "George Martinez",
      age: 68,
      condition: "Acute Stroke",
      physician: "Dr. Amanda Foster",
      status: "Stable",
      glasgowComa: 14,
      intracranialPressure: "12 mmHg",
      priority: "Critical",
    },
    {
      id: "NICU002",
      patient: "Helen Cooper",
      age: 54,
      condition: "Brain Tumor",
      physician: "Dr. Kevin Liu",
      status: "Post-Op Day 2",
      glasgowComa: 15,
      intracranialPressure: "8 mmHg",
      priority: "High",
    },
    {
      id: "NICU003",
      patient: "Thomas Anderson",
      age: 42,
      condition: "Traumatic Brain Injury",
      physician: "Dr. Sarah Patel",
      status: "Improving",
      glasgowComa: 13,
      intracranialPressure: "15 mmHg",
      priority: "High",
    },
    {
      id: "NICU004",
      patient: "Monica Williams",
      age: 59,
      condition: "Epilepsy Monitoring",
      physician: "Dr. Michael Chang",
      status: "Under Observation",
      glasgowComa: 15,
      intracranialPressure: "Normal",
      priority: "Medium",
    },
  ];

  const scheduledProcedures = [
    {
      time: "08:30",
      procedure: "Brain MRI",
      patient: "Jennifer Lee",
      physician: "Dr. Foster",
      location: "MRI Suite 1",
    },
    {
      time: "09:45",
      procedure: "EEG Monitoring",
      patient: "Robert Kim",
      physician: "Dr. Liu",
      location: "Neuro Lab A",
    },
    {
      time: "11:00",
      procedure: "Lumbar Puncture",
      patient: "Susan Taylor",
      physician: "Dr. Patel",
      location: "Procedure Room 2",
    },
    {
      time: "13:30",
      procedure: "CT Angiogram",
      patient: "David Chen",
      physician: "Dr. Chang",
      location: "CT Suite B",
    },
    {
      time: "15:00",
      procedure: "EMG Study",
      patient: "Lisa Rodriguez",
      physician: "Dr. Foster",
      location: "Neuro Lab B",
    },
  ];

  const strokeAlerts = [
    {
      time: "13:45",
      patient: "Emergency Admission",
      age: 72,
      symptoms: "Right-sided weakness, speech difficulty",
      lastKnownWell: "13:00",
      eta: "In ED",
      status: "Active",
    },
    {
      time: "14:20",
      patient: "Ambulance Incoming",
      age: 65,
      symptoms: "Facial drooping, confusion",
      lastKnownWell: "14:00",
      eta: "8 minutes",
      status: "Incoming",
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

  const getGCSColor = (score: number) => {
    if (score >= 13) return "text-green-600";
    if (score >= 9) return "text-yellow-600";
    return "text-red-600";
  };

  const getICPColor = (icp: string) => {
    if (icp === "Normal") return "text-green-600";
    const value = parseInt(icp);
    if (value > 20) return "text-red-600";
    if (value > 15) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <span>Neurology Department</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive neurological care and neurosurgical services
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShow3D(!show3D)}
            className={`${
              show3D
                ? "bg-cyan-600 hover:bg-cyan-700"
                : "bg-gray-600 hover:bg-gray-700"
            } text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
          >
            {show3D ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
            <span>{show3D ? "Hide 3D View" : "Show 3D View"}</span>
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Stroke Alert</span>
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Neurology Consult</span>
          </button>
        </div>
      </div>

      {/* Neurology Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {neurologyStats.map((stat, index) => {
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
        {/* Neuro ICU Patients */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-purple-600" />
              <span>Neuro ICU Patients</span>
            </h3>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {neuroICUPatients.length} Active
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {neuroICUPatients.map((patient, index) => (
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
                    <p className="text-sm text-gray-600">
                      Status: {patient.status}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`${getGCSColor(patient.glasgowComa)}`}>
                        GCS: {patient.glasgowComa}/15
                      </span>
                      <span
                        className={`${getICPColor(
                          patient.intracranialPressure
                        )}`}
                      >
                        ICP: {patient.intracranialPressure}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors">
                    Neuro Exam
                  </button>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                    View Imaging
                  </button>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors">
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stroke Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Stroke Alerts</span>
          </h3>
          <div className="space-y-4">
            {strokeAlerts.map((alert, index) => (
              <div
                key={index}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-red-900">
                    {alert.patient}
                  </span>
                  <span className="text-xs text-red-600">{alert.time}</span>
                </div>
                <div className="text-sm text-gray-700 space-y-1 mb-3">
                  <p>Age: {alert.age}</p>
                  <p>Symptoms: {alert.symptoms}</p>
                  <p>Last Known Well: {alert.lastKnownWell}</p>
                  <p>ETA: {alert.eta}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      alert.status === "Active"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {alert.status}
                  </span>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors">
                    Activate Protocol
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm">
              Emergency Protocols
            </h4>
            <button className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Code Stroke</span>
              </div>
            </button>
            <button className="w-full bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Neurosurgery Consult</span>
              </div>
            </button>
            <button className="w-full bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Seizure Protocol</span>
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
            <span>Today's Neurological Procedures</span>
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
                  {procedure.location}
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
          Neurology Resources Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Imaging Equipment
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>MRI Suite 1</span>
                <span className="text-red-600 font-medium">In Use</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>MRI Suite 2</span>
                <span className="text-green-600 font-medium">Available</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>CT Scanner</span>
                <span className="text-green-600 font-medium">Ready</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Neuro Labs</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>EEG Lab A</span>
                <span className="text-red-600 font-medium">Occupied</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>EEG Lab B</span>
                <span className="text-green-600 font-medium">Available</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>EMG Lab</span>
                <span className="text-green-600 font-medium">Ready</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">ICU Capacity</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Beds</span>
                <span className="text-gray-600 font-medium">16 beds</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Occupied</span>
                <span className="text-red-600 font-medium">14 beds</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span className="text-green-600 font-medium">2 beds</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Staff Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Neurologists</span>
                <span className="text-green-600 font-medium">5/5 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Neuro Nurses</span>
                <span className="text-green-600 font-medium">12/12 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Technicians</span>
                <span className="text-green-600 font-medium">6/6 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Visualization */}
      {show3D && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-[600px] relative">
            <NeurologyVisualization3D
              patients={neuroICUPatients.map((patient: any) => ({
                id: patient.id,
                name: patient.patient,
                age: patient.age,
                condition: patient.condition,
                severity: patient.priority,
                roomNumber: patient.id,
                brainActivity: 60 + Math.floor(Math.random() * 40), // 60-100%
                cognitiveScore: 15 + Math.floor(Math.random() * 15), // 15-30
                motorFunction: 50 + Math.floor(Math.random() * 50), // 50-100%
                admissionDate: "Today",
              }))}
              stats={{
                totalPatients: parseInt(neurologyStats[0].value),
                activeMRIs: parseInt(neurologyStats[1].value),
                scheduledSurgeries: 3,
                rehabilitationCases: 8,
                averageCognitiveScore: 22,
                criticalCases: parseInt(neurologyStats[2].value),
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

export default Neurology;
