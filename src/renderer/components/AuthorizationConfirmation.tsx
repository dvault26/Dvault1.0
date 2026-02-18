import React from 'react'
import { useNavigate } from 'react-router-dom'
import logoSrc from '../assets/dvault-logo.svg'

export default function AuthorizationConfirmation(){
  const navigate = useNavigate()
  const [authCode, setAuthCode] = React.useState<string>('UNKNOWN')
  const [owner, setOwner] = React.useState<any>({})

  React.useEffect(()=>{
    let mounted = true
    const s1 = sessionStorage.getItem('dvault:authCode')
    const s2 = sessionStorage.getItem('dvault:owner')
    if(s1 && mounted) setAuthCode(s1)
    if(s2 && mounted) setOwner(JSON.parse(s2))
    // also try persisted settings as fallback
    window.dvault.settings.get().then((s:any)=>{
      if(!mounted) return
      if(s.authCode) setAuthCode(s.authCode)
      if(s.owner) setOwner(s.owner)
    }).catch(()=>{})
    return ()=>{ mounted = false }
  },[])

  return (
    <div className="centered">
      <div style={{width:560,maxWidth:'96%'}}>
        <img src={logoSrc} alt="Dvault" className="splash-logo-img gold-glow" />
        <div className="panel" style={{marginTop:12,textAlign:'center'}}>
          <h3 className="brand-heading">Your copy of Dvault is now registered and owned by you.</h3>
          <div style={{marginTop:12,padding:16,borderRadius:10,background:'linear-gradient(135deg,rgba(212,175,55,0.06),rgba(255,210,120,0.02))',border:'1px solid rgba(212,175,55,0.12)'}}>
            <div style={{fontSize:18,fontWeight:700,color:'var(--gold)'}}>Authorization Code</div>
            <div style={{marginTop:8,fontSize:20,letterSpacing:2}}>{authCode}</div>
            <div style={{marginTop:10,color:'var(--muted)'}}>Owned by {owner.name || owner.email || 'You'}</div>
              <div style={{marginTop:6,color:'var(--muted)'}}>License activated via registration service.</div>
            <div style={{marginTop:18}}>
              <div className="success-check" style={{margin:'0 auto',width:72,height:72,borderRadius:36,background:'linear-gradient(135deg,var(--green),#00c07a)'}}>
                <svg viewBox="0 0 24 24" width="48" height="48" style={{fill:'#fff'}}>
                  <path d="M20.285,6.709c-0.391-0.391-1.023-0.391-1.414,0L9,16.586l-3.871-3.871c-0.391-0.391-1.023-0.391-1.414,0 s-0.391,1.023,0,1.414l4.578,4.578c0.093,0.093,0.203,0.166,0.326,0.217c0.12,0.05,0.247,0.076,0.375,0.076s0.255-0.026,0.375-0.076 c0.123-0.051,0.233-0.124,0.326-0.217l10.992-10.992C20.676,7.732,20.676,7.1,20.285,6.709z" />
                </svg>
              </div>
            </div>
            <div style={{marginTop:18}}>
              <button className="button" onClick={()=>navigate('/unlock')}>Continue to Sign‑In</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
