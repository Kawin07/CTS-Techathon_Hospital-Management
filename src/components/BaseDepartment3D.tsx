/**
 * Base Department 3D Model Component
 * Provides foundation for all department-specific 3D visualizations
 */

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Text,
  Box,
  Sphere,
  Cylinder,
  Plane,
  Float,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

export interface Department3DProps {
  departmentName: string;
  departmentData: any;
  roomLayout?: "ward" | "emergency" | "icu" | "surgery" | "clinic";
  colorTheme?: {
    primary: string;
    secondary: string;
    accent: string;
    floor: string;
  };
  specialEquipment?: Array<{
    type: string;
    position: [number, number, number];
    active: boolean;
    data?: any;
  }>;
}

// Animated Medical Equipment Components
export const MedicalBed = ({
  position,
  occupied,
  patientData,
  bedType = "general",
}: {
  position: [number, number, number];
  occupied: boolean;
  patientData?: any;
  bedType?: "icu" | "general" | "emergency" | "surgery";
}) => {
  const bedRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (occupied && bedRef.current) {
      bedRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
    }
  });

  const getBedColor = () => {
    switch (bedType) {
      case "icu":
        return "#ff6b6b";
      case "emergency":
        return "#ff9f43";
      case "surgery":
        return "#54a0ff";
      default:
        return "#4dabf7";
    }
  };

  const getEquipment = () => {
    switch (bedType) {
      case "icu":
        return ["monitor", "ventilator", "iv"];
      case "emergency":
        return ["monitor", "iv", "oxygen"];
      case "surgery":
        return ["anesthesia", "monitor", "surgical_light"];
      default:
        return ["iv"];
    }
  };

  return (
    <group ref={bedRef} position={position}>
      {/* Bed Frame */}
      <Box args={[1.8, 0.1, 0.9]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#e0e0e0" />
      </Box>

      {/* Mattress */}
      <Box args={[1.7, 0.15, 0.85]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={occupied ? "#f8f9fa" : "#e9ecef"} />
      </Box>

      {/* Equipment based on bed type */}
      {occupied && getEquipment().includes("monitor") && (
        <group position={[-1.2, 0, 0]}>
          <Box args={[0.4, 0.3, 0.15]} position={[0, 1.2, 0]}>
            <meshStandardMaterial color="#2c2c2c" />
          </Box>
          <Box args={[0.35, 0.25, 0.02]} position={[0, 1.2, 0.08]}>
            <meshStandardMaterial
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.3}
            />
          </Box>
        </group>
      )}

      {/* Status Display */}
      <Html position={[0, 1.5, 0]} center>
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${
            occupied
              ? `bg-${getBedColor().replace("#", "")} text-white`
              : "bg-gray-300 text-gray-700"
          }`}
          style={{ backgroundColor: occupied ? getBedColor() : "#d1d5db" }}
        >
          {occupied
            ? `${bedType.toUpperCase()} - ${patientData?.name || "Patient"}`
            : "Available"}
        </div>
      </Html>
    </group>
  );
};

export const MedicalStaff3D = ({
  position,
  type = "nurse",
  activity = "monitoring",
}: {
  position: [number, number, number];
  type?: "doctor" | "nurse" | "technician";
  activity?: "monitoring" | "treatment" | "rounds" | "surgery";
}) => {
  const staffRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (staffRef.current) {
      if (activity === "rounds") {
        staffRef.current.position.x +=
          Math.sin(state.clock.elapsedTime * 2) * delta * 0.1;
        staffRef.current.position.z +=
          Math.cos(state.clock.elapsedTime * 1.5) * delta * 0.1;
      }
      staffRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const getStaffColor = () => {
    switch (type) {
      case "doctor":
        return "#ffffff";
      case "nurse":
        return "#4dabf7";
      case "technician":
        return "#51cf66";
      default:
        return "#4dabf7";
    }
  };

  return (
    <group ref={staffRef} position={position}>
      {/* Body */}
      <Cylinder args={[0.15, 0.15, 0.8]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color={getStaffColor()} />
      </Cylinder>
      {/* Head */}
      <Sphere args={[0.12]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#fdbcb4" />
      </Sphere>

      {/* Activity indicator */}
      <Html position={[0, 1.3, 0]} center>
        <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
          {type.charAt(0).toUpperCase() + type.slice(1)} - {activity}
        </div>
      </Html>
    </group>
  );
};

export const MedicalEquipment3D = ({
  position,
  type,
  active = true,
  data,
}: {
  position: [number, number, number];
  type: string;
  active?: boolean;
  data?: any;
}) => {
  const equipmentRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (equipmentRef.current && active) {
      equipmentRef.current.rotation.y += 0.01;
    }
  });

  const getEquipmentModel = () => {
    switch (type) {
      case "mri":
        return (
          <>
            <Cylinder args={[1.5, 1.5, 3]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#e0e0e0" />
            </Cylinder>
            <Cylinder args={[0.8, 0.8, 3.2]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#333333" />
            </Cylinder>
          </>
        );
      case "ct_scanner":
        return (
          <>
            <Box args={[2, 1.5, 2]} position={[0, 0.75, 0]}>
              <meshStandardMaterial color="#f0f0f0" />
            </Box>
            <Cylinder args={[0.6, 0.6, 0.3]} position={[0, 1.5, 0]}>
              <meshStandardMaterial color="#333333" />
            </Cylinder>
          </>
        );
      case "xray":
        return (
          <Box args={[0.3, 2, 1.5]} position={[0, 1, 0]}>
            <meshStandardMaterial color="#666666" />
          </Box>
        );
      case "defibrillator":
        return (
          <Box args={[0.8, 0.6, 1]} position={[0, 0.8, 0]}>
            <meshStandardMaterial color={active ? "#ff4757" : "#666666"} />
          </Box>
        );
      case "ventilator":
        return (
          <Box args={[0.6, 1.2, 0.8]} position={[0, 0.6, 0]}>
            <meshStandardMaterial color={active ? "#2ed573" : "#666666"} />
          </Box>
        );
      default:
        return (
          <Box args={[0.5, 0.5, 0.5]} position={[0, 0.25, 0]}>
            <meshStandardMaterial color="#999999" />
          </Box>
        );
    }
  };

  return (
    <group ref={equipmentRef} position={position}>
      {getEquipmentModel()}

      {/* Status Light */}
      <Sphere args={[0.05]} position={[0, 2, 0]}>
        <meshStandardMaterial
          color={active ? "#00ff00" : "#ff0000"}
          emissive={active ? "#00ff00" : "#ff0000"}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Equipment Info */}
      <Html position={[0, 2.5, 0]} center>
        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs border">
          <div className="font-semibold">
            {type.replace("_", " ").toUpperCase()}
          </div>
          {data && (
            <div className="text-gray-600">
              {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                  {key}: {String(value)}
                </div>
              ))}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

export const DepartmentRoom3D = ({
  position,
  size,
  roomType,
  occupancy,
}: {
  position: [number, number, number];
  size: [number, number, number];
  roomType: string;
  occupancy?: number;
}) => {
  const getRoomColor = () => {
    switch (roomType) {
      case "surgery":
        return "#e3f2fd";
      case "icu":
        return "#ffebee";
      case "emergency":
        return "#fff3e0";
      case "clinic":
        return "#e8f5e8";
      default:
        return "#f5f5f5";
    }
  };

  return (
    <group position={position}>
      {/* Room Floor */}
      <Plane
        args={[size[0], size[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color={getRoomColor()}
          transparent
          opacity={0.7}
        />
      </Plane>

      {/* Room Walls */}
      <Box
        args={[size[0], size[1], 0.1]}
        position={[0, size[1] / 2, size[2] / 2]}
      >
        <meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} />
      </Box>
      <Box
        args={[size[0], size[1], 0.1]}
        position={[0, size[1] / 2, -size[2] / 2]}
      >
        <meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} />
      </Box>

      {/* Room Label */}
      <Html position={[0, size[1] + 0.5, 0]} center>
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border shadow-lg">
          <div className="font-semibold text-sm">{roomType.toUpperCase()}</div>
          {occupancy !== undefined && (
            <div className="text-xs text-gray-600">Occupancy: {occupancy}%</div>
          )}
        </div>
      </Html>
    </group>
  );
};

const BaseDepartment3D: React.FC<Department3DProps> = ({
  departmentName,
  colorTheme = {
    primary: "#4dabf7",
    secondary: "#74c0fc",
    accent: "#339af0",
    floor: "#f8f9fa",
  },
  specialEquipment = [],
}) => {
  const sceneRef = useRef<THREE.Group>(null!);

  // Auto-rotate the scene
  useFrame((_, delta) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight
        position={[-10, 8, -10]}
        color={colorTheme.primary}
        intensity={0.6}
      />
      <pointLight
        position={[10, 8, 10]}
        color={colorTheme.secondary}
        intensity={0.4}
      />

      {/* Department Floor */}
      <Plane
        args={[20, 15]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <meshStandardMaterial color={colorTheme.floor} />
      </Plane>

      {/* Department Title */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <Text
          position={[0, 4, 0]}
          fontSize={1}
          color={colorTheme.primary}
          anchorX="center"
          anchorY="middle"
        >
          {departmentName}
        </Text>
      </Float>

      {/* Special Equipment */}
      {specialEquipment.map((equipment, index) => (
        <MedicalEquipment3D
          key={index}
          position={equipment.position}
          type={equipment.type}
          active={equipment.active}
          data={equipment.data}
        />
      ))}
    </group>
  );
};

export default BaseDepartment3D;
