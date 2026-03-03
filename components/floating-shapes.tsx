"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment, ContactShadows } from "@react-three/drei"
import * as THREE from "three"
import { useTheme } from "next-themes"

function Shape({ type, position, color, floatIntensity = 1, rotationIntensity = 1 }: any) {
    const mesh = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x = Math.sin(state.clock.elapsedTime / 4) * 0.5 * rotationIntensity
            mesh.current.rotation.y = Math.cos(state.clock.elapsedTime / 4) * 0.5 * rotationIntensity
        }
    })

    // Basic geometries
    let geometry;
    switch (type) {
        case 'box': geometry = <boxGeometry args={[1, 1, 1]} />; break;
        case 'sphere': geometry = <sphereGeometry args={[0.7, 32, 32]} />; break;
        case 'torus': geometry = <torusGeometry args={[0.6, 0.2, 16, 100]} />; break;
        case 'cone': geometry = <coneGeometry args={[0.8, 1.5, 32]} />; break;
        case 'octahedron': geometry = <octahedronGeometry args={[0.8]} />; break;
        case 'icosahedron': geometry = <icosahedronGeometry args={[0.8]} />; break;
        default: geometry = <boxGeometry args={[1, 1, 1]} />;
    }

    return (
        <Float
            speed={2}
            rotationIntensity={rotationIntensity}
            floatIntensity={floatIntensity}
            position={position}
        >
            <mesh ref={mesh} castShadow receiveShadow>
                {geometry}
                <meshPhysicalMaterial
                    color={color}
                    roughness={0.1}
                    metalness={0.8}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    transmission={0.4}
                    thickness={1.5}
                />
            </mesh>
        </Float>
    )
}

export function FloatingShapes() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null // Prevent hydration mismatch

    const isDark = theme === "dark" || !theme // Default to dark aesthetic if unresolved

    return (
        <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none opacity-50 dark:opacity-80 transition-opacity duration-1000">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 2]}>
                <ambientLight intensity={isDark ? 0.3 : 1.2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow={false} />
                <pointLight position={[-10, -10, -10]} intensity={isDark ? 0.8 : 2} color={isDark ? "#ffffff" : "#0ea5e9"} />

                {/* Primary Color Shape - Nexus Blue */}
                <Shape type="icosahedron" position={[-4, 1.5, -3]} color="#0ea5e9" floatIntensity={2} rotationIntensity={1.5} />

                {/* Accent Color Shape - Violet */}
                <Shape type="torus" position={[4.5, -1.5, -4]} color="#8b5cf6" floatIntensity={1.5} rotationIntensity={2} />

                {/* Secondary Shape - Emerald */}
                <Shape type="octahedron" position={[-2, -3.5, -5]} color="#10b981" floatIntensity={1.2} />

                {/* Background far shape - Pink */}
                <Shape type="sphere" position={[5, 3, -7]} color="#ec4899" floatIntensity={0.8} rotationIntensity={0.5} />

                <Environment preset="city" />
            </Canvas>
        </div>
    )
}
