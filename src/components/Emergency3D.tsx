import React, { useEffect, useMemo, useRef, useState } from "react";
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

type EmergencySeverity = "Critical" | "Moderate" | "Minor" | "Stable" | string;

interface EmergencyPatient {
  id: string;
  name: string;
  age: number;
  severity: EmergencySeverity;
  condition: string;
  arrivalTime: string;
  waitTime: number;
  assignedBay?: string;
  expectedDischarge?: string;
  vitals?: {
    heartRate: number;
    bloodPressure: string;
    oxygen: number;
    temperature: number;
  };
  status?: string;
}

interface EmergencyStats {
  totalPatients: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  criticalCases: number;
  averageWaitTime: number;
  activeCases: number;
  dischargedToday: number;
}

interface Emergency3DProps {
  patients: EmergencyPatient[];
  stats: EmergencyStats;
  onPatientSelect?: (patient: EmergencyPatient) => void;
}

const severityColorMap: Record<string, string> = {
  critical: "#dc2626",
  moderate: "#f97316",
  minor: "#16a34a",
  stable: "#2563eb",
};

const getSeverityColor = (severity?: EmergencySeverity) => {
  const key = severity?.toString().toLowerCase() ?? "stable";
  return severityColorMap[key] ?? "#6b7280";
};

const severityKeywordMap: Array<{
  keywords: string[];
  severity: EmergencySeverity;
}> = [
  {
    severity: "Critical",
    keywords: [
      "cardiac",
      "stroke",
      "trauma",
      "sepsis",
      "respiratory failure",
      "brain",
      "hemorrhage",
      "shock",
      "arrest",
      "ventilator",
    ],
  },
  {
    severity: "Moderate",
    keywords: [
      "fracture",
      "infection",
      "observation",
      "monitoring",
      "pain",
      "injury",
      "wound",
      "surgery",
      "post-op",
    ],
  },
];

const CRITICAL_DISCHARGE_OPTIONS = ["3 days", "5 days", "1 week"] as const;
const MODERATE_DISCHARGE_OPTIONS = ["Same day", "1 day", "2 days"] as const;
const GENERAL_DISCHARGE_OPTIONS = ["Same day", "Next day"] as const;

const getRandomDischargeOption = (options: readonly string[]): string =>
  options[Math.floor(Math.random() * options.length)];

const inferSeverityFromCondition = (
  condition?: string,
  existing?: EmergencySeverity
): EmergencySeverity => {
  if (existing) {
    return existing;
  }
  if (!condition) {
    return "Moderate";
  }
  const normalized = condition.toLowerCase();
  for (const rule of severityKeywordMap) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.severity;
    }
  }
  return "Moderate";
};

const getPredictedDischarge = (severity: EmergencySeverity): string => {
  const key = severity.toString().toLowerCase();
  if (key === "critical") {
    return getRandomDischargeOption(CRITICAL_DISCHARGE_OPTIONS);
  }
  if (key === "moderate") {
    return getRandomDischargeOption(MODERATE_DISCHARGE_OPTIONS);
  }
  return getRandomDischargeOption(GENERAL_DISCHARGE_OPTIONS);
};

const normalizeDischargeEstimate = (
  estimate: string | undefined,
  severity: EmergencySeverity
): string => {
  const severityKey = severity?.toString().toLowerCase() ?? "moderate";
  const fallback = getPredictedDischarge(severityKey);

  if (!estimate?.trim()) {
    return fallback;
  }

  const trimmed = estimate.trim();
  const normalized = trimmed.toLowerCase();
  const hasHours = normalized.includes("hour") || normalized.includes("hr");

  if (severityKey === "critical") {
    const weekMatch = normalized.match(/(\d+)\s*week/);
    if (weekMatch) {
      const weeks = Math.max(parseInt(weekMatch[1], 10) || 1, 1);
      return `${weeks} week${weeks === 1 ? "" : "s"}`;
    }
    if (normalized.includes("week")) {
      return "1 week";
    }

    const dayMatch = normalized.match(/(\d+)\s*day/);
    if (dayMatch) {
      const days = Math.max(parseInt(dayMatch[1], 10) || 0, 3);
      return `${days} day${days === 1 ? "" : "s"}`;
    }

    if (
      hasHours ||
      normalized.includes("same day") ||
      normalized.includes("next day")
    ) {
      return fallback;
    }

    return fallback;
  }

  if (severityKey === "moderate") {
    if (normalized.includes("same day") || normalized.includes("today")) {
      return "Same day";
    }

    const dayMatch = normalized.match(/(\d+)\s*day/);
    if (dayMatch) {
      const rawDays = parseInt(dayMatch[1], 10) || 0;
      const days = Math.min(Math.max(rawDays, 1), 2);
      if (days === 1) {
        return "1 day";
      }
      if (days === 2) {
        return "2 days";
      }
      return "Same day";
    }

    if (
      hasHours ||
      normalized.includes("week") ||
      normalized.includes("month")
    ) {
      return fallback;
    }

    return fallback;
  }

  if (hasHours) {
    return "Same day";
  }

  if (normalized.includes("same day") || normalized.includes("today")) {
    return "Same day";
  }

  const dayMatch = normalized.match(/(\d+)\s*day/);
  if (dayMatch) {
    const days = Math.max(parseInt(dayMatch[1], 10) || 0, 1);
    return `${days} day${days === 1 ? "" : "s"}`;
  }

  const weekMatch = normalized.match(/(\d+)\s*week/);
  if (weekMatch) {
    const weeks = Math.max(parseInt(weekMatch[1], 10) || 1, 1);
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }

  if (normalized.includes("week")) {
    return "1 week";
  }

  return fallback;
};

const EmergencyBed = ({
  position,
  occupied,
  patientData,
  bedIndex,
  onSelect,
}: {
  position: [number, number, number];
  occupied: boolean;
  patientData?: EmergencyPatient;
  bedIndex: number;
  onSelect?: (patient: EmergencyPatient) => void;
}) => {
  const bedRef = useRef<THREE.Group>(null!);
  const monitorRef = useRef<THREE.Mesh>(null!);
  const [heartRate] = useState(78 + Math.random() * 25);

  useFrame((state) => {
    if (occupied && bedRef.current) {
      bedRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.025;

      if (monitorRef.current && patientData) {
        const isCritical =
          patientData.severity?.toString().toLowerCase() === "critical";
        const intensityBase = isCritical ? 0.75 : 0.4;
        const intensity =
          intensityBase +
          Math.sin((state.clock.elapsedTime * heartRate) / 32) * 0.2;
        (
          monitorRef.current.material as THREE.MeshStandardMaterial
        ).emissiveIntensity = Math.max(intensity, 0.2);
      }
    }
  });

  const bedColor =
    occupied && patientData
      ? getSeverityColor(patientData.severity)
      : "#16a34a";
  const displayBedId = patientData?.assignedBay || `Bed ${bedIndex + 1}`;

  return (
    <group
      ref={bedRef}
      position={position}
      onClick={() => {
        if (occupied && patientData && onSelect) {
          onSelect(patientData);
        }
      }}
    >
      <Box args={[1.9, 0.12, 0.95]} position={[0, 0.42, 0]}>
        <meshStandardMaterial color="#f3f4f6" />
      </Box>

      <Box args={[1.8, 0.18, 0.85]} position={[0, 0.52, 0]}>
        <meshStandardMaterial color={bedColor} />
      </Box>

      {occupied && (
        <Box args={[0.4, 0.1, 0.26]} position={[0, 0.62, 0.3]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
      )}

      {/*
        [-0.85, -0.2, -0.35],
        [0.85, -0.2, -0.35],
        [-0.85, -0.2, 0.35],
        [0.85, -0.2, 0.35],
      ].map((pos, idx) => (
        <Cylinder key={idx} args={[0.06, 0.06, 0.6]} position={pos as [number, number, number]}>
          <meshStandardMaterial color="#9ca3af" />
        </Cylinder>
      ))*/}

      <Box args={[1.9, 0.45, 0.08]} position={[0, 0.78, 0.52]}>
        <meshStandardMaterial color="#cbd5f5" />
      </Box>
      <Box args={[1.9, 0.32, 0.08]} position={[0, 0.65, -0.52]}>
        <meshStandardMaterial color="#cbd5f5" />
      </Box>

      {occupied && (
        <group position={[-1.4, 0, 0]}>
          <Box args={[0.45, 0.38, 0.16]} position={[0, 1.35, 0]}>
            <meshStandardMaterial color="#1f2937" />
          </Box>
          <Box
            ref={monitorRef}
            args={[0.4, 0.32, 0.02]}
            position={[0, 1.35, 0.09]}
          >
            <meshStandardMaterial
              color={bedColor}
              emissive={bedColor}
              emissiveIntensity={0.35}
            />
          </Box>
          <Cylinder args={[0.05, 0.05, 1.35]} position={[0, 0.68, 0]}>
            <meshStandardMaterial color="#9ca3af" />
          </Cylinder>
        </group>
      )}

      <Html position={[0, 1.85, 0]} center distanceFactor={7}>
        <div className="group relative select-none">
          <div
            className={`min-w-[120px] px-3 py-1.5 rounded-md border text-[11px] font-semibold tracking-wide shadow ${
              occupied
                ? "bg-white text-gray-900 border-gray-200"
                : "bg-green-600/95 text-white border-green-700"
            }`}
          >
            {occupied
              ? `${displayBedId} • ${patientData?.severity ?? "Stable"}`
              : "AVAILABLE"}
          </div>
          {occupied && patientData && (
            <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-52 -translate-x-1/2 translate-y-3 flex-col rounded-lg border border-gray-200 bg-white/95 p-3 text-[11px] leading-snug shadow-xl backdrop-blur group-hover:flex">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 font-medium">Bed ID</span>
                <span className="text-gray-900 font-semibold">
                  {displayBedId}
                </span>
              </div>
              <div className="mb-1">
                <span className="text-gray-600 font-medium block">Disease</span>
                <span className="text-gray-900 line-clamp-2">
                  {patientData.condition}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 font-medium">
                  Pred. Discharge
                </span>
                <span className="text-gray-900">
                  {patientData.expectedDischarge ?? "TBD"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Arrival</span>
                <span className="text-gray-900">{patientData.arrivalTime}</span>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

const EmergencyScene = ({
  patients,
  stats,
  onSelect,
}: {
  patients: EmergencyPatient[];
  stats: EmergencyStats;
  onSelect?: (patient: EmergencyPatient) => void;
}) => {
  const bedLayout = useMemo(() => {
    const totalBeds = Math.max(0, stats.totalBeds || patients.length || 12);
    const occupiedBeds = Math.min(stats.occupiedBeds ?? totalBeds, totalBeds);

    const cols = Math.max(3, Math.ceil(Math.sqrt(totalBeds * 1.1)));
    const rows = Math.ceil(totalBeds / cols);

    const bedSpacingX = 3.8;
    const bedSpacingZ = 3.2;
    const startX = -((cols - 1) * bedSpacingX) / 2;
    const startZ = -((rows - 1) * bedSpacingZ) / 2;

    const beds: Array<{
      position: [number, number, number];
      occupied: boolean;
      patient?: EmergencyPatient;
      index: number;
    }> = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const bedIndex = i * cols + j;
        if (bedIndex >= totalBeds) break;

        const assignedPatient = patients[bedIndex];
        const isOccupied = bedIndex < occupiedBeds;

        const patientForBed = isOccupied
          ? (() => {
              const fallbackCondition =
                bedIndex < stats.criticalCases
                  ? "Polytrauma with Internal Injuries"
                  : "Post-op Observation";
              const basePatient: EmergencyPatient = assignedPatient
                ? { ...assignedPatient }
                : {
                    id: `ED-${bedIndex}`,
                    name: `Patient ${bedIndex + 1}`,
                    age: 35 + ((bedIndex * 7) % 25),
                    severity: "Moderate",
                    condition: fallbackCondition,
                    arrivalTime: "Now",
                    waitTime: stats.averageWaitTime,
                    assignedBay: `Bed ${bedIndex + 1}`,
                    expectedDischarge: undefined,
                  };

              const severity = inferSeverityFromCondition(
                basePatient.condition,
                basePatient.severity
              );

              const expectedDischarge = normalizeDischargeEstimate(
                basePatient.expectedDischarge,
                severity
              );

              return {
                ...basePatient,
                severity,
                assignedBay: basePatient.assignedBay ?? `Bed ${bedIndex + 1}`,
                expectedDischarge,
              };
            })()
          : undefined;

        beds.push({
          position: [startX + j * bedSpacingX, 0, startZ + i * bedSpacingZ],
          occupied: isOccupied,
          patient: patientForBed,
          index: bedIndex,
        });
      }
    }

    return beds;
  }, [patients, stats]);

  const floorSize = useMemo(() => {
    const totalBeds = stats.totalBeds || bedLayout.length || 12;
    const cols = Math.max(3, Math.ceil(Math.sqrt(totalBeds * 1.1)));
    const rows = Math.ceil(totalBeds / cols);
    return [Math.max(cols * 4.5, 18), Math.max(rows * 3.5, 18)];
  }, [bedLayout.length, stats.totalBeds]);

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[12, 14, 10]} intensity={1.1} />
      <pointLight position={[-10, 8, -10]} color="#ef4444" intensity={0.5} />

      <Plane
        args={[floorSize[0], floorSize[1]]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#fff7ed" />
      </Plane>

      <Text
        position={[0, 7, -floorSize[1] / 3]}
        fontSize={1.8}
        color="#dc2626"
        anchorX="center"
        anchorY="middle"
      >
        EMERGENCY DEPARTMENT
      </Text>

      {bedLayout.map((bed) => (
        <EmergencyBed
          key={bed.index}
          position={bed.position}
          occupied={bed.occupied}
          patientData={bed.patient}
          bedIndex={bed.index}
          onSelect={onSelect}
        />
      ))}

      {/* <Html position={[0, 0.2, floorSize[1] / 2 - 2]} center>
        <div className="grid grid-cols-2 gap-3 bg-white/95 rounded-lg border border-red-200 px-4 py-3 text-xs text-gray-700 shadow-lg">
          <div>
            <div className="font-semibold text-gray-900">Total Beds</div>
            <div className="text-red-600 text-lg font-bold">
              {stats.totalBeds}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">Occupied</div>
            <div className="text-orange-500 text-lg font-bold">
              {stats.occupiedBeds}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">Available</div>
            <div className="text-green-600 text-lg font-bold">
              {stats.availableBeds}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">Critical Cases</div>
            <div className="text-red-500 text-lg font-bold">
              {stats.criticalCases}
            </div>
          </div>
        </div>
      </Html> */}
    </group>
  );
};

const Emergency3D: React.FC<Emergency3DProps> = ({
  patients,
  stats,
  onPatientSelect,
}) => {
  const [cameraMode, setCameraMode] = useState<"auto" | "manual">("manual");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100 z-10">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              Loading Emergency Department...
            </p>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [24, 16, 24], fov: 58 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#fff7ed"]} />
        <fog attach="fog" args={["#fff7ed", 12, 60]} />

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          autoRotate={cameraMode === "auto"}
          autoRotateSpeed={0.6}
          minDistance={6}
          maxDistance={45}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.4}
        />
        <EmergencyScene
          patients={patients}
          stats={stats}
          onSelect={onPatientSelect}
        />
      </Canvas>

      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-red-200">
          <div className="flex items-center space-x-2 text-xs font-medium text-gray-700">
            <span className="inline-flex w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Emergency Live Feed</span>
          </div>
          <button
            onClick={() =>
              setCameraMode((mode) => (mode === "auto" ? "manual" : "auto"))
            }
            className="mt-2 text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {cameraMode === "auto"
              ? "Disable Auto Rotate"
              : "Enable Auto Rotate"}
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs">
          <h4 className="text-gray-800 font-semibold mb-2">Triage Severity</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-red-600" />
              <span>Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-orange-500" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-green-600" />
              <span>Minor</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-blue-600" />
              <span>Stable</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
        Emergency Department 3D • Real-time Patient Monitoring
      </div>
    </div>
  );
};

const EmergencyVisualization3D: React.FC<Emergency3DProps> = ({
  patients,
  stats,
  onPatientSelect,
}) => {
  return (
    <Emergency3D
      patients={patients}
      stats={stats}
      onPatientSelect={onPatientSelect}
    />
  );
};

export { getPredictedDischarge, normalizeDischargeEstimate };
export default EmergencyVisualization3D;
