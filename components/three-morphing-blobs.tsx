'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function MorphingBlob({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.2;
      
      const s = scale + Math.sin(state.clock.elapsedTime) * 0.2;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 128, 128]} position={position} scale={scale}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.6}
          speed={3}
          roughness={0}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </Sphere>
    </Float>
  );
}

function LiquidSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 128, 128]} />
      <MeshDistortMaterial
        color="#ec4899"
        distort={0.5}
        speed={2}
        roughness={0.2}
        metalness={1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

export function ThreeMorphingBlobs() {
  return (
    <div className="fixed inset-0 -z-10 opacity-50">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[0, 0, 5]} intensity={2} color="#ec4899" />
        <pointLight position={[5, 5, 0]} intensity={1} color="#f472b6" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#f9a8d4" />
        
        {/* Central liquid sphere */}
        <LiquidSphere />
        
        {/* Orbiting morphing blobs */}
        <MorphingBlob position={[3, 2, 0]} color="#f472b6" scale={0.8} />
        <MorphingBlob position={[-3, -2, -1]} color="#f9a8d4" scale={0.6} />
        <MorphingBlob position={[2, -3, 1]} color="#fbcfe8" scale={0.7} />
        <MorphingBlob position={[-2, 3, -2]} color="#ec4899" scale={0.5} />
      </Canvas>
    </div>
  );
}
