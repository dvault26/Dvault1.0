import React from 'react'
import { Link } from 'react-router-dom'
import logoSrc from '../assets/dvault-logo.svg'

export default function Splash() {
  return (
    <div className="centered">
      <div style={{ textAlign: 'center' }}>
        <img src={logoSrc} className="splash-logo-img gold-glow" alt="Dvault" />
        <h2 className="brand-heading" style={{ marginTop: 18 }}>Dvault</h2>
        <p className="muted">Secure cold wallet & encrypted vault</p>
        <div style={{ marginTop: 28 }}>
          <Link to="/register"><button className="button">Open Vault</button></Link>
        </div>
      </div>
    </div>
  )
}
