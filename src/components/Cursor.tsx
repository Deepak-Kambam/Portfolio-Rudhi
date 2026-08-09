import React, { useEffect, useRef, useState } from 'react'
import './Cursor.css'

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState<string | null>(null)
  const pos = useRef({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0 })
  const raf = useRef<number>(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const animate = () => {
      smooth.current.x += (pos.current.x - smooth.current.x) * 0.14
      smooth.current.y += (pos.current.y - smooth.current.y) * 0.14

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${smooth.current.x}px, ${smooth.current.y}px)`
      }
      raf.current = requestAnimationFrame(animate)
    }

    // Hover detection
    const onEnter = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (!el) return
      const canvas = el.closest('canvas')
      const btn = el.closest('button, a, [data-hover]')

      if (canvas) {
        setLabel('EXPLORE')
        ringRef.current?.classList.add('cursor-ring--explore')
      } else if (btn) {
        ringRef.current?.classList.add('cursor-ring--hover')
      }
    }

    const onLeave = () => {
      setLabel(null)
      ringRef.current?.classList.remove('cursor-ring--hover', 'cursor-ring--explore')
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onEnter)
    document.addEventListener('mouseout', onLeave)
    raf.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter)
      document.removeEventListener('mouseout', onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring">
        {label && <span className="cursor-label">{label}</span>}
      </div>
    </>
  )
}
