import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Seeded RNG
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

// Single floating crystal shard
function CrystalShard({
  position,
  scale,
  color,
  speed,
  phase,
}: {
  position: [number, number, number]
  scale: number
  color: string
  speed: number
  phase: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.rotation.y = t * speed * 0.4 + phase
    meshRef.current.rotation.x = Math.sin(t * speed * 0.3 + phase) * 0.2
    meshRef.current.position.y = position[1] + Math.sin(t * speed * 0.5 + phase) * 0.12
  })

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.25,
    transmission: 0.72,
    roughness: 0.08,
    metalness: 0.0,
    ior: 1.75,
    thickness: 3.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    flatShading: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  }), [color])

  const geo = useMemo(() => new THREE.OctahedronGeometry(1, 0), [])

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      geometry={geo}
      material={mat}
    />
  )
}

// Cluster of small shards around a point
function CrystalCluster({ cx, cy, cz, seed }: { cx: number; cy: number; cz: number; seed: number }) {
  const r = useMemo(() => rng(seed), [seed])
  const shards = useMemo(() => {
    const ro = rng(seed)
    const colors = ['#FF6FAE', '#FF8FC4', '#FFB8D8', '#A875FF', '#C98CFF', '#6278C8']
    return Array.from({ length: 5 }, (_, i) => ({
      position: [
        cx + (ro() - 0.5) * 2.2,
        cy + (ro() - 0.5) * 2.2,
        cz + (ro() - 0.5) * 2.2,
      ] as [number, number, number],
      scale: 0.12 + ro() * 0.35,
      color: colors[Math.floor(ro() * colors.length)],
      speed: 0.3 + ro() * 0.7,
      phase: ro() * Math.PI * 2,
    }))
  }, [cx, cy, cz, seed])

  return (
    <>
      {shards.map((s, i) => <CrystalShard key={i} {...s} />)}
    </>
  )
}

// Full ambient crystal background
export function Background3D() {
  // Generate cluster positions that span the full scrollable scene
  const clusters = useMemo(() => {
    const r = rng(777)
    return Array.from({ length: 40 }, (_, i) => ({
      cx: (r() - 0.5) * 28,
      cy: (r() - 0.5) * 60,  // Tall range for scroll parallax
      cz: -2 - r() * 14,
      seed: i * 17 + 3,
    }))
  }, [])

  // Large hero crystals
  const heroShards = useMemo(() => {
    const colors = ['#FF4E9A', '#FF6FAE', '#A875FF', '#C98CFF', '#FF8FC4']
    const r = rng(42)
    return Array.from({ length: 8 }, (_, i) => ({
      position: [4 + r() * 8, -2 + r() * 4, -3 - r() * 6] as [number, number, number],
      scale: 0.5 + r() * 1.0,
      color: colors[i % colors.length],
      speed: 0.2 + r() * 0.3,
      phase: r() * Math.PI * 2,
    }))
  }, [])

  // Scroll-driven camera ref
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const scrollY = window.scrollY || 0
    const maxScroll = document.body.scrollHeight - window.innerHeight
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0
    // Move the entire scene as user scrolls
    groupRef.current.position.y = progress * 45
  })

  return (
    <group ref={groupRef}>
      {/* Ambient point lights */}
      <pointLight position={[5, 2, -4]}  color="#FF6FAE" intensity={80} distance={20} decay={2} />
      <pointLight position={[-5, -2, -6]} color="#A875FF" intensity={60} distance={18} decay={2} />
      <pointLight position={[0, 5, -3]}  color="#FF8FC4" intensity={50} distance={16} decay={2} />

      {/* Hero large shards */}
      {heroShards.map((s, i) => <CrystalShard key={`hero-${i}`} {...s} />)}

      {/* Ambient clusters spread throughout scene */}
      {clusters.map((c, i) => <CrystalCluster key={`cluster-${i}`} {...c} />)}
    </group>
  )
}
