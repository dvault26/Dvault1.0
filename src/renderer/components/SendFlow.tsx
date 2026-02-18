import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SendFlow(){
  const navigate = useNavigate()
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState('')
  const [unsigned, setUnsigned] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)

  async function buildUnsigned(){
    // Call main process blockchain mock
    // @ts-ignore
    const res = await window.dvault.blockchain.buildTransaction('XRP', 'my-address', to, Number(amount), Number(fee))
    const tx = JSON.stringify(res.tx)
    setUnsigned(tx)
    // store pending unsigned tx and navigate to metadata capture
    sessionStorage.setItem('dvault:pendingUnsigned', JSON.stringify({ chain: 'XRP', from: 'my-address', to, amount, fee, unsigned: res.tx }))
    const nav = navigate
    nav('/pretransfer')
  }

  async function signWithDevice(){
    if (!unsigned) return
    // @ts-ignore
    const res = await window.dvault.signer.sign('XRP', unsigned)
    setSignature(res.signature)
  }

  async function broadcast(){
    if (!signature) return
    // @ts-ignore
    const res = await window.dvault.blockchain.broadcastTransaction('XRP', signature)
    alert('Broadcasted tx: '+res.txid)
  }

  return (
    <div>
      <h2>Send</h2>
      <div className="panel" style={{maxWidth:640}}>
        <label>To</label>
        <input style={{width:'100%',marginTop:6,marginBottom:8}} value={to} onChange={e=>setTo(e.target.value)} />
        <label>Amount</label>
        <input style={{width:'100%',marginTop:6,marginBottom:8}} value={amount} onChange={e=>setAmount(e.target.value)} />
        <label>Fee</label>
        <input style={{width:'100%',marginTop:6,marginBottom:8}} value={fee} onChange={e=>setFee(e.target.value)} />
        <div style={{marginTop:8}}>
          <button className="button" onClick={buildUnsigned}>Build Unsigned</button>
          <button className="button" style={{marginLeft:8}} onClick={signWithDevice} disabled={!unsigned}>Sign with Device</button>
          <button className="button" style={{marginLeft:8}} onClick={broadcast} disabled={!signature}>Broadcast</button>
        </div>
        {unsigned && (
          <div style={{marginTop:12}} className="muted">Unsigned: <pre style={{whiteSpace:'pre-wrap'}}>{unsigned}</pre></div>
        )}
        {signature && (
          <div style={{marginTop:12}}>Signature: <pre>{signature}</pre></div>
        )}
      </div>
    </div>
  )
}
