import React, { useState, useEffect } from 'react'
import '../styles/Navigation.css'

const navItems = [
  { num: '01', label: 'ABOUT',   id: 'about'   },
  { num: '02', label: 'WORK',    id: 'work'    },
  { num: '03', label: 'SKILLS',  id: 'skills'  },
  { num: '04', label: 'CONTACT', id: 'contact' },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80)
      const ids = navItems.map(n => document.getElementById(n.id))
      const found = ids.find(el => {
        if (!el) return false
        const { top, bottom } = el.getBoundingClientRect()
        return top <= 100 && bottom > 100
      })
      setActive(found?.id ?? '')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`} role="navigation">
      <button
        className="nav-wordmark"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        SAMRUDDHI.
      </button>

      <ul className="nav-items" role="list">
        {navItems.map(item => (
          <li key={item.id}>
            <button
              className={`nav-item${active === item.id ? ' nav-item--active' : ''}`}
              onClick={() => scrollTo(item.id)}
            >
              <span className="nav-num">{item.num}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
