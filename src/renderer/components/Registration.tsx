import React, { useState } from 'react'
import logoSrc from '../assets/dvault-logo.svg'
import { useNavigate } from 'react-router-dom'

export default function Registration(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [license, setLicense] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [bindDevice, setBindDevice] = useState(true)
  const navigate = useNavigate()

  async function submit(e?: React.FormEvent){
    if(e) e.preventDefault()
    if(!name || !email || !license){ setMsg('All fields are required'); return }
    setLoading(true)
    try{
      // compute simple device fingerprint
      const deviceInfo = {
        platform: navigator.platform || null,
        userAgent: navigator.userAgent || null,
        hw: (navigator.hardwareConcurrency || null),
        os: (navigator.userAgent || '').match(/Windows|Mac|Linux|Android|iPhone|iPad/)?.[0] || null
      }
      // @ts-ignore
      const res = await window.dvault.license.verify(name, email, license, bindDevice ? deviceInfo : undefined)
      setLoading(false)
      if(res.ok){
        // persist activation globally so app unlocks on restart
        try{ await window.dvault.settings.save({ activated: true, authCode: res.authCode, owner: { name, email } }) }catch(e){}
        sessionStorage.setItem('dvault:authCode', res.authCode)
        sessionStorage.setItem('dvault:owner', JSON.stringify({ name, email }))
        navigate('/confirm')
      } else {
        // Map common server messages to user-friendly labels
        const m = (res.message || '').toLowerCase()
        if(m.includes('not found') || m.includes('invalid') ) setMsg('Invalid license key')
        else if(m.includes('expired')) setMsg('License expired')
        else if(m.includes('already used') || m.includes('used')) setMsg('License already used')
        else if(m.includes('email') && m.includes('mismatch')) setMsg('Wrong email for this license')
        else if(m.includes('format')) setMsg('License key format invalid')
        else setMsg(res.message || 'Activation failed (server error)')
        const el = document.getElementById('license-field')
        if(el){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake') }
      }
    }catch(e:any){ setLoading(false); const em = (e?.message||'').toLowerCase(); if(em.includes('timeout')||em.includes('failed to fetch')||em.includes('network')) setMsg('Server unreachable'); else setMsg(e?.message || 'Activation error') }
  }

  return (
    <div className="centered">
      <div style={{textAlign:'center',width:520}}>
        <img src={logoSrc} alt="Dvault" className="splash-logo-img gold-glow" />
        <h2 className="brand-heading" style={{marginTop:12}}>Register Dvault</h2>
        <p className="muted">Enter your details and license key to activate. License activation and approval are handled by our registration service.</p>
        <form onSubmit={submit} style={{marginTop:18,display:'grid',gap:8}}>
          <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input id="license-field" placeholder="License key" value={license} onChange={e=>setLicense(e.target.value)} />
          <label style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}><input type="checkbox" checked={bindDevice} onChange={e=>setBindDevice(e.target.checked)} /> Bind this license to this device (recommended)</label>
          {msg && <div style={{marginTop:8,color:'#ff6666'}}>{msg}</div>}
          <div style={{marginTop:8}}>
            <button className="button" type="submit" disabled={loading}>{loading? 'Activating...':'Activate'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
