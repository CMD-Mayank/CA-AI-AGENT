
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Icosahedron, Stars, Torus } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
    if (torusRef.current) {
        torusRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
        torusRef.current.rotation.y = state.clock.getElapsedTime() * -0.1;
    }
  });

  return (
    <group>
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Icosahedron args={[1.5, 0]} ref={meshRef}>
                <MeshDistortMaterial
                color="#0d9488" // Teal-600
                envMapIntensity={0.4}
                clearcoat={1}
                clearcoatRoughness={0}
                metalness={0.1}
                distort={0.4}
                speed={2}
                />
            </Icosahedron>
        </Float>
        
        <Float speed={1.5} rotationIntensity={2} floatIntensity={0.5}>
            <Torus args={[2.8, 0.05, 16, 100]} ref={torusRef} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#2dd4bf" emissive="#0f766e" emissiveIntensity={0.5} roughness={0} metalness={1} />
            </Torus>
        </Float>
    </group>
  );
};

const DataPoint = ({ position, color }: { position: [number, number, number], color: string }) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if(ref.current) {
            ref.current.scale.x = ref.current.scale.y = ref.current.scale.z = 1 + Math.sin(state.clock.getElapsedTime() * 2 + position[0]) * 0.2;
        }
    });

    return (
        <Float speed={3} rotationIntensity={2} floatIntensity={2} position={position}>
            <mesh ref={ref}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial color={color} transparent opacity={0.8} />
            </mesh>
        </Float>
    );
};

export const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#14b8a6" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2563eb" />
            
            <AnimatedShape />
            
            {/* Floating Data Points */}
            <DataPoint position={[-3, 2, -2]} color="#ffffff" />
            <DataPoint position={[3, -2, -1]} color="#2dd4bf" />
            <DataPoint position={[-2, -3, 1]} color="#99f6e4" />
            <DataPoint position={[2, 3, 0]} color="#ffffff" />
            <DataPoint position={[4, 0, -3]} color="#0d9488" />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Canvas>
    </div>
  );
};