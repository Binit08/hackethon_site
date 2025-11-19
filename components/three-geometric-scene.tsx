'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group>
      {/* Center Dodecahedron */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={meshRef}>
          <dodecahedronGeometry args={[1.5, 0]} />
          <MeshDistortMaterial
            color="#ec4899"
            distort={0.3}
            speed={2}
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Orbiting Spheres */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 3;
        return (
          <Float key={i} speed={1.5 + i * 0.2} rotationIntensity={1} floatIntensity={1}>
            <mesh position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.5, 0]}>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#f472b6' : '#f9a8d4'}
                emissive={i % 2 === 0 ? '#f472b6' : '#f9a8d4'}
                emissiveIntensity={0.5}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

export function ThreeGeometricScene({ opacity = 0.6 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ec4899" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f472b6" />
        
        <FloatingGeometry />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}
