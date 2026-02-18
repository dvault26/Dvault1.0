import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PreTransferForm(){
  const [mode, setMode] = useState<'transfer'|'receive'>('transfer')
  const [label, setLabel] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState('')
  const [address, setAddress] = useState('')
  const [receiveFrom, setReceiveFrom] = useState('')
  const [senderName, setSenderName] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [receivingBroker, setReceivingBroker] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  React.useEffect(()=>{
    try{
      const pending = sessionStorage.getItem('dvault:pendingUnsigned')
      if(pending){
        const p = JSON.parse(pending)
        if(p.amount) setAmount(String(p.amount))
        if(p.to) setAddress(p.to)
        if(p.mode) setMode(p.mode)
        // default to transfer when pending unsigned present
        if(!p.mode) setMode('transfer')
        // try detect brokerage for address
        if(p.to){
          // @ts-ignore
          window.dvault.brokerage.detect(p.to).then((r:any)=>{ if(r && r.name && r.name!=='Unknown') setReceivingBroker(r.name) })
        }
      }
    }catch(e){ }
  }, [])

  async function handleSave(e?:React.FormEvent){
    if(e) e.preventDefault()
    setSaving(true)
    try{
      const info = {
        mode,
        label,
        reference,
        notes,
        tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
        amount,
        address,
        receiveFrom,
        senderName,
        recipientName,
        purpose,
        receivingBroker,
        fee
      }
      // @ts-ignore
      const res = await window.dvault.transfer.storePretransfer(info)
      setSaving(false)
      if(res && res.id){
        navigate(`/pretransfer/confirm/${res.id}`)
      }
    }catch(e:any){ setSaving(false); alert(e?.message||'Unable to save') }
  }

  return (
    <div className="centered">
      <div style={{width:560,maxWidth:'94%'}} className="panel pretransfer-panel">
        <h3 className="brand-heading">Transaction Information</h3>
        <p className="muted">Provide details about this {mode==='receive' ? 'incoming' : 'outgoing'} transfer.</p>
        <form onSubmit={handleSave} style={{display:'grid',gap:10,marginTop:12}}>
          <div>
            <label>Mode</label>
            <select value={mode} onChange={e=>setMode(e.target.value as any)}>
              <option value="transfer">Transfer</option>
              <option value="receive">Receive</option>
            </select>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div>
              <label>Amount</label>
              <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g., 0.25" />
            </div>
            <div>
              <label>Address</label>
              <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Recipient or sender address" />
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:6}}>
            <div>
              <label>Network Fee</label>
              <input value={fee} onChange={e=>setFee(e.target.value)} placeholder="optional fee" />
            </div>
            <div>
              <label>Brokerage</label>
              <input value={receivingBroker} onChange={e=>setReceivingBroker(e.target.value)} placeholder="Coinbase, Binance, etc." />
            </div>
          </div>

          {mode==='receive' ? (
            <>
              <div>
                <label>Where is this crypto coming from?</label>
                <select value={receiveFrom} onChange={e=>setReceiveFrom(e.target.value)}>
                  <option value="">Select</option>
                  <option>Coinbase</option>
                  <option>Binance</option>
                  <option>Kraken</option>
                  <option>Uphold</option>
                  <option>Crypto.com</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label>Sender's name or wallet label (optional)</label>
                <input value={senderName} onChange={e=>setSenderName(e.target.value)} placeholder="Sender name or label" />
              </div>
              <div>
                <label>Optional: notes about this transfer</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label>Who are you sending to?</label>
                <input value={recipientName} onChange={e=>setRecipientName(e.target.value)} placeholder="Name or recipient label" />
              </div>
              <div>
                <label>What is the purpose of this transfer?</label>
                <input value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="e.g., rent, payment, savings" />
              </div>
              <div>
                <label>Which brokerage or wallet will receive it?</label>
                <input value={receivingBroker} onChange={e=>setReceivingBroker(e.target.value)} placeholder="Coinbase, Binance, etc." />
              </div>
              <div>
                <label>Optional: notes</label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} />
              </div>
            </>
          )}

          <div>
            <label>Label (shown on transaction)</label>
            <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g., Rent payment" />
          </div>

          <div>
            <label>Tags (comma separated)</label>
            <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="business,monthly" />
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <button className="button" type="submit" disabled={saving}>{saving? 'Saving...':'Continue'}</button>
            <div className="muted">You will confirm on the next screen</div>
          </div>
        </form>
      </div>
    </div>
  )
}
