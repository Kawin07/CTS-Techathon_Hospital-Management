/**
 * Neurology Department 3D Visualization
 * Integrates neurological patient data with 3D brain imaging equipment
 */

import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Box,
  Sphere,
  Html,
  Float,
} from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import {
  MedicalBed,
  MedicalStaff3D,
  DepartmentRoom3D,
} from "./BaseDepartment3D";

interface NeurologyPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  severity: "Mild" | "Moderate" | "Severe" | "Critical";
  roomNumber: string;
  brainActivity: number; // 0-100 scale
  cognitiveScore: number; // 0-30 scale
  motorFunction: number; // 0-100 scale
  admissionDate: string;
}

interface NeurologyStats {
  totalPatients: number;
  activeMRIs: number;
  scheduledSurgeries: number;
  rehabilitationCases: number;
  averageCognitiveScore: number;
  criticalCases: number;
}

interface Neurology3DProps {
  patients: NeurologyPatient[];
  stats: NeurologyStats;
  onPatientSelect?: (patient: NeurologyPatient) => void;
}

// Get severity colors for neurology conditions
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Critical":
      return "#dc2626";
    case "Severe":
      return "#ea580c";
    case "Moderate":
      return "#d97706";
    case "Mild":
      return "#16a34a";
    default:
      return "#6b7280";
  }
};

// Brain Activity Monitor
const BrainActivityMonitor = ({
  position,
  patientData,
}: {
  position: [number, number, number];
  patientData: NeurologyPatient;
}) => {
  const monitorRef = useRef<THREE.Group>(null!);
  const [wavePhase, setWavePhase] = useState(0);

  useFrame((state) => {
    if (monitorRef.current) {
      // EEG wave simulation based on brain activity
      const waveSpeed = (patientData.brainActivity / 100) * 3;
      setWavePhase(Math.sin(state.clock.elapsedTime * waveSpeed));

      // Monitor glow based on activity
      const intensity = 0.2 + (patientData.brainActivity / 100) * 0.5;
      monitorRef.current.children.forEach((child: any) => {
        if (child.material && child.material.emissive) {
          child.material.emissiveIntensity = intensity;
        }
      });
    }
  });

  const severityColor = getSeverityColor(patientData.severity);

  return (
    <group ref={monitorRef} position={position}>
      {/* Monitor Base */}
      <Box args={[0.9, 0.6, 0.2]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#2c2c2c" />
      </Box>

      {/* Monitor Screen */}
      <Box args={[0.85, 0.55, 0.02]} position={[0, 0.3, 0.11]}>
        <meshStandardMaterial
          color="#000000"
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </Box>

      {/* Brain Activity Display */}
      <Html position={[0, 0.3, 0.12]} center>
        <div className="w-72 h-44 bg-black rounded border-2 border-green-400 p-3 relative">
          {/* Patient Info Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="text-white text-sm font-bold">
              {patientData.name}
            </div>
            <div
              className="px-2 py-1 rounded text-xs font-bold text-white"
              style={{ backgroundColor: severityColor }}
            >
              {patientData.severity}
            </div>
          </div>

          {/* Neurological Metrics */}
          <div className="text-white text-xs space-y-1 mb-2">
            <div className="flex justify-between">
              <span>Brain Activity:</span>
              <span className="text-cyan-400 font-bold">
                {patientData.brainActivity}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cognitive Score:</span>
              <span className="text-yellow-400 font-bold">
                {patientData.cognitiveScore}/30
              </span>
            </div>
            <div className="flex justify-between">
              <span>Motor Function:</span>
              <span className="text-green-400 font-bold">
                {patientData.motorFunction}%
              </span>
            </div>
            <div className="text-gray-300 text-xs mt-1">
              Condition: {patientData.condition}
            </div>
          </div>

          {/* EEG Wave Visualization */}
          <div className="absolute bottom-3 left-0 w-full h-12 overflow-hidden">
            <svg width="100%" height="100%" className="text-green-400">
              {/* Generate EEG-like waves */}
              <path
                d={`M0,24 ${Array.from({ length: 20 }, (_, i) => {
                  const x = i * 14;
                  const amplitude = (patientData.brainActivity / 100) * 15;
                  const y = 24 + Math.sin(wavePhase + i * 0.5) * amplitude;
                  return `L${x},${y}`;
                }).join(" ")}`}
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d={`M0,20 ${Array.from({ length: 20 }, (_, i) => {
                  const x = i * 14;
                  const amplitude = (patientData.brainActivity / 100) * 8;
                  const y =
                    20 + Math.sin(wavePhase * 1.5 + i * 0.8) * amplitude;
                  return `L${x},${y}`;
                }).join(" ")}`}
                stroke="cyan"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </div>

          {/* Alert for Critical Patients */}
          {patientData.severity === "Critical" && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </Html>
    </group>
  );
};

// MRI Scanner
const MRIScanner = ({
  position,
  active = false,
  patientName,
}: {
  position: [number, number, number];
  active?: boolean;
  patientName?: string;
}) => {
  const mriRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (mriRef.current && active) {
      // MRI scanning animation
      mriRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <group ref={mriRef} position={position}>
      {/* MRI Main Unit */}
      <Box args={[3, 2, 2]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Box>

      {/* MRI Bore (tunnel) */}
      <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.8, 0.8, 3.2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Patient Table */}
      <Box args={[2.5, 0.1, 0.7]} position={[active ? -0.5 : -1.5, 0.8, 0]}>
        <meshStandardMaterial color="#e0e0e0" />
      </Box>

      {/* Control Console */}
      <Box args={[0.8, 1.2, 0.6]} position={[2.5, 0.6, -1.5]}>
        <meshStandardMaterial color="#2c2c2c" />
      </Box>

      {/* Status Lights */}
      <Sphere args={[0.05]} position={[-1.6, 2.2, 0]}>
        <meshStandardMaterial
          color={active ? "#00ff00" : "#ff0000"}
          emissive={active ? "#00ff00" : "#ff0000"}
          emissiveIntensity={0.8}
        />
      </Sphere>

      <Html position={[0, 3, 0]} center>
        <div
          className={`px-4 py-2 rounded-lg font-semibold ${
            active ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          MRI Scanner
          {active && patientName && (
            <div className="text-sm font-normal">Scanning: {patientName}</div>
          )}
          <div className="text-xs">Status: {active ? "Active" : "Standby"}</div>
        </div>
      </Html>
    </group>
  );
};

// CT Scanner
const CTScanner = ({
  position,
  active = false,
}: {
  position: [number, number, number];
  active?: boolean;
}) => {
  const ctRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (ctRef.current && active) {
      // CT gantry rotation
      ctRef.current.children[1].rotation.z += 0.05;
    }
  });

  return (
    <group ref={ctRef} position={position}>
      {/* CT Base */}
      <Box args={[2.5, 1, 2.5]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#e8e8e8" />
      </Box>

      {/* CT Gantry */}
      <mesh position={[0, 1.8, 0]}>
        <torusGeometry args={[1.2, 0.3, 8, 16]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Patient Table */}
      <Box args={[2, 0.1, 0.6]} position={[active ? 0 : -1.5, 1.2, 0]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Box>

      <Html position={[0, 3, 0]} center>
        <div
          className={`px-4 py-2 rounded-lg font-semibold ${
            active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          CT Scanner - {active ? "Active" : "Standby"}
        </div>
      </Html>
    </group>
  );
};

const Neurology3D: React.FC<Neurology3DProps> = ({ patients, stats }) => {
  const sceneRef = useRef<THREE.Group>(null!);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Auto-rotate scene
  useFrame((_, delta) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y += delta * 0.04;
    }
  });

  // Organize patients by room/area
  const icuPatients = patients.filter((p) => p.roomNumber.startsWith("NICU"));
  const wardPatients = patients.filter((p) => p.roomNumber.startsWith("N"));

  return (
    <group ref={sceneRef}>
      {/* Enhanced Lighting for Medical Environment */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[15, 15, 15]} intensity={1.2} castShadow />
      <pointLight position={[-8, 10, -8]} color="#4f46e5" intensity={0.6} />
      <pointLight position={[8, 10, 8]} color="#06b6d4" intensity={0.4} />

      {/* Department Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[30, 22]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Department Title */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text
          position={[0, 6.5, 0]}
          fontSize={1.3}
          color="#4f46e5"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          NEUROLOGY DEPARTMENT
        </Text>
      </Float>

      {/* Department Stats */}
      <Html position={[-12, 5.5, 0]} center>
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border shadow-lg min-w-64"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-bold text-lg text-purple-600 mb-2 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Neurology Stats
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              Total Patients:{" "}
              <span className="font-semibold">{stats.totalPatients}</span>
            </div>
            <div>
              Critical Cases:{" "}
              <span className="font-semibold text-red-600">
                {stats.criticalCases}
              </span>
            </div>
            <div>
              Active MRIs:{" "}
              <span className="font-semibold text-blue-600">
                {stats.activeMRIs}
              </span>
            </div>
            <div>
              Scheduled Surgery:{" "}
              <span className="font-semibold">{stats.scheduledSurgeries}</span>
            </div>
            <div>
              Rehabilitation:{" "}
              <span className="font-semibold text-green-600">
                {stats.rehabilitationCases}
              </span>
            </div>
            <div>
              Avg Cognitive:{" "}
              <span className="font-semibold">
                {stats.averageCognitiveScore}/30
              </span>
            </div>
          </div>
        </motion.div>
      </Html>

      {/* Neuro ICU */}
      <DepartmentRoom3D
        position={[-8, 0, -4]}
        size={[10, 3, 8]}
        roomType="icu"
        occupancy={Math.round((icuPatients.length / 4) * 100)}
      />

      {/* Neuro ICU Beds and Monitors */}
      {icuPatients.slice(0, 4).map((patient, index) => {
        const bedPosition: [number, number, number] = [
          -10 + (index % 2) * 4,
          0,
          -6 + Math.floor(index / 2) * 4,
        ];
        const monitorPosition: [number, number, number] = [
          bedPosition[0] - 1.8,
          1.5,
          bedPosition[2],
        ];

        return (
          <group key={patient.id}>
            <MedicalBed
              position={bedPosition}
              occupied={true}
              patientData={patient}
              bedType="icu"
            />
            <BrainActivityMonitor
              position={monitorPosition}
              patientData={patient}
            />
          </group>
        );
      })}

      {/* General Neurology Ward */}
      <DepartmentRoom3D
        position={[6, 0, -2]}
        size={[12, 3, 10]}
        roomType="clinic"
        occupancy={Math.round((wardPatients.length / 6) * 100)}
      />

      {/* General Ward Beds */}
      {wardPatients.slice(0, 6).map((patient, index) => {
        const bedPosition: [number, number, number] = [
          2 + (index % 3) * 3.5,
          0,
          -5 + Math.floor(index / 3) * 4,
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

      {/* Imaging Suite */}
      <DepartmentRoom3D
        position={[0, 0, 6]}
        size={[16, 3, 8]}
        roomType="surgery"
        occupancy={75}
      />

      {/* MRI Scanners */}
      <MRIScanner
        position={[-4, 0, 8]}
        active={stats.activeMRIs > 0}
        patientName={stats.activeMRIs > 0 ? patients[0]?.name : undefined}
      />
      <MRIScanner position={[4, 0, 8]} active={stats.activeMRIs > 1} />

      {/* CT Scanner */}
      <CTScanner position={[-8, 0, 4]} active={true} />

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

      {/* Patient Information Panel */}
      {selectedPatient && (
        <Html position={[12, 3, -3]} center>
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
                      Age: <span className="font-semibold">{patient.age}</span>
                    </div>
                    <div>
                      Room:{" "}
                      <span className="font-semibold">
                        {patient.roomNumber}
                      </span>
                    </div>
                    <div>
                      Condition:{" "}
                      <span className="font-semibold">{patient.condition}</span>
                    </div>
                    <div>
                      Severity:{" "}
                      <span
                        className="font-semibold px-2 py-1 rounded text-white"
                        style={{
                          backgroundColor: getSeverityColor(patient.severity),
                        }}
                      >
                        {patient.severity}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="font-semibold mb-1">
                        Neurological Assessment:
                      </div>
                      <div>
                        Brain Activity:{" "}
                        <span className="font-semibold text-cyan-600">
                          {patient.brainActivity}%
                        </span>
                      </div>
                      <div>
                        Cognitive Score:{" "}
                        <span className="font-semibold text-yellow-600">
                          {patient.cognitiveScore}/30
                        </span>
                      </div>
                      <div>
                        Motor Function:{" "}
                        <span className="font-semibold text-green-600">
                          {patient.motorFunction}%
                        </span>
                      </div>
                    </div>
                    <div>
                      Admitted:{" "}
                      <span className="font-semibold">
                        {patient.admissionDate}
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

// Main Neurology Component with Canvas
const NeurologyVisualization3D: React.FC<Neurology3DProps> = ({
  patients,
  stats,
  onPatientSelect,
}) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-purple-50 to-blue-50">
      <Canvas
        camera={{ position: [0, 10, 18], fov: 60 }}
        shadows
        className="w-full h-full"
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={6}
          maxDistance={50}
        />
        <Neurology3D
          patients={patients}
          stats={stats}
          onPatientSelect={onPatientSelect}
        />
      </Canvas>
    </div>
  );
};

export default NeurologyVisualization3D;
