import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoSrc from '../assets/dvault-logo.svg'

export default function Sidebar(){
  const loc = useLocation()
  return (
    <aside className="sidebar">
      <img src={logoSrc} alt="Dvault" className="dvault-logo gold-glow" title="Dvault" />
      <nav style={{marginTop:12}}>
        <Link className="nav-item" to="/dashboard">🏠</Link>
        <Link className="nav-item" to="/wallet">💼</Link>
        <Link className="nav-item" to="/vault/docs">📁</Link>
        <Link className="nav-item" to="/vault/bank">🏦</Link>
        <Link className="nav-item" to="/settings">⚙️</Link>
      </nav>
    </aside>
  )
}
