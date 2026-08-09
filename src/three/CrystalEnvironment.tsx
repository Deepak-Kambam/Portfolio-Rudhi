import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Crystal Geometry Factory ───────────────────────────────────────────────
// Creates a multi-segment faceted mineral body with irregular perturbation
function makeCrystalGeo(baseRadius: number, topRadius: number, height: number, segments = 7) {
  const geo = new THREE.CylinderGeometry(topRadius, baseRadius, height, segments, 4, false)
  const pos = geo.attributes.position
  const count = pos.count

  for (let i = 0; i < count; i++) {
    const y = pos.getY(i)
    const ny = (y + height * 0.5) / height // 0..1 from bottom to top

    // Vary by vertical position — more perturbation in mid-section
    const perturbStr = Math.sin(ny * Math.PI) * 0.35 + 0.1
    const px = pos.getX(i) + (Math.random() - 0.5) * baseRadius * perturbStr * 2
    const pz = pos.getZ(i) + (Math.random() - 0.5) * baseRadius * perturbStr * 2
    // Slight Y jitter for faceted look
    const py = y + (Math.random() - 0.5) * height * 0.05

    pos.setXYZ(i, px, py, pz)
  }
  geo.computeVertexNormals()
  return geo
}

// ─── PBR Crystal Material Factory ────────────────────────────────────────────
function makeCrystalMat(params: {
  color: THREE.ColorRepresentation
  emissive?: THREE.ColorRepresentation
  emissiveIntensity?: number
  transmission?: number
  roughness?: number
  ior?: number
  thickness?: number
  metalness?: number
  clearcoat?: number
}) {
  return new THREE.MeshPhysicalMaterial({
    color: params.color,
    emissive: params.emissive ?? params.color,
    emissiveIntensity: params.emissiveIntensity ?? 0.18,
    transmission: params.transmission ?? 0.65,
    roughness: params.roughness ?? 0.12,
    metalness: params.metalness ?? 0.05,
    ior: params.ior ?? 1.72,
    thickness: params.thickness ?? 8.0,
    clearcoat: params.clearcoat ?? 1.0,
    clearcoatRoughness: 0.08,
    flatShading: true,
    side: THREE.DoubleSide,
  })
}

// ─── Rock Material Factory ───────────────────────────────────────────────────
function makeRockMat(color: THREE.ColorRepresentation) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true,
  })
}

// Pre-seeded random to avoid hydration drift
function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ─── GLB Loader with fallback ────────────────────────────────────────────────
function GLBEnvironment() {
  // Attempt to preload — if it errors R3F will throw and the Suspense fallback runs
  const { scene } = useGLTF('/models/crystal-cave.glb')
  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [scene])
  return <primitive object={scene} />
}

// ─── Procedural Fallback ──────────────────────────────────────────────────────
function FallbackScene() {
  const rng = useMemo(() => seededRng(42), [])

  // All geometries created once, never regenerated
  const geos = useMemo(() => {
    const r = seededRng(42)
    return {
      // Hero formation: tall dominant crystal
      heroA: makeCrystalGeo(0.72, 0.06, 5.8, 7),
      heroB: makeCrystalGeo(0.55, 0.04, 4.5, 6),
      heroC: makeCrystalGeo(0.42, 0.04, 3.6, 5),
      heroD: makeCrystalGeo(0.35, 0.03, 3.0, 6),

      // Mid cluster
      midA: makeCrystalGeo(0.38, 0.03, 2.8, 6),
      midB: makeCrystalGeo(0.28, 0.02, 2.2, 5),
      midC: makeCrystalGeo(0.22, 0.02, 1.8, 6),
      midD: makeCrystalGeo(0.18, 0.02, 1.4, 5),
      midE: makeCrystalGeo(0.26, 0.03, 2.0, 7),

      // Foreground large chunks
      fgA: makeCrystalGeo(0.6, 0.05, 4.2, 7),
      fgB: makeCrystalGeo(0.45, 0.04, 3.5, 6),
      fgC: makeCrystalGeo(0.32, 0.03, 2.8, 5),

      // Small scatter
      sm: Array.from({ length: 18 }, (_, i) => makeCrystalGeo(
        0.08 + seededRng(i * 7 + 1)() * 0.14,
        0.01,
        0.4 + seededRng(i * 3 + 2)() * 0.7,
        5
      )),

      // Rock formations (cave walls + ceiling)
      rock: Array.from({ length: 22 }, (_, i) => {
        const g = new THREE.DodecahedronGeometry(0.9 + seededRng(i * 11 + 3)() * 2.5, 0)
        const p = g.attributes.position
        for (let j = 0; j < p.count; j++) {
          p.setXYZ(
            j,
            p.getX(j) * (0.8 + seededRng(j + i)() * 0.6),
            p.getY(j) * (0.9 + seededRng(j + i + 1)() * 0.7),
            p.getZ(j) * (0.7 + seededRng(j + i + 2)() * 0.8),
          )
        }
        g.computeVertexNormals()
        return g
      }),

      // Wet ground
      ground: (() => {
        const g = new THREE.PlaneGeometry(40, 28, 32, 32)
        const p = g.attributes.position
        for (let i = 0; i < p.count; i++) {
          p.setZ(i, p.getZ(i) + (seededRng(i)() - 0.5) * 0.18)
        }
        g.computeVertexNormals()
        return g
      })(),
    }
  }, [])

  // Materials
  const mats = useMemo(() => {
    const r = seededRng(99)
    return {
      heroA: makeCrystalMat({ color: '#FF8FC4', emissive: '#FF6FAE', emissiveIntensity: 0.22, transmission: 0.70, roughness: 0.08, ior: 1.80, thickness: 10 }),
      heroB: makeCrystalMat({ color: '#E876B0', emissive: '#C84090', emissiveIntensity: 0.15, transmission: 0.60, roughness: 0.12, ior: 1.72, thickness: 8 }),
      heroC: makeCrystalMat({ color: '#FFB8D8', emissive: '#FF8FC4', emissiveIntensity: 0.20, transmission: 0.75, roughness: 0.10, ior: 1.68, thickness: 6 }),
      heroD: makeCrystalMat({ color: '#C98CFF', emissive: '#A875FF', emissiveIntensity: 0.18, transmission: 0.55, roughness: 0.15, ior: 1.65, thickness: 7 }),

      midA: makeCrystalMat({ color: '#D96AB0', emissive: '#B0408A', emissiveIntensity: 0.12, transmission: 0.58, roughness: 0.14, thickness: 6 }),
      midB: makeCrystalMat({ color: '#FF6FAE', emissive: '#CC4490', emissiveIntensity: 0.20, transmission: 0.70, roughness: 0.09, thickness: 5 }),
      midC: makeCrystalMat({ color: '#F5D9FF', emissive: '#DDB0FF', emissiveIntensity: 0.14, transmission: 0.80, roughness: 0.07, ior: 1.60, thickness: 4 }),
      midD: makeCrystalMat({ color: '#A875FF', emissive: '#8050D0', emissiveIntensity: 0.16, transmission: 0.60, roughness: 0.12, thickness: 4 }),
      midE: makeCrystalMat({ color: '#FF8FC4', emissive: '#FF6FAE', emissiveIntensity: 0.18, transmission: 0.68, roughness: 0.10, thickness: 5 }),

      fgA: makeCrystalMat({ color: '#9C3070', emissive: '#7A2060', emissiveIntensity: 0.10, transmission: 0.45, roughness: 0.20, thickness: 12 }),
      fgB: makeCrystalMat({ color: '#C84090', emissive: '#AA2878', emissiveIntensity: 0.12, transmission: 0.52, roughness: 0.18, thickness: 10 }),
      fgC: makeCrystalMat({ color: '#E876B0', emissive: '#CC4490', emissiveIntensity: 0.15, transmission: 0.60, roughness: 0.14, thickness: 8 }),

      sm: Array.from({ length: 18 }, (_, i) => makeCrystalMat({
        color: ['#FF6FAE', '#FF8FC4', '#FFB8D8', '#C98CFF', '#A875FF', '#F5D9FF'][i % 6] as THREE.ColorRepresentation,
        emissiveIntensity: 0.10 + seededRng(i * 5)() * 0.12,
        transmission: 0.50 + seededRng(i * 7)() * 0.35,
        roughness: 0.08 + seededRng(i * 3)() * 0.18,
        thickness: 2 + seededRng(i)() * 5,
      })),

      rock: makeRockMat('#0D0B1E'),
      rockLight: makeRockMat('#151225'),
      ground: new THREE.MeshPhysicalMaterial({
        color: '#070510',
        roughness: 0.18,
        metalness: 0.6,
        clearcoat: 1.0,
        clearcoatRoughness: 0.25,
        flatShading: false,
      }),
    }
  }, [])

  const rockRng = useMemo(() => seededRng(77), [])
  const smRng = useMemo(() => seededRng(55), [])

  // Rock positions (deterministic)
  const rockPositions = useMemo(() => {
    const r = seededRng(77)
    return Array.from({ length: 22 }, (_, i) => {
      const isTop = i < 10
      const isSide = !isTop && i < 16

      const x = isTop
        ? (r() * 22 - 3)       // span full width top
        : isSide
          ? (8 + r() * 16)     // right wall
          : (r() * 28 - 4)     // back wall

      const y = isTop
        ? (5 + r() * 6)        // ceiling
        : isSide
          ? (r() * 6 - 2)      // mid-wall
          : (-3 - r() * 4)     // floor level

      const z = isTop
        ? (-8 - r() * 18)
        : isSide
          ? (-4 - r() * 16)
          : (-14 - r() * 10)

      return {
        pos: [x, y, z] as [number, number, number],
        rot: [r() * Math.PI, r() * Math.PI * 2, r() * Math.PI * 0.5] as [number, number, number],
        scale: 0.7 + r() * 1.4,
        light: i % 3 === 0,
      }
    })
  }, [])

  // Small crystal scatter positions (deterministic)
  const smPositions = useMemo(() => {
    const r = seededRng(55)
    return Array.from({ length: 18 }, (_, i) => ({
      pos: [
        4 + r() * 18,
        -3.0 + r() * 0.4,
        -1 - r() * 20,
      ] as [number, number, number],
      rot: [
        (r() - 0.5) * 0.5,
        r() * Math.PI * 2,
        (r() - 0.5) * 0.7,
      ] as [number, number, number],
    }))
  }, [])

  return (
    <group>
      {/* ── GROUND ── */}
      <mesh
        geometry={geos.ground}
        material={mats.ground}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[6, -3.2, -8]}
        receiveShadow
      />

      {/* ── CAVE ROCK FORMATIONS ── */}
      {rockPositions.map((r, i) => (
        <mesh
          key={`rock-${i}`}
          geometry={geos.rock[i]}
          material={r.light ? mats.rockLight : mats.rock}
          position={r.pos}
          rotation={r.rot}
          scale={r.scale}
        />
      ))}

      {/* ── SMALL CRYSTAL SCATTER ── */}
      {smPositions.map((s, i) => (
        <mesh
          key={`sm-${i}`}
          geometry={geos.sm[i]}
          material={mats.sm[i]}
          position={s.pos}
          rotation={s.rot}
          castShadow
        />
      ))}

      {/* ── MIDGROUND CRYSTAL CLUSTER ── */}
      <group position={[4, -3, -12]}>
        <mesh geometry={geos.midA} material={mats.midA} position={[0, 1.4, 0]} rotation={[0.05, 0.3, -0.12]} castShadow />
        <mesh geometry={geos.midB} material={mats.midB} position={[0.9, 1.1, 0.3]} rotation={[-0.08, -0.4, 0.15]} castShadow />
        <mesh geometry={geos.midC} material={mats.midC} position={[-0.6, 0.9, -0.2]} rotation={[0.1, 0.6, 0.08]} castShadow />
        <mesh geometry={geos.midD} material={mats.midD} position={[0.4, 0.7, -0.5]} rotation={[0.12, -0.2, 0.2]} castShadow />
        <mesh geometry={geos.midE} material={mats.midE} position={[-0.3, 1.0, 0.4]} rotation={[-0.05, 0.8, -0.1]} castShadow />
      </group>

      {/* ── FOREGROUND CRYSTAL CLUSTER ── */}
      <group position={[10, -3, 0]}>
        <mesh geometry={geos.fgA} material={mats.fgA} position={[0, 2.1, 0]} rotation={[0, 0.2, -0.08]} castShadow />
        <mesh geometry={geos.fgB} material={mats.fgB} position={[1.1, 1.75, 0.4]} rotation={[0.05, -0.35, 0.12]} castShadow />
        <mesh geometry={geos.fgC} material={mats.fgC} position={[-0.8, 1.4, -0.3]} rotation={[-0.07, 0.55, 0.06]} castShadow />
      </group>

      {/* ── HERO CRYSTAL FORMATION (centre-right, dominant) ── */}
      <group position={[7, -3.2, -6]}>
        {/* Dominant spire */}
        <mesh geometry={geos.heroA} material={mats.heroA} position={[0, 2.9, 0]} rotation={[0, 0.15, -0.05]} castShadow />
        {/* Left companion */}
        <mesh geometry={geos.heroB} material={mats.heroB} position={[-1.1, 2.25, 0.3]} rotation={[0.08, -0.4, -0.14]} castShadow />
        {/* Right companion */}
        <mesh geometry={geos.heroC} material={mats.heroC} position={[1.0, 1.8, -0.4]} rotation={[-0.06, 0.5, 0.10]} castShadow />
        {/* Background accent */}
        <mesh geometry={geos.heroD} material={mats.heroD} position={[0.3, 1.5, -0.8]} rotation={[0.05, 0.2, 0.04]} castShadow />
      </group>
    </group>
  )
}

// ─── Lighting Rig ─────────────────────────────────────────────────────────────
function LightingRig() {
  const coreRef = useRef<THREE.PointLight>(null)
  const core2Ref = useRef<THREE.PointLight>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    if (coreRef.current) {
      coreRef.current.intensity = 120 + Math.sin(t.current * 1.4) * 30
    }
    if (core2Ref.current) {
      core2Ref.current.intensity = 80 + Math.sin(t.current * 0.9 + 1.2) * 20
    }
  })

  return (
    <>
      {/* Ambient — cool deep blue */}
      <ambientLight intensity={0.35} color="#0D0B28" />

      {/* Hemisphere — sky/ground */}
      <hemisphereLight intensity={0.55} color="#1A1240" groundColor="#050310" />

      {/* Key from upper right — soft white-pink */}
      <directionalLight
        position={[14, 18, 4]}
        intensity={2.8}
        color="#FFDAF0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Blue atmospheric fill from left */}
      <directionalLight position={[-10, 6, -5]} intensity={0.9} color="#4460B8" />

      {/* Crystal core glow — pink */}
      <pointLight
        ref={coreRef}
        position={[7, 0, -5]}
        color="#FF6FAE"
        intensity={120}
        distance={22}
        decay={2}
      />

      {/* Secondary glow — violet */}
      <pointLight
        ref={core2Ref}
        position={[4, -1, -11]}
        color="#A875FF"
        intensity={80}
        distance={18}
        decay={2}
      />

      {/* Foreground pink rim */}
      <pointLight position={[10, 1, 2]} color="#FF8FC4" intensity={60} distance={12} decay={2} />

      {/* Deep back violet */}
      <pointLight position={[2, 2, -18]} color="#6278C8" intensity={40} distance={20} decay={2} />

      {/* Ground fill */}
      <pointLight position={[6, -2.5, -4]} color="#C84090" intensity={45} distance={10} decay={2} />
    </>
  )
}

// ─── Camera Rig ───────────────────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const camPos = useRef({ x: 0, y: 1.2, z: 16 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)

    // GSAP scroll camera dolly
    const heroEl = document.getElementById('hero')
    if (heroEl) {
      gsap.to(camPos.current, {
        z: 8,
        y: 0.4,
        x: 1.5,
        ease: 'none',
        scrollTrigger: {
          trigger: heroEl,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    }

    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    // Damped mouse tracking
    mouse.current.x += (target.current.x - mouse.current.x) * 0.04
    mouse.current.y += (target.current.y - mouse.current.y) * 0.04

    camera.position.x += (camPos.current.x + mouse.current.x * 0.35 - camera.position.x) * 0.06
    camera.position.y += (camPos.current.y + mouse.current.y * 0.18 - camera.position.y) * 0.06
    camera.position.z += (camPos.current.z - camera.position.z) * 0.06

    camera.rotation.y += (-mouse.current.x * 0.028 - camera.rotation.y) * 0.06
    camera.rotation.x += (mouse.current.y * 0.018 - camera.rotation.x) * 0.06
  })

  return null
}

// ─── Depth Parallax Groups ────────────────────────────────────────────────────
function ParallaxLayer({
  children,
  strength,
}: {
  children: React.ReactNode
  strength: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.x += (target.current.x * strength - groupRef.current.position.x) * 0.05
    groupRef.current.position.y += (target.current.y * strength * 0.5 - groupRef.current.position.y) * 0.05
  })

  return <group ref={groupRef}>{children}</group>
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function CrystalEnvironment() {
  return (
    <>
      <fogExp2 attach="fog" args={['#05040A', 0.038]} />
      <LightingRig />
      <CameraRig />

      {/* Fallback procedural scene — replace with <GLBEnvironment /> once /public/models/crystal-cave.glb exists */}
      <React.Suspense fallback={<FallbackScene />}>
        <FallbackScene />
      </React.Suspense>
    </>
  )
}
