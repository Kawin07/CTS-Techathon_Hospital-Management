import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Plane, Float, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Realistic Hospital Bed with Medical Equipment
const RealisticHospitalBed = ({ 
  position, 
  occupied, 
  patientData, 
  bedType = 'general' 
}: { 
  position: [number, number, number], 
  occupied: boolean, 
  patientData?: any,
  bedType?: 'icu' | 'general' 
}) => {
  const bedRef = useRef<THREE.Group>(null!);
  const ivRef = useRef<THREE.Group>(null!);
  const monitorRef = useRef<THREE.Mesh>(null!);
  const [heartRate] = useState(60 + Math.random() * 40);
  
  useFrame((state, delta) => {
    if (occupied && bedRef.current) {
      // Gentle breathing animation for occupied beds
      bedRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
      
      // IV drip animation
      if (ivRef.current) {
        ivRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      }
      
      // Monitor screen glow
      if (monitorRef.current && bedType === 'icu') {
        const intensity = 0.3 + Math.sin(state.clock.elapsedTime * heartRate / 30) * 0.2;
        (monitorRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      }
    }
  });

  const bedColor = bedType === 'icu' ? '#ff6b6b' : '#4dabf7';
  const pillowColor = occupied ? '#ffffff' : '#f1f1f1';

  return (
    <group ref={bedRef} position={position}>
      {/* Main bed frame */}
      <Box args={[1.8, 0.1, 0.9]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#e0e0e0" />
      </Box>
      
      {/* Mattress */}
      <Box args={[1.7, 0.15, 0.85]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={occupied ? "#f8f9fa" : "#e9ecef"} />
      </Box>
      
      {/* Pillow */}
      {occupied && (
        <Box args={[0.4, 0.08, 0.25]} position={[0, 0.6, 0.3]}>
          <meshStandardMaterial color={pillowColor} />
        </Box>
      )}
      
      {/* Bed legs */}
      {[[-0.8, -0.2, -0.4], [0.8, -0.2, -0.4], [-0.8, -0.2, 0.4], [0.8, -0.2, 0.4]].map((pos, i) => (
        <Cylinder key={i} args={[0.05, 0.05, 0.6]} position={pos as [number, number, number]}>
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
      
      {/* Medical Equipment for occupied beds */}
      {occupied && (
        <>
          {/* IV Stand */}
          <group ref={ivRef} position={[1.2, 0, 0]}>
            <Cylinder args={[0.03, 0.03, 1.8]} position={[0, 0.9, 0]}>
              <meshStandardMaterial color="#cccccc" />
            </Cylinder>
            <Cylinder args={[0.15, 0.15, 0.05]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#666666" />
            </Cylinder>
            {/* IV Bag */}
            <Box args={[0.15, 0.25, 0.05]} position={[0, 1.6, 0]}>
              <meshStandardMaterial color="#e3f2fd" transparent opacity={0.8} />
            </Box>
            {/* IV Tube */}
            <Cylinder args={[0.005, 0.005, 1.2]} position={[0, 1.0, 0]} rotation={[0, 0, 0.3]}>
              <meshStandardMaterial color="#ffeb3b" />
            </Cylinder>
          </group>
          
          {/* Patient Monitor for ICU beds */}
          {bedType === 'icu' && (
            <group position={[-1.2, 0, 0]}>
              <Box args={[0.4, 0.3, 0.15]} position={[0, 1.2, 0]}>
                <meshStandardMaterial color="#2c2c2c" />
              </Box>
              {/* Monitor Screen */}
              <Box ref={monitorRef} args={[0.35, 0.25, 0.02]} position={[0, 1.2, 0.08]}>
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
          
          {/* Patient indicator */}
          <Float speed={2} rotationIntensity={0.1} floatIntensity={0.1}>
            <Sphere args={[0.1]} position={[0, 0.8, 0]}>
              <meshStandardMaterial 
                color={bedType === 'icu' ? '#ff4757' : '#5352ed'} 
                emissive={bedType === 'icu' ? '#ff4757' : '#5352ed'}
                emissiveIntensity={0.3}
              />
            </Sphere>
          </Float>
        </>
      )}
      
      {/* Bed status indicator */}
      <Html position={[0, 1.5, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          occupied 
            ? bedType === 'icu' 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
            : 'bg-gray-300 text-gray-700'
        }`}>
          {occupied ? `${bedType.toUpperCase()} - ${Math.round(heartRate)} BPM` : 'Available'}
        </div>
      </Html>
    </group>
  );
};

// Animated Medical Staff
const MedicalStaff = ({ position, type = 'nurse' }: { position: [number, number, number], type?: 'doctor' | 'nurse' }) => {
  const staffRef = useRef<THREE.Group>(null!);
  const [targetPosition] = useState<[number, number, number]>([
    position[0] + (Math.random() - 0.5) * 10,
    position[1],
    position[2] + (Math.random() - 0.5) * 10
  ]);
  
  useFrame((state, delta) => {
    if (staffRef.current) {
      // Walking animation
      staffRef.current.position.x += Math.sin(state.clock.elapsedTime * 2) * delta * 0.1;
      staffRef.current.position.z += Math.cos(state.clock.elapsedTime * 1.5) * delta * 0.1;
      staffRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const staffColor = type === 'doctor' ? '#ffffff' : '#4dabf7';

  return (
    <group ref={staffRef} position={position}>
      {/* Body */}
      <Cylinder args={[0.15, 0.15, 0.8]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color={staffColor} />
      </Cylinder>
      {/* Head */}
      <Sphere args={[0.12]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#fdbcb4" />
      </Sphere>
      {/* Arms */}
      <Cylinder args={[0.05, 0.05, 0.4]} position={[-0.2, 0.6, 0]} rotation={[0, 0, 0.3]}>
        <meshStandardMaterial color={staffColor} />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.4]} position={[0.2, 0.6, 0]} rotation={[0, 0, -0.3]}>
        <meshStandardMaterial color={staffColor} />
      </Cylinder>
      {/* Legs */}
      <Cylinder args={[0.06, 0.06, 0.4]} position={[-0.08, 0, 0]}>
        <meshStandardMaterial color="#2c2c2c" />
      </Cylinder>
      <Cylinder args={[0.06, 0.06, 0.4]} position={[0.08, 0, 0]}>
        <meshStandardMaterial color="#2c2c2c" />
      </Cylinder>
      
      {/* Stethoscope for doctors */}
      {type === 'doctor' && (
        <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 0.6, 0.1]} rotation={[0.5, 0, 0]}>
          <meshStandardMaterial color="#2c2c2c" />
        </Cylinder>
      )}
    </group>
  );
};

// Oxygen Flow Particles
const OxygenParticles = ({ position }: { position: [number, number, number] }) => {
  const particleRef = useRef<THREE.Group>(null!);
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      position: [
        position[0] + (Math.random() - 0.5) * 2,
        position[1] + Math.random() * 2,
        position[2] + (Math.random() - 0.5) * 2
      ] as [number, number, number],
      speed: 0.5 + Math.random() * 0.5
    }));
  }, [position]);

  useFrame((state, delta) => {
    if (particleRef.current) {
      particleRef.current.children.forEach((child, i) => {
        child.position.y += particles[i].speed * delta;
        if (child.position.y > position[1] + 3) {
          child.position.y = position[1];
        }
        child.rotation.x += delta;
        child.rotation.z += delta * 0.5;
      });
    }
  });

  return (
    <group ref={particleRef} position={position}>
      {particles.map((particle) => (
        <Sphere key={particle.id} args={[0.03]} position={particle.position}>
          <meshStandardMaterial 
            color="#00bcd4" 
            transparent 
            opacity={0.6}
            emissive="#00bcd4"
            emissiveIntensity={0.2}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Enhanced Resource Indicator
const EnhancedResourceIndicator = ({ 
  position, 
  type, 
  level, 
  icon 
}: { 
  position: [number, number, number], 
  type: string, 
  level: number,
  icon: string 
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [isHovered, setIsHovered] = useState(false);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const getColor = () => {
    if (level > 0.7) return '#10B981';
    if (level > 0.4) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Main indicator sphere */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
        <Sphere 
          args={[0.2]} 
          position={[0, 1.5, 0]}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
        >
          <meshStandardMaterial 
            color={getColor()} 
            emissive={getColor()} 
            emissiveIntensity={isHovered ? 0.6 : 0.3}
            transparent
            opacity={0.9}
          />
        </Sphere>
      </Float>
      
      {/* Support pillar */}
      <Cylinder args={[0.05, 0.05, 1.5]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#666666" />
      </Cylinder>
      
      {/* Base */}
      <Cylinder args={[0.3, 0.3, 0.1]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      
      {/* Holographic display */}
      <Html position={[0, 2.2, 0]} center>
        <div className="bg-black/80 text-white px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20">
          <div className="text-sm font-bold text-center">{type}</div>
          <div className="text-xl font-bold text-center" style={{ color: getColor() }}>
            {Math.round(level * 100)}%
          </div>
          <div className="text-xs text-center opacity-75">
            {level > 0.7 ? 'Optimal' : level > 0.4 ? 'Monitor' : 'Critical'}
          </div>
        </div>
      </Html>
      
      {/* Oxygen particles for O2 indicator */}
      {type === 'O2' && <OxygenParticles position={[0, 0, 0]} />}
    </group>
  );
};

// Main Hospital Scene
const HospitalScene = () => {
  const { camera } = useThree();
  const sceneRef = useRef<THREE.Group>(null!);
  
  const bedData = useMemo(() => {
    const beds: Array<{ pos: [number, number, number], occupied: boolean, type: 'icu' | 'general' }> = [];
    
    // ICU Ward (Critical care beds)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        beds.push({
          pos: [-6 + i * 3, 0, -6 + j * 2.5],
          occupied: Math.random() > 0.15, // 85% occupancy
          type: 'icu'
        });
      }
    }
    
    // General Ward (Regular beds)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 5; j++) {
        beds.push({
          pos: [3 + i * 2.5, 0, -8 + j * 2.2],
          occupied: Math.random() > 0.25, // 75% occupancy
          type: 'general'
        });
      }
    }
    
    return beds;
  }, []);

  // Auto-rotate camera smoothly
  useFrame((state, delta) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 8, -10]} color="#3B82F6" intensity={0.6} />
      <pointLight position={[10, 8, 10]} color="#10B981" intensity={0.4} />
      <spotLight 
        position={[0, 15, 0]} 
        angle={0.3} 
        penumbra={0.1} 
        intensity={0.8}
        castShadow
      />

      {/* Hospital Floor with realistic textures */}
      <Plane args={[25, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#f8f9fa" 
          roughness={0.1}
          metalness={0.1}
        />
      </Plane>

      {/* Hospital Walls */}
      <Box args={[25, 6, 0.2]} position={[0, 2.5, -10]}>
        <meshStandardMaterial color="#e9ecef" />
      </Box>
      <Box args={[25, 6, 0.2]} position={[0, 2.5, 10]}>
        <meshStandardMaterial color="#e9ecef" />
      </Box>
      <Box args={[0.2, 6, 20]} position={[-12.5, 2.5, 0]}>
        <meshStandardMaterial color="#e9ecef" />
      </Box>
      <Box args={[0.2, 6, 20]} position={[12.5, 2.5, 0]}>
        <meshStandardMaterial color="#e9ecef" />
      </Box>

      {/* ICU Section Floor Marking */}
      <Plane args={[9, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, -0.48, -3]}>
        <meshStandardMaterial color="#ffebee" transparent opacity={0.7} />
      </Plane>
      <Text
        position={[-4.5, 0.1, -8.5]}
        fontSize={0.6}
        color="#d32f2f"
        anchorX="center"
        anchorY="middle"
      >
        ICU WARD - CRITICAL CARE
      </Text>

      {/* General Ward Section Floor Marking */}
      <Plane args={[10, 11]} rotation={[-Math.PI / 2, 0, 0]} position={[5.5, -0.48, -3]}>
        <meshStandardMaterial color="#e3f2fd" transparent opacity={0.7} />
      </Plane>
      <Text
        position={[5.5, 0.1, -9]}
        fontSize={0.6}
        color="#1976d2"
        anchorX="center"
        anchorY="middle"
      >
        GENERAL WARD
      </Text>

      {/* Render Realistic Hospital Beds */}
      {bedData.map((bed, index) => (
        <RealisticHospitalBed
          key={index}
          position={bed.pos}
          occupied={bed.occupied}
          bedType={bed.type}
          patientData={bed.occupied ? { heartRate: 60 + Math.random() * 40 } : null}
        />
      ))}

      {/* Medical Staff */}
      <MedicalStaff position={[-2, 0, -2]} type="doctor" />
      <MedicalStaff position={[6, 0, -4]} type="nurse" />
      <MedicalStaff position={[-8, 0, 2]} type="nurse" />
      <MedicalStaff position={[8, 0, 3]} type="doctor" />

      {/* Enhanced Resource Indicators */}
      <EnhancedResourceIndicator position={[-10, 0, 5]} type="O2" level={0.78} icon="oxygen" />
      <EnhancedResourceIndicator position={[-8, 0, 7]} type="Staff" level={0.94} icon="users" />
      <EnhancedResourceIndicator position={[12, 0, 5]} type="Pharmacy" level={0.65} icon="pills" />
      <EnhancedResourceIndicator position={[10, 0, 7]} type="Blood Bank" level={0.89} icon="blood" />
      
      {/* Central Information Display */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.1}>
        <group position={[0, 3, 0]}>
          <Box args={[4, 2, 0.1]}>
            <meshStandardMaterial color="#1a1a1a" />
          </Box>
          <Html position={[0, 0, 0.1]} center>
            <div className="text-white text-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-2">Hospital Status</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total Beds: {bedData.length}</div>
                <div>Occupied: {bedData.filter(b => b.occupied).length}</div>
                <div>ICU: {bedData.filter(b => b.type === 'icu' && b.occupied).length}/12</div>
                <div>General: {bedData.filter(b => b.type === 'general' && b.occupied).length}/20</div>
              </div>
            </div>
          </Html>
        </group>
      </Float>

      {/* Emergency Equipment Stations */}
      <group position={[0, 0, 8]}>
        <Box args={[2, 1.5, 0.5]} position={[0, 0.75, 0]}>
          <meshStandardMaterial color="#ff5722" />
        </Box>
        <Text position={[0, 1.8, 0]} fontSize={0.3} color="#ff5722" anchorX="center">
          EMERGENCY
        </Text>
      </group>
      
      {/* Defibrillator */}
      <group position={[-10, 0, -8]}>
        <Box args={[0.6, 0.4, 0.8]} position={[0, 0.8, 0]}>
          <meshStandardMaterial color="#2196f3" />
        </Box>
        <Cylinder args={[0.3, 0.3, 0.8]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#666666" />
        </Cylinder>
      </group>
    </group>
  );
};

const HospitalVisualization3D = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cameraMode, setCameraMode] = useState<'auto' | 'manual'>('auto');

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl overflow-hidden shadow-[var(--shadow-strong)]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
            >
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </motion.div>
            <p className="text-sm font-medium text-gray-600">Loading 3D Hospital Model...</p>
          </motion.div>
        </div>
      )}
      
      <Canvas 
        camera={{ position: [20, 12, 20], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#f0f4f8']} />
        <fog attach="fog" args={['#f0f4f8', 10, 50]} />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          autoRotate={cameraMode === 'auto'}
          autoRotateSpeed={0.5}
          minDistance={5}
          maxDistance={40}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
        />
        <HospitalScene />
      </Canvas>
      
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-gray-700">Live Monitoring</span>
          </div>
          <button
            onClick={() => setCameraMode(cameraMode === 'auto' ? 'manual' : 'auto')}
            className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
          >
            {cameraMode === 'auto' ? 'Manual Control' : 'Auto Rotate'}
          </button>
        </div>
      </div>

      {/* Status Panel */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-black/80 text-white rounded-lg p-3 backdrop-blur-sm">
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span>Total Capacity:</span>
              <span className="font-bold">163 beds</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Occupancy:</span>
              <span className="font-bold text-yellow-400">87%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Critical Cases:</span>
              <span className="font-bold text-red-400">12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h4 className="text-xs font-bold mb-2 text-gray-800">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span>ICU Beds</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>General Beds</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span>Resource Monitors</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white border-2 border-blue-500 rounded-full" />
              <span>Medical Staff</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Info */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
        3D Real-time Hospital Visualization • React Three Fiber
      </div>
    </div>
  );
};

export default HospitalVisualization3D;