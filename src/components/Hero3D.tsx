
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Icosahedron, Stars, Torus } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
    if (torusRef.current) {
        torusRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
        torusRef.current.rotation.y = state.clock.getElapsedTime() * -0.1;
    }
    if (sphereRef.current) {
         // Orbital movement
         const t = state.clock.getElapsedTime();
         sphereRef.current.position.x = Math.sin(t * 0.5) * 3.5;
         sphereRef.current.position.z = Math.cos(t * 0.5) * 3.5;
         sphereRef.current.position.y = Math.sin(t * 0.8) * 1.5;
    }
  });

  return (
    <group>
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Icosahedron args={[1.6, 0]} ref={meshRef}>
                <MeshDistortMaterial
                color="#0d9488" // Teal-600
                envMapIntensity={0.6}
                clearcoat={1}
                clearcoatRoughness={0}
                metalness={0.2}
                roughness={0.1}
                distort={0.35}
                speed={1.5}
                />
            </Icosahedron>
        </Float>
        
        <Float speed={1.5} rotationIntensity={2} floatIntensity={0.5}>
            <Torus args={[2.8, 0.04, 16, 100]} ref={torusRef} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#5eead4" emissive="#0f766e" emissiveIntensity={2} roughness={0} metalness={1} wireframe />
            </Torus>
        </Float>

        <mesh ref={sphereRef}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </mesh>
    </group>
  );
};

const DataPoint = ({ position, color, delay }: { position: [number, number, number], color: string, delay: number }) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if(ref.current) {
            const t = state.clock.getElapsedTime();
            ref.current.position.y += Math.sin(t + delay) * 0.002;
            ref.current.rotation.x += 0.01;
            ref.current.rotation.y += 0.01;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1} position={position}>
            <mesh ref={ref}>
                <octahedronGeometry args={[0.15]} />
                <meshStandardMaterial color={color} transparent opacity={0.6} wireframe />
            </mesh>
        </Float>
    );
};

export const Hero3D = () => {
  return (
    <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#14b8a6" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
            <spotLight position={[0, 10, 0]} intensity={1} angle={0.5} penumbra={1} color="#ffffff" />
            
            <AnimatedShape />
            
            {/* Floating "Data" Particles */}
            <DataPoint position={[-3, 2, -2]} color="#ffffff" delay={0} />
            <DataPoint position={[3.5, -1.5, -1]} color="#2dd4bf" delay={1} />
            <DataPoint position={[-2.5, -3, 1]} color="#99f6e4" delay={2} />
            <DataPoint position={[2.5, 3, 0]} color="#ffffff" delay={3} />
            <DataPoint position={[4, 1, -3]} color="#0d9488" delay={4} />

            <Stars radius={80} depth={60} count={3000} factor={4} saturation={0} fade speed={0.5} />
            <fog attach="fog" args={['#0f172a', 5, 20]} />
        </Canvas>
    </div>
  );
};
