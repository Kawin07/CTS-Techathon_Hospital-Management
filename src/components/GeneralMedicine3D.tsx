/**
 * General Medicine Department 3D Visualization
 * Integrates general patient data with standard ward equipment
 */

import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Box,
  Cylinder,
  Plane,
  Html,
} from "@react-three/drei";

import * as THREE from "three";

interface GeneralPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  severity: "Stable" | "Monitoring" | "Attention" | "Critical";
  roomNumber: string;
  admissionDate: string;
  expectedDischarge: string;
  vitals?: {
    temperature: number;
    heartRate: number;
    bloodPressure: string;
    respirationRate: number;
  };
}

interface GeneralMedicineStats {
  totalPatients: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  averageStayDuration: number;
  dischargesPlanned: number;
  admissionsToday: number;
  criticalCases: number;
}

interface GeneralMedicine3DProps {
  patients: GeneralPatient[];
  stats?: GeneralMedicineStats;
  onPatientSelect?: (patient: GeneralPatient) => void;
}

// Simplified Hospital Bed for General Medicine (based on HospitalVisualization3D)
const GeneralMedicineBed = ({
  position,
  occupied,
  patientData: _patientData,
  bedType = "general",
}: {
  position: [number, number, number];
  occupied: boolean;
  patientData?: GeneralPatient;
  bedType?: "icu" | "general";
}) => {
  console.log(
    `Rendering bed at position ${position}, occupied: ${occupied}, type: ${bedType}`
  );
  const bedRef = useRef<THREE.Group>(null!);
  const monitorRef = useRef<THREE.Mesh>(null!);
  const [heartRate] = useState(60 + Math.random() * 40);

  useFrame((state) => {
    if (occupied && bedRef.current) {
      // Gentle breathing animation for occupied beds
      bedRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;

      // Monitor screen glow
      if (monitorRef.current && bedType === "icu") {
        const intensity =
          0.3 + Math.sin((state.clock.elapsedTime * heartRate) / 30) * 0.2;
        (
          monitorRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = intensity;
      }
    }
  });

  const pillowColor = occupied ? "#ffffff" : "#f1f1f1";

  return (
    <group ref={bedRef} position={position}>
      {/* Main bed frame */}
      <Box args={[1.8, 0.1, 0.9]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#e0e0e0" />
      </Box>

      {/* Mattress - Red if occupied, Green if available */}
      <Box args={[1.7, 0.15, 0.85]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={occupied ? "#dc2626" : "#16a34a"} />
      </Box>

      {/* Pillow */}
      {occupied && (
        <Box args={[0.4, 0.08, 0.25]} position={[0, 0.6, 0.3]}>
          <meshStandardMaterial color={pillowColor} />
        </Box>
      )}

      {/* Bed legs */}
      {[
        [-0.8, -0.2, -0.4],
        [0.8, -0.2, -0.4],
        [-0.8, -0.2, 0.4],
        [0.8, -0.2, 0.4],
      ].map((pos, i) => (
        <Cylinder
          key={i}
          args={[0.05, 0.05, 0.6]}
          position={pos as [number, number, number]}
        >
          <meshStandardMaterial color="#666666" />
        </Cylinder>
      ))}

      {/* Head/Foot boards */}
      <Box args={[1.8, 0.5, 0.05]} position={[0, 0.7, 0.45]}>
        <meshStandardMaterial color="#d0d0d0" />
      </Box>
      <Box args={[1.8, 0.3, 0.05]} position={[0, 0.6, -0.45]}>
        <meshStandardMaterial color="#d0d0d0" />
      </Box>

      {/* Patient Monitor for ICU beds */}
      {occupied && bedType === "icu" && (
        <group position={[-1.2, 0, 0]}>
          <Box args={[0.4, 0.3, 0.15]} position={[0, 1.2, 0]}>
            <meshStandardMaterial color="#2c2c2c" />
          </Box>
          {/* Monitor Screen */}
          <Box
            ref={monitorRef}
            args={[0.35, 0.25, 0.02]}
            position={[0, 1.2, 0.08]}
          >
            <meshStandardMaterial
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.3}
            />
          </Box>
          {/* Monitor Stand */}
          <Cylinder args={[0.05, 0.05, 1.2]} position={[0, 0.6, 0]}>
            <meshStandardMaterial color="#666666" />
          </Cylinder>
        </group>
      )}

      {/* Bed status + hover details */}
      <Html position={[0, 1.7, 0]} center distanceFactor={7}>
        <div className="group relative cursor-default select-none">
          <div
            className={`min-w-[110px] px-3 py-1.5 rounded-md shadow-md border text-[11px] font-semibold tracking-wide flex items-center justify-center ${
              occupied
                ? "bg-red-600/95 border-red-700 text-white"
                : "bg-green-600/95 border-green-700 text-white"
            }`}
          >
            {occupied ? "OCCUPIED" : "AVAILABLE"}
          </div>

          {occupied && (
            <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-48 -translate-x-1/2 translate-y-3 flex-col rounded-lg border border-gray-200 bg-white/95 p-3 text-[11px] leading-snug shadow-xl backdrop-blur group-hover:flex">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 font-medium">Bed ID</span>
                <span className="text-gray-900 font-semibold">
                  {_patientData?.roomNumber || "—"}
                </span>
              </div>
              <div className="mb-1">
                <span className="text-gray-600 font-medium block">Disease</span>
                <span className="text-gray-900 line-clamp-2">
                  {_patientData?.condition || "General Care"}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 font-medium">
                  Pred. Discharge
                </span>
                <span className="text-gray-900">
                  {_patientData?.expectedDischarge || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Age</span>
                <span className="text-gray-900">
                  {_patientData?.age ?? "—"}
                </span>
              </div>
              {bedType === "icu" && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 text-center">
                  ICU CRITICAL ZONE
                </div>
              )}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

const GeneralMedicine3D: React.FC<GeneralMedicine3DProps> = ({
  patients,
  stats: _stats,
  onPatientSelect: _onPatientSelect,
}) => {
  const sceneRef = useRef<THREE.Group>(null!);

  // Create dynamic bed layout based on stats
  const bedData = useMemo(() => {
    if (!_stats) return [];

    // Normalize and safeguard values
    const totalBedCount = Math.max(0, _stats.totalBeds || 0);
    const available = Math.min(
      Math.max(
        0,
        _stats.availableBeds ?? totalBedCount - (_stats.occupiedBeds ?? 0)
      ),
      totalBedCount
    );
    const occupiedBedCount = Math.min(
      Math.max(0, _stats.occupiedBeds ?? totalBedCount - available),
      totalBedCount
    );

    // Calculate optimal grid layout
    const cols = Math.ceil(Math.sqrt(totalBedCount * 1.2)); // Slightly more columns than rows
    const rows = Math.ceil(totalBedCount / cols);

    const beds: Array<{
      pos: [number, number, number];
      occupied: boolean;
      patient?: GeneralPatient;
      type: "icu" | "general";
    }> = [];

    // Calculate grid spacing and centering
    const bedSpacing = 4;
    const startX = -((cols - 1) * bedSpacing) / 2;
    const startZ = -((rows - 1) * 3) / 2;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const bedIndex = i * cols + j;

        // Only create beds up to the total bed count
        if (bedIndex >= totalBedCount) break;

        const assignedPatient = patients?.[bedIndex];

        // Determine if bed is occupied based on stats rather than patient assignment
        const isOccupied = bedIndex < occupiedBedCount; // First N beds marked occupied for visualization

        beds.push({
          pos: [startX + j * bedSpacing, 0, startZ + i * 3],
          occupied: isOccupied,
          patient:
            assignedPatient ||
            (isOccupied
              ? ({
                  id: `AUTO-${bedIndex}`,
                  name: `Patient ${bedIndex + 1}`,
                  age: 45 + Math.floor(Math.random() * 30),
                  condition: "General Care",
                  severity: "Stable",
                  roomNumber: `GM-${bedIndex + 200}`,
                  admissionDate: "Today",
                  expectedDischarge: "Tomorrow",
                } as GeneralPatient)
              : undefined),
          type: bedIndex < Math.floor(totalBedCount * 0.2) ? "icu" : "general", // First 20% are ICU
        });
      }
    }

    return beds;
  }, [patients, _stats]);

  // Calculate dynamic floor size based on bed layout
  const floorSize = useMemo(() => {
    if (!_stats) return [20, 20];
    const totalBedCount = _stats.totalBeds;
    const cols = Math.ceil(Math.sqrt(totalBedCount * 1.2));
    const rows = Math.ceil(totalBedCount / cols);

    // Add padding around the beds
    const floorWidth = Math.max(cols * 4 + 10, 20);
    const floorDepth = Math.max(rows * 3 + 10, 20);

    return [floorWidth, floorDepth];
  }, [_stats]);

  // Auto-rotate scene (disabled for manual control)
  // useFrame((_, delta) => {
  //   if (sceneRef.current) {
  //     sceneRef.current.rotation.y += delta * 0.05;
  //   }
  // });

  return (
    <group ref={sceneRef}>
      {/* Simple Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 8, -10]} color="#16a34a" intensity={0.4} />

      {/* Dynamic Floor */}
      <Plane
        args={[floorSize[0], floorSize[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#f8f9fa" />
      </Plane>

      {/* Department Title */}
      <Text
        position={[0, 8, 0]}
        fontSize={2}
        color="#16a34a"
        anchorX="center"
        anchorY="middle"
      >
        GENERAL MEDICINE
      </Text>

      {/* Render Hospital Beds */}
      {bedData.map((bed, index) => (
        <GeneralMedicineBed
          key={index}
          position={bed.pos}
          occupied={bed.occupied}
          patientData={bed.patient}
          bedType={bed.type}
        />
      ))}
    </group>
  );
};

// Main General Medicine Component with Canvas
const GeneralMedicineVisualization3D: React.FC<GeneralMedicine3DProps> = ({
  patients,
  stats: _stats,
  onPatientSelect: _onPatientSelect,
}) => {
  // Calculate dynamic camera position based on bed count
  const cameraPosition = useMemo(() => {
    if (!_stats) return [25, 18, 25] as [number, number, number];
    const totalBedCount = _stats.totalBeds;
    const cols = Math.ceil(Math.sqrt(totalBedCount * 1.2));
    const rows = Math.ceil(totalBedCount / cols);

    // Scale camera distance based on layout size
    const maxDimension = Math.max(cols * 4, rows * 3);
    const cameraDistance = Math.max(maxDimension * 0.8, 15);
    const cameraHeight = Math.max(cameraDistance * 0.6, 12);

    return [cameraDistance, cameraHeight, cameraDistance] as [
      number,
      number,
      number
    ];
  }, [_stats]);

  return (
    <div className="w-full h-full bg-gradient-to-b from-green-50 to-blue-50">
      <Canvas
        camera={{ position: cameraPosition, fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <color attach="background" args={["#f0f4f8"]} />
        <fog attach="fog" args={["#f0f4f8", 10, 50]} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          autoRotateSpeed={0.5}
          minDistance={5}
          maxDistance={40}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
        />
        <GeneralMedicine3D
          patients={patients}
          stats={_stats}
          onPatientSelect={_onPatientSelect}
        />
      </Canvas>
    </div>
  );
};

export default GeneralMedicineVisualization3D;
