'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Trail } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function AnimatedSphere({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed * 0.01;
      meshRef.current.rotation.y += speed * 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.8}
        />
      </Sphere>
    </Float>
  );
}

function Torus({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={3}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[1.5, 0.4, 32, 100]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.9}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.075;
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
        size={0.05}
        color="#ec4899"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function DNA() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const helixPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const radius = 2;
    const height = 8;
    const turns = 3;
    
    for (let i = 0; i < 50; i++) {
      const t = (i / 50) * turns * Math.PI * 2;
      const y = (i / 50) * height - height / 2;
      
      points.push([
        Math.cos(t) * radius,
        y,
        Math.sin(t) * radius
      ]);
      
      points.push([
        Math.cos(t + Math.PI) * radius,
        y,
        Math.sin(t + Math.PI) * radius
      ]);
    }
    
    return points;
  }, []);

  return (
    <group ref={groupRef} position={[5, 0, -3]}>
      {helixPoints.map((pos, i) => (
        <Sphere key={i} args={[0.1, 16, 16]} position={pos}>
          <meshStandardMaterial
            color={i % 2 === 0 ? '#ec4899' : '#f472b6'}
            emissive={i % 2 === 0 ? '#ec4899' : '#f472b6'}
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
}

function Icosahedron({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#f9a8d4"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

export function ThreeHeroScene() {
  return (
    <div className="fixed inset-0 -z-10 opacity-40">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#fff" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ec4899" />
        <pointLight position={[10, -10, 5]} intensity={0.5} color="#f472b6" />
        
        {/* Stars background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Animated spheres */}
        <AnimatedSphere position={[-4, 2, 0]} color="#ec4899" speed={1.2} />
        <AnimatedSphere position={[4, -2, -2]} color="#f472b6" speed={0.8} />
        <AnimatedSphere position={[0, 3, -4]} color="#f9a8d4" speed={1.5} />
        
        {/* Torus shapes */}
        <Torus position={[-3, -3, -2]} color="#ec4899" />
        <Torus position={[6, 1, -3]} color="#f472b6" />
        
        {/* DNA Helix */}
        <DNA />
        
        {/* Icosahedrons */}
        <Icosahedron position={[-6, 0, -2]} />
        <Icosahedron position={[3, 4, -4]} />
        
        {/* Particle system */}
        <Particles />
        
        {/* Controls for interaction */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
