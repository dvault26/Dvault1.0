import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function PreTransferConfirm(){
  const { id } = useParams()
  const [info, setInfo] = useState<any>(null)
  const [labeled, setLabeled] = useState<any>(null)
  const [fee, setFee] = useState('')
  const [processing, setProcessing] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    async function load(){
      if(!id) return
      // @ts-ignore
      const res = await window.dvault.transfer.getPretransfer(id)
      if(res.ok) setInfo(res.data)
    }
    load()
  }, [id])

  async function handleConfirm(){
    if(!id) return
    // for demo, create a sample tx and label it
    const sampleTx = { id: 'tx-'+Date.now(), amount: info?.amount || 0, to: info?.address || 'unknown', from: 'you' }
    // @ts-ignore
    const res = await window.dvault.transfer.labelTransaction(sampleTx, id)
    if(res.ok){ setLabeled(res.tx); setTimeout(()=>{ if(info?.mode==='transfer') navigate('/send') ; else navigate('/wallet') }, 1200) }
    else alert(res.message)
  }

  async function handleTransfer(){
    if(!id || !info) return
    setProcessing(true)
    try{
      const chain = info.chain || 'EVM'
      const from = info.from || 'you'
      const to = info.address
      const amount = Number(info.amount) || 0
      // @ts-ignore
      const built = await window.dvault.blockchain.buildTransaction(chain, from, to, amount, fee ? Number(fee) : undefined)
      const unsignedTx = built.tx || built
      // ask signer to sign
      // @ts-ignore
      const signature = await window.dvault.signer.sign(chain, JSON.stringify(unsignedTx))
      // broadcast signed tx
      // @ts-ignore
      const resp = await window.dvault.blockchain.broadcastTransaction(chain, signature)
      setProcessing(false)
      alert('Transaction broadcast: ' + JSON.stringify(resp))
      navigate('/dashboard')
    }catch(e:any){ setProcessing(false); alert(e?.message || 'Transfer failed') }
  }

  function handleReceive(){
    // For Receive, we simply show address/QR and mark as waiting for blockchain confirmation
    alert('Show address and QR for: ' + (info?.address || '—'))
  }

  return (
    <div className="centered">
      <div style={{width:640,maxWidth:'96%'}}>
        <div className="panel">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <h3 className="brand-heading">Confirm {info?.mode==='receive' ? 'Receive' : 'Transfer'}</h3>
            <div className="muted">Pre-Transfer ID: {id}</div>
          </div>

          {info ? (
            <div style={{marginTop:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <div className="pretransfer-label">Amount</div>
                  <div style={{fontWeight:700,fontSize:18}}>{info.amount || '—'}</div>
                </div>
                <div>
                  <div className="pretransfer-label">Address</div>
                  <div style={{fontWeight:700,fontSize:14}}>{info.address || '—'}</div>
                </div>
              </div>

              <div style={{marginTop:12}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <div>
                    <label>Network fee</label>
                    <input value={fee} onChange={e=>setFee(e.target.value)} placeholder="optional" />
                  </div>
                  <div>
                    <label>Brokerage</label>
                    <div style={{marginTop:6,fontWeight:700}}>{info.receivingBroker || info.receiveFrom || '—'}</div>
                  </div>
                </div>
                <div style={{fontWeight:700,color:'var(--gold)'}}>{info.label || 'No label'}</div>
                <div className="muted" style={{marginTop:6}}>Reference: {info.reference || '—'}</div>
                <div style={{marginTop:8}}>{info.notes}</div>
                <div style={{marginTop:8}} className="muted">Tags: {(info.tags||[]).join(', ')}</div>
                <div style={{marginTop:16,display:'flex',gap:8}}>
                  {info.mode==='transfer' ? (
                    <>
                      <button className="button" onClick={handleTransfer} disabled={processing}>{processing? 'Processing...':'Transfer'}</button>
                      <button className="button secondary" onClick={handleConfirm}>Save & Label</button>
                    </>
                  ) : (
                    <>
                      <button className="button" onClick={handleReceive}>Receive</button>
                      <button className="button secondary" onClick={handleConfirm}>Save & Label</button>
                    </>
                  )}
                </div>
                {labeled && (
                  <div style={{marginTop:14,padding:12,background:'rgba(0,0,0,0.3)',borderRadius:8}}>
                    <div style={{fontWeight:700}}>Labeled Transaction</div>
                    <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(labeled,null,2)}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (<div className="muted">Loading...</div>)}
        </div>
      </div>
    </div>
  )
}
