'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function WireframeTunnel() {
  const groupRef = useRef<THREE.Group>(null);
  
  const rings = useMemo(() => {
    const ringArray = [];
    for (let i = 0; i < 20; i++) {
      ringArray.push({
        z: i * 2 - 20,
        rotation: Math.random() * Math.PI * 2,
        scale: 1 + Math.random() * 0.5,
      });
    }
    return ringArray;
  }, []);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      
      groupRef.current.children.forEach((child, i) => {
        child.position.z += 0.05;
        if (child.position.z > 2) {
          child.position.z = -38;
        }
        
        child.rotation.x = state.clock.elapsedTime * 0.5 + i * 0.1;
        child.rotation.y = state.clock.elapsedTime * 0.3 + i * 0.05;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[0, 0, ring.z]} rotation={[0, 0, ring.rotation]} scale={ring.scale}>
          <torusGeometry args={[3, 0.1, 16, 100]} />
          <meshBasicMaterial
            color={new THREE.Color().setHSL(0.9 + i * 0.01, 0.7, 0.6)}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 20;
    }
    return positions;
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += 0.05;
        if (positions[i + 2] > 2) {
          positions[i + 2] = -38;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
          args={[particlesPosition, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ec4899"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function ThreeTunnelScene() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <WireframeTunnel />
        <FloatingParticles />
        
        <pointLight position={[0, 0, 0]} intensity={2} color="#ec4899" />
        <pointLight position={[0, 0, -20]} intensity={1} color="#f472b6" />
      </Canvas>
    </div>
  );
}
