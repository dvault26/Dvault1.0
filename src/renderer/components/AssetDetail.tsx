import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

export default function AssetDetail(){
  const { asset } = useParams()
  const navigate = useNavigate()
  const [txs, setTxs] = useState<any[]>([])

  useEffect(()=>{
    async function load(){
      // @ts-ignore
      const res = await window.dvault.blockchain.getTransactions(asset || 'XRP', 'my-address')
      const list = res.transactions || []
      // for each, try to find metadata
      const withMeta = [] as any[]
      for(const t of list){
        // @ts-ignore
        const m = await window.dvault.transfer.findMetadata(t).catch(()=>({ok:false}))
        withMeta.push({ tx: t, meta: m && m.ok ? m.info : null })
      }
      setTxs(withMeta)
    }
    load()
  }, [asset])

  function handleReceive(){
    // prepare pending info for receive
    const pending = { mode: 'receive', amount: '', address: 'my-address' }
    sessionStorage.setItem('dvault:pendingUnsigned', JSON.stringify(pending))
    navigate('/pretransfer')
  }

  return (
    <div>
      <h2>{asset} Details</h2>
      <div className="panel">
        <h4>Balance</h4>
        <div style={{fontSize:22,fontWeight:700}}>—</div>
        <div style={{marginTop:12}}>
          <button className="button" onClick={handleReceive}>Receive</button>
          <Link to="/send"><button style={{marginLeft:8}} className="button">Send</button></Link>
        </div>
      </div>

      <div style={{marginTop:12}} className="panel">
        <h4>Transactions</h4>
        <div className="list">
          {txs.length===0 && <div className="muted">No transactions</div>}
          {txs.map(({tx,meta}:any, i)=> (
            <div key={i} className="list-item">
              <div>
                <div style={{fontWeight:700}}>{tx.id || tx.txid || 'tx'}</div>
                <div className="muted">{tx.amount || tx.value || '—'} • {tx.to || tx.address || ''}</div>
                {meta && (
                  <div style={{marginTop:6}}>
                    <div style={{fontWeight:700,color:'var(--gold)'}}>{meta.label || meta.purpose || 'Metadata'}</div>
                    <div className="muted">{meta.notes || ''}</div>
                  </div>
                )}
              </div>
              <div>{meta ? <span style={{color:'var(--green)'}}>Matched</span> : <span className="muted">—</span>}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
