import React, { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { CrystalEnvironment } from '../three/CrystalEnvironment'
import '../styles/Hero.css'

export function Hero() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleExplore = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleConnect = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScrollDown = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="hero">
      {/* ── Full-bleed 3D Canvas ── */}
      <div className="hero-canvas">
        <Canvas
          camera={{ position: [0, 1.2, 16], fov: 52, near: 0.1, far: 200 }}
          dpr={Math.min(window.devicePixelRatio, 1.75)}
          gl={{ antialias: true, alpha: false, toneMapping: 4 /* ACESFilmic */ }}
        >
          <CrystalEnvironment />
        </Canvas>
      </div>

      {/* ── Left text gradient veil ── */}
      <div className="hero-veil" />

      {/* ── Content overlay ── */}
      <div className="hero-content">
        <span className="hero-eyebrow">SOFTWARE DEVELOPMENT ENGINEER</span>

        <h1 className="hero-title">
          Samruddhi
        </h1>

        <p className="hero-desc">
          Building thoughtful software at the intersection<br />
          of engineering and product.
        </p>

        <div className="hero-cta">
          <button className="btn-primary" onClick={handleExplore}>
            EXPLORE MY WORK
          </button>
          <button className="btn-ghost" onClick={handleConnect}>
            LET'S CONNECT
          </button>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <button className="hero-scroll" onClick={handleScrollDown} aria-label="Scroll down">
        <div className="scroll-track">
          <div className="scroll-thumb" />
        </div>
        <span className="scroll-label">SCROLL</span>
      </button>
    </section>
  )
}
