import React, { useEffect, useState } from 'react'

type ConnMeta = { id: string; name: string; created: number }

export default function BankInfo(){
  const [conns, setConns] = useState<ConnMeta[]>([])
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [authUrl, setAuthUrl] = useState('')
  const [tokenUrl, setTokenUrl] = useState('')
  const [clientId, setClientId] = useState('')
  const [scope, setScope] = useState('')
  const [oauthStatus, setOauthStatus] = useState<string | null>(null)
  const [plaidClientId, setPlaidClientId] = useState('')
  const [plaidSecret, setPlaidSecret] = useState('')
  const [plaidInstitution, setPlaidInstitution] = useState('')

  async function load(){
    // @ts-ignore
    const res = await window.dvault.bank.listConnections()
    setConns(res.connections || [])
  }

  useEffect(()=>{ load() }, [])

  async function add(){
    if(!name || !username || !password) return
    const id = Date.now().toString()
    // @ts-ignore
    await window.dvault.bank.createConnection(id, name, username, password)
    setName(''); setUsername(''); setPassword('')
    await load()
  }

  async function fetchBalance(id: string){
    // @ts-ignore
    const res = await window.dvault.bank.getBalance(id)
    setBalance(res.balance)
  }

  async function viewCreds(id: string){
    // @ts-ignore
    const res = await window.dvault.bank.getConnection(id)
    if(res.connection) alert('Username: '+res.connection.username+'\nPassword: '+res.connection.password)
  }

  async function startOAuth(){
    if(!authUrl || !tokenUrl || !clientId) return alert('Provide authUrl, tokenUrl, clientId')
    setOauthStatus('starting')
    try{
      // @ts-ignore
      const res = await window.dvault.oauth.start({ authUrl, tokenUrl, clientId, scope, id: Date.now().toString() })
      if(res && res.success){
        setOauthStatus('complete')
        await load()
      } else {
        setOauthStatus('failed')
      }
    }catch(e){
      setOauthStatus('failed')
    }
  }

  async function setPlaidCreds(){
    if(!plaidClientId || !plaidSecret) return alert('Provide Plaid client id and secret')
    // @ts-ignore
    await window.dvault.plaid.setCredentials(plaidClientId, plaidSecret)
    alert('Plaid credentials stored')
  }

  async function connectPlaidSandbox(){
    if(!plaidInstitution) return alert('Provide institution id')
    // @ts-ignore
    const resp = await window.dvault.plaid.createSandboxPublicToken(plaidInstitution, ['auth','transactions'])
    if(resp && resp.public_token){
      // exchange
      // @ts-ignore
      const ex = await window.dvault.plaid.exchangePublicToken(resp.public_token)
      if(ex && ex.access_token){
        alert('Plaid sandbox connected: '+ex.item_id)
        await load()
      } else {
        alert('Exchange failed')
      }
    } else {
      alert('Public token creation failed')
    }
  }

  async function remove(id: string){
    // @ts-ignore
    await window.dvault.bank.removeConnection(id)
    await load()
  }

  return (
    <div>
      <h2>Vault — Bank Info</h2>
      <div className="panel">
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <input placeholder="Bank name" value={name} onChange={e=>setName(e.target.value)} />
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="button" onClick={add}>Add Connection</button>
        </div>

        <div style={{marginTop:12}} className="list">
          {conns.map(c=> (
            <div key={c.id} className="list-item">
              <div>
                <strong>{c.name}</strong>
                <div className="muted">ID: {c.id}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="button" onClick={()=>fetchBalance(c.id)}>Balance</button>
                <button className="button" onClick={()=>viewCreds(c.id)}>View Creds</button>
                <button className="button" onClick={()=>remove(c.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:12}}>
          <h5>OAuth PKCE Connect</h5>
          <input placeholder="Authorization URL" value={authUrl} onChange={e=>setAuthUrl(e.target.value)} />
          <input placeholder="Token URL" value={tokenUrl} onChange={e=>setTokenUrl(e.target.value)} />
          <input placeholder="Client ID" value={clientId} onChange={e=>setClientId(e.target.value)} />
          <input placeholder="Scope (optional)" value={scope} onChange={e=>setScope(e.target.value)} />
          <div style={{marginTop:8}}>
            <button className="button" onClick={startOAuth}>Start OAuth PKCE</button>
            {oauthStatus && <span style={{marginLeft:8}} className="muted">{oauthStatus}</span>}
          </div>
        </div>

        {balance !== null && (
          <div style={{marginTop:12}} className="panel">
            <div>Balance: <strong>{balance.toFixed(2)}</strong></div>
          </div>
        )}
      </div>
    </div>
  )
}
