import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

// ── Studio Lighting ────────────────────────────────────────────────────────────
function StudioLights() {
  return (
    <>
      {/* Large soft white key — top-left */}
      <directionalLight position={[-6, 8, 4]} intensity={2.8} color="#FFF0F5" />
      {/* Strong pink rim — right, slight behind */}
      <directionalLight position={[6, 2, -3]} intensity={2.8} color="#F05A9B" />
      {/* Warm rose-gold secondary */}
      <directionalLight position={[3, 6, 2]} intensity={1.4} color="#E8A080" />
      {/* Lavender fill — bottom-left */}
      <directionalLight position={[-4, -4, 6]} intensity={1.0} color="#B8A0D8" />
      {/* Subtle blush from below */}
      <pointLight position={[0, -3, 2]} intensity={0.8} color="#F05A9B" distance={8} />
      <ambientLight intensity={0.22} color="#1A1020" />
    </>
  )
}

// ── Material factories ─────────────────────────────────────────────────────────
function brushedMetal(color = '#B8A0B0') {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.92,
    roughness: 0.28,
  })
}

function roseGoldMat() {
  return new THREE.MeshStandardMaterial({
    color: '#C8856A',
    metalness: 0.88,
    roughness: 0.22,
  })
}

function chromeMat(color = '#D8CCD8') {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 1.0,
    roughness: 0.06,
  })
}

function matteMat(color = '#1A141E') {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.1,
    roughness: 0.85,
  })
}

function glassMat() {
  return new THREE.MeshPhysicalMaterial({
    color: '#E0C8D8',
    metalness: 0.0,
    roughness: 0.04,
    transmission: 0.90,
    ior: 1.5,
    thickness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.96,
    side: THREE.DoubleSide,
  })
}

function pinkEmissiveMat() {
  return new THREE.MeshStandardMaterial({
    color: '#FF76B5',
    emissive: '#F05A9B',
    emissiveIntensity: 1.2,
    metalness: 0.2,
    roughness: 0.3,
  })
}

function roseEmissiveMat() {
  return new THREE.MeshStandardMaterial({
    color: '#E8789A',
    emissive: '#D94B8B',
    emissiveIntensity: 0.5,
    metalness: 0.4,
    roughness: 0.45,
  })
}

// ── Wireframe ring helper ───────────────────────────────────────────────────────
function WireframeRing({ radius, tube }: { radius: number; tube: number }) {
  const geo = useMemo(() => {
    const g = new THREE.TorusGeometry(radius, tube, 3, 80)
    return new THREE.EdgesGeometry(g)
  }, [radius, tube])
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: '#9B8AA8', transparent: true, opacity: 0.55 }), [])
  return <lineSegments args={[geo, mat]} />
}

// ── Main sculpture ─────────────────────────────────────────────────────────────
export function Sculpture3D() {
  const groupRef = useRef<THREE.Group>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0 })

  // Materials
  const mats = useMemo(() => ({
    ring:   roseGoldMat(),          // main ring — rose gold
    glass:  glassMat(),
    matte:  matteMat('#12101A'),
    chrome: chromeMat('#E0C8D8'),   // warm chrome with rose tint
    pink:   pinkEmissiveMat(),
    roseE:  roseEmissiveMat(),
    panel1: brushedMetal('#9890A8'),
    panel2: matteMat('#1C1420'),
  }), [])

  // Track mouse
  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Damped mouse tracking
    smooth.current.x += (mouse.current.x - smooth.current.x) * 0.04
    smooth.current.y += (mouse.current.y - smooth.current.y) * 0.04

    if (groupRef.current) {
      // Slow base rotation + mouse influence
      groupRef.current.rotation.y = t * 0.06 + smooth.current.x * 0.22
      groupRef.current.rotation.x = smooth.current.y * 0.14
    }
  })

  return (
    <group ref={groupRef}>
      <StudioLights />

      {/* ── Large torus ring — rose gold */}
      <mesh material={mats.ring} rotation={[Math.PI * 0.12, 0, Math.PI * 0.05]}>
        <torusGeometry args={[1.55, 0.055, 16, 100]} />
      </mesh>

      {/* ── Inner torus — warm chrome */}
      <mesh material={mats.chrome} rotation={[Math.PI * 0.5, Math.PI * 0.25, 0]}>
        <torusGeometry args={[0.95, 0.025, 12, 80]} />
      </mesh>

      {/* ── Tall glass slab (vertical panel) — blush-tinted glass */}
      <mesh position={[0.1, 0, -0.15]} material={mats.glass}>
        <boxGeometry args={[0.95, 2.4, 0.06]} />
      </mesh>

      {/* ── Second glass slab (rotated horizontal) */}
      <mesh position={[-0.4, -0.5, 0.3]} rotation={[0, Math.PI * 0.15, 0]} material={mats.glass}>
        <boxGeometry args={[1.6, 0.055, 0.85]} />
      </mesh>

      {/* ── Matte dark block */}
      <mesh position={[0.65, -0.7, 0.1]} material={mats.matte}>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
      </mesh>

      {/* ── Chrome sphere (warm rose-tinted) */}
      <mesh position={[-0.7, 0.6, 0.35]} material={mats.chrome}>
        <sphereGeometry args={[0.18, 32, 32]} />
      </mesh>

      {/* ── Brushed panel */}
      <mesh position={[-0.85, -0.3, -0.1]} rotation={[0, 0.3, 0.15]} material={mats.panel1}>
        <boxGeometry args={[0.55, 1.1, 0.04]} />
      </mesh>

      {/* ── Pink emissive accent strip — brighter */}
      <mesh position={[0.0, 0.95, 0.1]} material={mats.pink}>
        <boxGeometry args={[0.9, 0.022, 0.022]} />
      </mesh>

      {/* ── Rose emissive accent strip — second */}
      <mesh position={[0.0, -0.92, 0.1]} material={mats.roseE}>
        <boxGeometry args={[0.7, 0.016, 0.016]} />
      </mesh>

      {/* ── Pink emissive sphere */}
      <mesh position={[0.7, 0.35, 0.4]} material={mats.pink}>
        <sphereGeometry args={[0.06, 16, 16]} />
      </mesh>

      {/* ── Second pink accent sphere */}
      <mesh position={[-0.55, -0.6, 0.55]} material={mats.roseE}>
        <sphereGeometry args={[0.04, 16, 16]} />
      </mesh>

      {/* ── Wireframe large torus */}
      <group rotation={[Math.PI * 0.3, 0, Math.PI * 0.1]}>
        <WireframeRing radius={1.9} tube={0.001} />
      </group>

      {/* ── Thin cross-bar structure */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI * 0.5]} material={mats.panel2}>
        <boxGeometry args={[2.8, 0.012, 0.012]} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI * 0.5, 0, 0]} material={mats.panel2}>
        <boxGeometry args={[0.012, 2.8, 0.012]} />
      </mesh>
    </group>
  )
}
