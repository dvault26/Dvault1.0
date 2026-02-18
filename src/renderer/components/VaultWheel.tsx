import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './vaultWheel.css'

type Props = { onUnlock?: () => void; typing?: boolean; status?: 'idle'|'failed'|'success' }

export default function VaultWheel({ onUnlock, typing, status = 'idle' }: Props){
  const wheelRef = useRef<HTMLDivElement|null>(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const el = wheelRef.current
    if(!el) return
    // typing slow rotation
    if(typing) el.classList.add('slow-rotate')
    else el.classList.remove('slow-rotate')
  }, [typing])

  useEffect(()=>{
    const el = wheelRef.current
    if(!el) return
    el.classList.remove('shake','success','fast-spin')
    if(status==='failed'){
      el.classList.add('shake')
      // shake then clear
      setTimeout(()=>el.classList.remove('shake'), 900)
    }
    if(status==='success'){
      el.classList.add('fast-spin')
      el.classList.add('success')
      // after success animation, reveal/open and navigate
      setTimeout(()=>{
        el.classList.add('open')
        if(onUnlock) onUnlock(); else navigate('/dashboard')
      }, 1400)
    }
  }, [status])

  function handleClick(){
    const el = wheelRef.current
    if(!el) return
    el.classList.remove('spin')
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.offsetWidth
    el.classList.add('spin')
    setTimeout(()=>{
      if(onUnlock) onUnlock()
      else navigate('/dashboard')
    }, 1600)
  }

  return (
    <div className="vault-wheel-wrap">
      <div className="vault-wheel" ref={wheelRef} onClick={handleClick} role="button" aria-label="Vault Wheel">
        <div className="wheel-ring">
          {Array.from({length:12}).map((_,i)=> (
            <div key={i} className={`wheel-spoke spoke-${i}`}></div>
          ))}
        </div>
        <div className="wheel-center">DV</div>
        <div className="wheel-open" aria-hidden />
      </div>
      <div className="vault-hint">Enter your PIN or use the wheel</div>
    </div>
  )
}
