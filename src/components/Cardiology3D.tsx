/**
 * Cardiology Department 3D Visualization
 * Integrates real patient data with 3D cardiac monitoring equipment
 */

import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Box,
  Sphere,
  Cylinder,
  Html,
  Float,
} from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import {
  MedicalBed,
  MedicalStaff3D,
  MedicalEquipment3D,
  DepartmentRoom3D,
} from "./BaseDepartment3D";

interface CardiologyPatient {
  id: string;
  name: string;
  heartRate: number;
  bloodPressure: string;
  condition: string;
  severity: "low" | "medium" | "high" | "critical";
  roomNumber: string;
  admissionTime: string;
}

interface CardiologyStats {
  totalPatients: number;
  criticalPatients: number;
  availableBeds: number;
  activeMonitors: number;
  averageHeartRate: number;
  emergencyAlerts: number;
}

interface Cardiology3DProps {
  patients: CardiologyPatient[];
  stats: CardiologyStats;
  onPatientSelect?: (patient: CardiologyPatient) => void;
}

// Cardiac Monitor 3D Component
const CardiacMonitor = ({
  position,
  patientData,
}: {
  position: [number, number, number];
  patientData: CardiologyPatient;
}) => {
  const monitorRef = useRef<THREE.Group>(null!);
  const [heartbeatPhase, setHeartbeatPhase] = useState(0);

  useFrame((state) => {
    if (monitorRef.current) {
      // Simulate heartbeat rhythm based on patient's heart rate
      const heartbeatSpeed = (patientData.heartRate / 60) * 2; // Convert BPM to animation speed
      setHeartbeatPhase(Math.sin(state.clock.elapsedTime * heartbeatSpeed));

      // Monitor screen glow effect
      const intensity = 0.3 + heartbeatPhase * 0.2;
      monitorRef.current.children.forEach((child: any) => {
        if (child.material && child.material.emissive) {
          child.material.emissiveIntensity = intensity;
        }
      });
    }
  });

  const getSeverityColor = () => {
    switch (patientData.severity) {
      case "critical":
        return "#ff4757";
      case "high":
        return "#ff6b35";
      case "medium":
        return "#ffa502";
      case "low":
        return "#2ed573";
      default:
        return "#4dabf7";
    }
  };

  return (
    <group ref={monitorRef} position={position}>
      {/* Monitor Base */}
      <Box args={[0.6, 0.4, 0.15]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#2c2c2c" />
      </Box>

      {/* Monitor Screen */}
      <Box args={[0.55, 0.35, 0.02]} position={[0, 0.2, 0.08]}>
        <meshStandardMaterial
          color="#000000"
          emissive={getSeverityColor()}
          emissiveIntensity={0.3}
        />
      </Box>

      {/* Heartbeat Visualization */}
      <Html position={[0, 0.2, 0.09]} center>
        <div className="w-48 h-28 bg-black rounded border-2 border-gray-700 p-2 relative overflow-hidden">
          {/* Heart Rate Display */}
          <div className="text-green-400 text-lg font-bold">
            {patientData.heartRate} BPM
          </div>
          <div className="text-white text-xs">
            BP: {patientData.bloodPressure}
          </div>
          <div
            className={`text-xs font-semibold ${
              patientData.severity === "critical"
                ? "text-red-400"
                : patientData.severity === "high"
                ? "text-orange-400"
                : patientData.severity === "medium"
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {patientData.condition}
          </div>

          {/* ECG Wave Animation */}
          <div className="absolute bottom-2 left-0 w-full h-8 overflow-hidden">
            <svg width="100%" height="100%" className="text-green-400">
              <path
                d={`M0,20 L${20 + heartbeatPhase * 10},20 L${
                  25 + heartbeatPhase * 10
                },5 L${30 + heartbeatPhase * 10},35 L${
                  35 + heartbeatPhase * 10
                },20 L200,20`}
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>
      </Html>

      {/* Status Light */}
      <Sphere args={[0.03]} position={[0.3, 0.4, 0.1]}>
        <meshStandardMaterial
          color={getSeverityColor()}
          emissive={getSeverityColor()}
          emissiveIntensity={0.8}
        />
      </Sphere>
    </group>
  );
};

// Echocardiogram Machine
const EchoMachine = ({
  position,
  active = true,
}: {
  position: [number, number, number];
  active?: boolean;
}) => {
  const echoRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (echoRef.current && active) {
      echoRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={echoRef} position={position}>
      {/* Main Console */}
      <Box args={[1.2, 1, 0.8]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#e8e8e8" />
      </Box>

      {/* Screen */}
      <Box args={[0.8, 0.6, 0.05]} position={[0, 0.8, 0.4]}>
        <meshStandardMaterial
          color="#000000"
          emissive={active ? "#0066cc" : "#333333"}
          emissiveIntensity={active ? 0.4 : 0.1}
        />
      </Box>

      {/* Probe */}
      <Cylinder
        args={[0.02, 0.03, 0.3]}
        position={[-0.4, 0.5, 0.3]}
        rotation={[0, 0, Math.PI / 4]}
      >
        <meshStandardMaterial color="#666666" />
      </Cylinder>

      <Html position={[0, 1.8, 0]} center>
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border shadow-lg">
          <div className="font-semibold text-sm">Echocardiogram</div>
          <div className="text-xs text-gray-600">
            {active ? "Active" : "Standby"}
          </div>
        </div>
      </Html>
    </group>
  );
};

// Cardiac Catheterization Lab
const CathLab = ({
  position,
  occupied = false,
}: {
  position: [number, number, number];
  occupied?: boolean;
}) => {
  return (
    <group position={position}>
      {/* Procedure Table */}
      <Box args={[2, 0.15, 0.8]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color={occupied ? "#f0f0f0" : "#e0e0e0"} />
      </Box>

      {/* C-Arm */}
      <group position={[0, 2, 0]}>
        <Cylinder args={[0.05, 0.05, 3]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#333333" />
        </Cylinder>
        <Box args={[0.4, 0.3, 0.2]} position={[-1.2, 0, 0]}>
          <meshStandardMaterial color="#666666" />
        </Box>
        <Box args={[0.4, 0.3, 0.2]} position={[1.2, 0, 0]}>
          <meshStandardMaterial color="#666666" />
        </Box>
      </group>

      <Html position={[0, 2.5, 0]} center>
        <div
          className={`px-3 py-2 rounded-lg font-semibold ${
            occupied ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          Cath Lab - {occupied ? "In Use" : "Available"}
        </div>
      </Html>
    </group>
  );
};

const Cardiology3D: React.FC<Cardiology3DProps> = ({
  patients,
  stats,
}) => {
  const sceneRef = useRef<THREE.Group>(null!);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Auto-rotate scene
  useFrame((_, delta) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y += delta * 0.05;
    }
  });

  // const handlePatientClick = (patient: CardiologyPatient) => {
  //   setSelectedPatient(patient.id);
  //   onPatientSelect?.(patient);
  // };

  // Create room layout for CCU (Cardiac Care Unit)
  const ccuBeds = patients.slice(0, 6); // First 6 patients in CCU
  const generalCardiacBeds = patients.slice(6); // Rest in general cardiac ward

  return (
    <group ref={sceneRef}>
      {/* Enhanced Lighting for Medical Environment */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[15, 15, 15]} intensity={1.2} castShadow />
      <pointLight position={[-8, 10, -8]} color="#ff6b6b" intensity={0.4} />
      <pointLight position={[8, 10, 8]} color="#4dabf7" intensity={0.6} />
      <spotLight
        position={[0, 12, 0]}
        angle={0.3}
        intensity={1}
        color="#ffffff"
      />

      {/* Department Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[25, 20]} />
        <meshStandardMaterial color="#f8f9fa" />
      </mesh>

      {/* Department Title */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text
          position={[0, 6, 0]}
          fontSize={1.2}
          color="#dc2626"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          CARDIOLOGY DEPARTMENT
        </Text>
      </Float>

      {/* Stats Display */}
      <Html position={[-10, 5, 0]} center>
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg min-w-64"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-bold text-lg text-red-600 mb-2">
            Department Stats
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              Total Patients:{" "}
              <span className="font-semibold">{stats.totalPatients}</span>
            </div>
            <div>
              Critical:{" "}
              <span className="font-semibold text-red-600">
                {stats.criticalPatients}
              </span>
            </div>
            <div>
              Available Beds:{" "}
              <span className="font-semibold text-green-600">
                {stats.availableBeds}
              </span>
            </div>
            <div>
              Active Monitors:{" "}
              <span className="font-semibold">{stats.activeMonitors}</span>
            </div>
            <div>
              Avg HR:{" "}
              <span className="font-semibold">
                {stats.averageHeartRate} BPM
              </span>
            </div>
            <div>
              Alerts:{" "}
              <span className="font-semibold text-orange-600">
                {stats.emergencyAlerts}
              </span>
            </div>
          </div>
        </motion.div>
      </Html>

      {/* CCU Room */}
      <DepartmentRoom3D
        position={[-8, 0, -5]}
        size={[12, 3, 8]}
        roomType="icu"
        occupancy={Math.round((ccuBeds.length / 6) * 100)}
      />

      {/* CCU Beds and Monitors */}
      {ccuBeds.map((patient, index) => {
        const bedPosition: [number, number, number] = [
          -10 + (index % 3) * 4,
          0,
          -7 + Math.floor(index / 3) * 4,
        ];
        const monitorPosition: [number, number, number] = [
          bedPosition[0] - 1.5,
          1.2,
          bedPosition[1],
        ];

        return (
          <group key={patient.id}>
            <MedicalBed
              position={bedPosition}
              occupied={true}
              patientData={patient}
              bedType="icu"
            />
            <CardiacMonitor position={monitorPosition} patientData={patient} />
          </group>
        );
      })}

      {/* General Cardiac Ward */}
      <DepartmentRoom3D
        position={[5, 0, -2]}
        size={[14, 3, 10]}
        roomType="clinic"
        occupancy={Math.round((generalCardiacBeds.length / 8) * 100)}
      />

      {/* General Ward Beds */}
      {generalCardiacBeds.slice(0, 8).map((patient, index) => {
        const bedPosition: [number, number, number] = [
          0 + (index % 4) * 3,
          0,
          -5 + Math.floor(index / 4) * 4,
        ];

        return (
          <MedicalBed
            key={patient.id}
            position={bedPosition}
            occupied={true}
            patientData={patient}
            bedType="general"
          />
        );
      })}

      {/* Medical Equipment */}
      <EchoMachine position={[8, 0, 2]} active={true} />
      <EchoMachine position={[6, 0, 4]} active={false} />

      {/* Cardiac Catheterization Labs */}
      <CathLab position={[-2, 0, 6]} occupied={true} />
      <CathLab position={[2, 0, 8]} occupied={false} />

      {/* Medical Staff */}
      <MedicalStaff3D position={[-5, 0, 0]} type="doctor" activity="rounds" />
      <MedicalStaff3D
        position={[3, 0, -3]}
        type="nurse"
        activity="monitoring"
      />
      <MedicalStaff3D
        position={[0, 0, 6]}
        type="technician"
        activity="treatment"
      />

      {/* Emergency Equipment */}
      <MedicalEquipment3D
        position={[-6, 0, 2]}
        type="defibrillator"
        active={true}
        data={{ charge: "200J", ready: true }}
      />

      {/* Patient Information Panel */}
      {selectedPatient && (
        <Html position={[10, 3, 0]} center>
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg w-80"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {(() => {
              const patient = patients.find((p) => p.id === selectedPatient);
              if (!patient) return null;

              return (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{patient.name}</h3>
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      ID: <span className="font-semibold">{patient.id}</span>
                    </div>
                    <div>
                      Room:{" "}
                      <span className="font-semibold">
                        {patient.roomNumber}
                      </span>
                    </div>
                    <div>
                      Heart Rate:{" "}
                      <span className="font-semibold text-red-600">
                        {patient.heartRate} BPM
                      </span>
                    </div>
                    <div>
                      Blood Pressure:{" "}
                      <span className="font-semibold">
                        {patient.bloodPressure}
                      </span>
                    </div>
                    <div>
                      Condition:{" "}
                      <span
                        className={`font-semibold ${
                          patient.severity === "critical"
                            ? "text-red-600"
                            : patient.severity === "high"
                            ? "text-orange-600"
                            : patient.severity === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {patient.condition}
                      </span>
                    </div>
                    <div>
                      Admitted:{" "}
                      <span className="font-semibold">
                        {patient.admissionTime}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </Html>
      )}
    </group>
  );
};

// Main Cardiology Component with Canvas
const CardiologyVisualization3D: React.FC<Cardiology3DProps> = ({
  patients,
  stats,
  onPatientSelect,
}) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-red-50 to-blue-50">
      <Canvas
        camera={{ position: [0, 8, 15], fov: 60 }}
        shadows
        className="w-full h-full"
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={50}
        />
        <Cardiology3D
          patients={patients}
          stats={stats}
          onPatientSelect={onPatientSelect}
        />
      </Canvas>
    </div>
  );
};

export default CardiologyVisualization3D;
