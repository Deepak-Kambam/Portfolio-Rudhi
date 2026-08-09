import React, { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Navigation } from './components/Navigation'
import { Cursor } from './components/Cursor'
import { SmoothScroll } from './components/SmoothScroll'
import { Sculpture3D } from './three/Sculpture3D'
import './styles/Navigation.css'
import './styles/app.css'

gsap.registerPlugin(ScrollTrigger)

// ── Scroll reveal hook ─────────────────────────────────────────────────────────
function useReveal(deps: unknown[] = []) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const targets = ref.current.querySelectorAll('[data-reveal]')
    targets.forEach((el, i) => {
      const delay = parseFloat((el as HTMLElement).dataset.delay ?? '0')
      gsap.fromTo(el,
        { y: 36, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9,
          ease: 'power3.out',
          delay,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      )
    })
  }, deps)
  return ref
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Entrance animation
    const tl = gsap.timeline({ delay: 0.2 })
    tl.fromTo('.hero-tag', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
      .fromTo('.hero-name', { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' }, '-=0.4')
      .fromTo('.hero-desc', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.45')
      .fromTo('.hero-cta', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .fromTo('.hero-scroll', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2')

    // Scroll — canvas fades and rises
    if (canvasRef.current) {
      gsap.to(canvasRef.current, {
        y: -60,
        opacity: 0.4,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })
    }
  }, [])

  return (
    <section className="hero" id="hero">
      {/* Left content */}
      <div className="hero-left">
        <p className="hero-tag label-sm">
          SOFTWARE DEVELOPMENT ENGINEER
          <span className="hero-tag-sep">·</span>
          PRODUCT ENGINEER
        </p>

        <h1 className="hero-name">SAMRUDDHI</h1>

        <p className="hero-desc body-lg">
          I design and engineer digital products —<br />
          from ambiguous ideas to usable systems.
        </p>

        <div className="hero-cta">
          <button
            className="btn-primary"
            onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
          >
            VIEW WORK
          </button>
          <button
            className="btn-text"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            GET IN TOUCH →
          </button>
        </div>
      </div>

      {/* Right 3D canvas */}
      <div className="hero-right" ref={canvasRef}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 42 }}
          dpr={Math.min(window.devicePixelRatio, 1.75)}
          gl={{ antialias: true, alpha: true }}
        >
          <Sculpture3D />
        </Canvas>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll">
        <div className="scroll-line">
          <div className="scroll-progress" />
        </div>
        <span className="label-xs">SCROLL</span>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────────────────────────────────────
function About() {
  const ref = useReveal()

  return (
    <section className="about" id="about" ref={ref as React.RefObject<HTMLElement>}>
      <div className="page-x">
        <div className="section-index" data-reveal>
          <span className="label-xs">ABOUT</span>
          <span className="label-xs text-dim">/ 01</span>
        </div>

        <div className="about-grid">
          <div className="about-headline">
            <h2 className="display-md" data-reveal data-delay="0.1">
              I build software where<br />engineering meets<br />product thinking.
            </h2>
          </div>

          <div className="about-body">
            <p className="body-md" data-reveal data-delay="0.2">
              I'm Samruddhi — a software development engineer and product engineer
              who works across the full spectrum from user research to production deployment.
              I care deeply about the quality of what gets built, not just that something gets shipped.
            </p>
            <p className="body-md" data-reveal data-delay="0.3">
              My background spans complex engineering systems and nuanced product decisions.
              I'm drawn to problems that don't have obvious solutions — the kind where
              good engineering and sharp product instinct both matter.
            </p>

            <div className="about-meta" data-reveal data-delay="0.4">
              <div className="meta-item">
                <span className="label-xs text-dim">ROLE</span>
                <span className="label-sm">Software Development Engineer</span>
              </div>
              <div className="meta-item">
                <span className="label-xs text-dim">FOCUS</span>
                <span className="label-sm">Product Engineering</span>
              </div>
              <div className="meta-item">
                <span className="label-xs text-dim">APPROACH</span>
                <span className="label-sm">Systems + Experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// WORK — Full-width case studies
// ─────────────────────────────────────────────────────────────────────────────
const workItems = [
  {
    num: '01',
    name: 'Product Intelligence Platform',
    desc: 'A comprehensive platform enabling product teams to discover, validate and prioritize features through structured user research workflows and AI-assisted synthesis.',
    role: 'Product Engineering',
    tech: 'React · TypeScript · Node.js · PostgreSQL',
    year: '2024',
    hue: 320,
  },
  {
    num: '02',
    name: 'Collaborative Workspace',
    desc: 'Real-time collaboration suite built on CRDTs, enabling teams to work simultaneously across documents, boards and workflows without conflict or data loss.',
    role: 'Software Engineering',
    tech: 'React · WebSockets · Redis · Go',
    year: '2024',
    hue: 250,
  },
  {
    num: '03',
    name: 'Mobile Commerce System',
    desc: 'End-to-end mobile shopping experience with personalized recommendations, frictionless checkout and live inventory synchronization across warehouses.',
    role: 'Full Stack Engineering',
    tech: 'React Native · GraphQL · Firebase · TypeScript',
    year: '2023',
    hue: 290,
  },
  {
    num: '04',
    name: 'Developer Infrastructure Tool',
    desc: 'CLI and web dashboard that surfaces bottlenecks across engineering pipelines, integrating with CI/CD providers and code quality systems to generate actionable insights.',
    role: 'Tooling · DX Engineering',
    tech: 'Go · React · PostgreSQL · GitHub API',
    year: '2023',
    hue: 200,
  },
  {
    num: '05',
    name: 'Digital Experience Platform',
    desc: 'Composable content delivery platform powering personalized digital experiences at scale, with dynamic rendering and real-time A/B testing.',
    role: 'Platform Engineering',
    tech: 'Next.js · TypeScript · CDN · A/B Testing',
    year: '2022',
    hue: 340,
  },
]

function WorkItem({ item }: { item: typeof workItems[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  const handleEnter = () => {
    if (imgRef.current) gsap.to(imgRef.current, { scale: 1.04, duration: 0.7, ease: 'power2.out' })
  }
  const handleLeave = () => {
    if (imgRef.current) gsap.to(imgRef.current, { scale: 1, duration: 0.7, ease: 'power2.out' })
  }

  return (
    <div
      className="work-item"
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="work-header">
        <span className="label-xs text-dim work-num">{item.num}</span>
        <span className="label-xs text-dim work-year">{item.year}</span>
      </div>

      <h3 className="work-title">{item.name}</h3>

      <div className="work-visual-wrap">
        <div
          className="work-visual"
          ref={imgRef}
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 70% 40%,
                hsl(${item.hue}, 55%, 22%) 0%,
                hsl(${item.hue + 30}, 30%, 12%) 50%,
                hsl(240, 20%, 8%) 100%)
            `,
          }}
        >
          <div className="work-visual-label label-xs">
            {item.name.toUpperCase()}
          </div>
          <div
            className="work-visual-accent"
            style={{ background: `hsl(${item.hue}, 70%, 60%)` }}
          />
        </div>
      </div>

      <div className="work-meta">
        <div className="work-meta-col">
          <span className="label-xs text-dim">ROLE</span>
          <span className="label-sm">{item.role}</span>
        </div>
        <div className="work-meta-col">
          <span className="label-xs text-dim">TECHNOLOGY</span>
          <span className="label-sm">{item.tech}</span>
        </div>
        <p className="work-desc body-sm">{item.desc}</p>
        <button className="btn-link">VIEW CASE STUDY →</button>
      </div>

      <div className="work-rule" />
    </div>
  )
}

function Work() {
  const ref = useReveal()

  return (
    <section className="work" id="work" ref={ref as React.RefObject<HTMLElement>}>
      <div className="page-x">
        <div className="section-index" data-reveal>
          <span className="label-xs">SELECTED WORK</span>
          <span className="label-xs text-dim">/ 02</span>
        </div>
        <h2 className="display-sm" data-reveal data-delay="0.1">Projects</h2>
      </div>

      <div className="work-list">
        {workItems.map(item => <WorkItem key={item.num} item={item} />)}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS — Marquee
// ─────────────────────────────────────────────────────────────────────────────
const skillsList = [
  'TYPESCRIPT', 'JAVASCRIPT', 'REACT', 'NEXT.JS', 'NODE.JS',
  'PYTHON', 'GO', 'GRAPHQL', 'REST APIs', 'REACT NATIVE',
  'POSTGRESQL', 'REDIS', 'DOCKER', 'AWS', 'FIREBASE',
  'SYSTEM DESIGN', 'CI/CD', 'FIGMA', 'PRODUCT STRATEGY', 'A/B TESTING',
]

function Marquee({ children, speed = 40 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const width = ref.current.scrollWidth / 2
    gsap.to(ref.current, {
      x: -width,
      repeat: -1,
      duration: width / speed,
      ease: 'none',
    })
  }, [speed])

  return (
    <div className="marquee-viewport">
      <div className="marquee-track" ref={ref}>
        {children}
        {children}
      </div>
    </div>
  )
}

function Skills() {
  return (
    <section className="skills" id="skills">
      <div className="page-x">
        <div className="section-index">
          <span className="label-xs">SKILLS & TECHNOLOGIES</span>
          <span className="label-xs text-dim">/ 03</span>
        </div>
      </div>

      <div className="skills-marquee">
        <Marquee speed={36}>
          {skillsList.map((s) => (
            <span key={s} className="marquee-item">
              {s} <span className="marquee-dot">·</span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="page-x">
        <div className="skills-categories">
          {[
            { label: 'FRONTEND', items: ['React', 'Next.js', 'TypeScript', 'React Native', 'CSS/SCSS'] },
            { label: 'BACKEND', items: ['Node.js', 'Go', 'Python', 'FastAPI', 'GraphQL'] },
            { label: 'INFRASTRUCTURE', items: ['Docker', 'AWS', 'PostgreSQL', 'Redis', 'Firebase'] },
            { label: 'PRODUCT', items: ['Figma', 'Research', 'Strategy', 'Roadmapping', 'A/B Testing'] },
          ].map(cat => (
            <div key={cat.label} className="skill-col">
              <span className="label-xs text-dim">{cat.label}</span>
              <ul className="skill-list">
                {cat.items.map(item => (
                  <li key={item} className="skill-list-item body-sm">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT — Dramatic ending
// ─────────────────────────────────────────────────────────────────────────────
function Contact() {
  const ref = useReveal()
  const [form, setForm] = useState({ email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section className="contact" id="contact" ref={ref as React.RefObject<HTMLElement>}>
      <div className="page-x">
        <div className="section-index" data-reveal>
          <span className="label-xs">CONTACT</span>
          <span className="label-xs text-dim">/ 04</span>
        </div>

        <h2 className="contact-headline display-lg" data-reveal data-delay="0.1">
          LET'S BUILD<br />
          SOMETHING<br />
          <span className="contact-headline-accent">USEFUL.</span>
        </h2>

        <div className="contact-grid">
          <div className="contact-info" data-reveal data-delay="0.2">
            <p className="body-md">
              Open to product engineering roles, freelance collaboration,
              and interesting conversations about software and product.
            </p>
            <div className="contact-links">
              <a href="mailto:hello@samruddhi.dev" className="contact-link">
                <span className="label-xs text-dim">EMAIL</span>
                <span className="body-md">hello@samruddhi.dev</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                <span className="label-xs text-dim">LINKEDIN</span>
                <span className="body-md">linkedin.com/in/samruddhi</span>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                <span className="label-xs text-dim">GITHUB</span>
                <span className="body-md">github.com/samruddhi</span>
              </a>
            </div>

            <a
              href="mailto:hello@samruddhi.dev"
              className="btn-primary contact-cta"
            >
              START A CONVERSATION →
            </a>
          </div>

          <div className="contact-form-area" data-reveal data-delay="0.3">
            {sent ? (
              <div className="form-success">
                <div className="success-mark">✦</div>
                <p className="body-lg">Message received.</p>
                <p className="body-sm text-muted">I'll respond within 24–48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-field">
                  <label className="label-xs text-dim">YOUR EMAIL</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="label-xs text-dim">MESSAGE</label>
                  <textarea
                    rows={5}
                    placeholder="What are you working on?"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                  SEND MESSAGE
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="page-x footer-inner">
        <div>
          <p className="footer-name label-sm">SAMRUDDHI.</p>
          <p className="label-xs text-dim">Software Development Engineer · Product Engineer</p>
        </div>
        <div className="footer-right">
          <p className="label-xs text-dim">2026</p>
          <button
            className="btn-text footer-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            BACK TO TOP ↑
          </button>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <Cursor />
      <SmoothScroll>
        <Navigation />
        <main>
          <Hero />
          <About />
          <Work />
          <Skills />
          <Contact />
          <Footer />
        </main>
      </SmoothScroll>
    </>
  )
}
