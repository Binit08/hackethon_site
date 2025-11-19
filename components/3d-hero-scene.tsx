'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, OrbitControls, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

// Fallback component
function Loader() {
  return null
}

// Animated particle field
function ParticleField() {
  const ref = useRef<THREE.Points>(null!)
  
  const particlesCount = 3000
  const positions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  }, [particlesCount])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10
      ref.current.rotation.y -= delta / 15
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#8b5cf6"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
    </group>
  )
}

// Morphing blob
function AnimatedBlob({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    meshRef.current.rotation.x = time / 4
    meshRef.current.rotation.y = time / 3
    meshRef.current.position.y = position[1] + Math.sin(time) * 0.5
  })

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.5}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  )
}

// DNA helix structure
function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
  })

  const helixPoints = useMemo(() => {
    const points = []
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 8
      const radius = 2
      const x = Math.cos(angle) * radius
      const y = (i / 100) * 8 - 4
      const z = Math.sin(angle) * radius
      points.push(new THREE.Vector3(x, y, z))
    }
    return points
  }, [])

  return (
    <group ref={groupRef}>
      {helixPoints.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#ec4899' : '#8b5cf6'} emissive={i % 2 === 0 ? '#ec4899' : '#8b5cf6'} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// Ring of rotating cubes
function RotatingCubes() {
  const groupRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.5
  })

  const cubes = useMemo(() => {
    const positions = []
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const radius = 3
      positions.push([
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.5,
        Math.sin(angle) * radius
      ])
    }
    return positions
  }, [])

  return (
    <group ref={groupRef}>
      {cubes.map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#06b6d4" wireframe />
        </mesh>
      ))}
    </group>
  )
}

export default function HeroScene3D() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} color="#ec4899" intensity={0.5} />
          <pointLight position={[0, 0, 10]} color="#8b5cf6" intensity={0.5} />
          
          <ParticleField />
          <AnimatedBlob position={[-3, 1, -2]} color="#8b5cf6" />
          <AnimatedBlob position={[3, -1, -3]} color="#ec4899" />
          <AnimatedBlob position={[0, 0, -4]} color="#06b6d4" />
          <DNAHelix />
          <RotatingCubes />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
