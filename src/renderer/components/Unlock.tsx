import React, { useState, useEffect } from 'react'
import VaultWheel from './VaultWheel'
import logoSrc from '../assets/dvault-logo.svg'

export default function Unlock(){
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'idle'|'failed'|'success'>('idle')
  const [typing, setTyping] = useState(false)

  useEffect(()=>{
    setTyping(pin.length>0)
  },[pin])

  async function submitPin(){
    try{
      // @ts-ignore
      const ok = await window.dvault.signer.verifyPIN(pin)
      if(ok){
        setStatus('success')
        // optional unlock sound
        try{ const a = new Audio('/assets/sounds/unlock.mp3'); a.play().catch(()=>{}) }catch(e){}
      } else {
        setStatus('failed')
      }
    }catch(e){
      setStatus('failed')
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>){
    if(e.key === 'Enter') submitPin()
  }

  function onUnlocked(){
    window.location.href = '#/dashboard'
  }

  return (
    <div className="centered">
      <div style={{textAlign:'center'}}>
        <img src={logoSrc} alt="Dvault" className="dvault-logo logo-small gold-glow top-center" />
        <h3 className="brand-heading" style={{marginTop:12}}>Dvault Vault</h3>
        <p className="muted">Secure cold wallet — unlock with your hardware signer or PIN</p>
        <div style={{marginTop:18}}>
          <VaultWheel onUnlock={onUnlocked} typing={typing} status={status} />
        </div>
        <div style={{marginTop:14}} className="muted">Enter PIN</div>
        <div className="unlock-pin" style={{marginTop:8}}>
          <input className="pin-input" type="password" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={onKey} />
          <button className="button" style={{height:40}} onClick={submitPin}>Unlock</button>
        </div>
      </div>
    </div>
  )
}
