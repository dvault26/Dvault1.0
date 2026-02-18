import React, { useEffect, useState } from 'react'
import { useI18n } from '../i18n/i18n'
import BrokerageBadge from './BrokerageBadge'
import { TERMS } from '../legal/terms'
import { PRIVACY } from '../legal/privacy'
import { SAFETY } from '../legal/safety'
import { DISCLAIMER } from '../legal/disclaimer'

const tabStyle: React.CSSProperties = { padding: 12, cursor: 'pointer' }

export const Settings: React.FC = () => {
  const { t, lang, setLang } = useI18n()
  const [tab, setTab] = useState('language')
  const [settings, setSettings] = useState<any>(null)
  const [registered, setRegistered] = useState<any[]>([])
  const [legalDoc, setLegalDoc] = useState('terms')
  const [legalHtml, setLegalHtml] = useState('')
  const [appVersion, setAppVersion] = useState<string>('0.0.0')
  const [updateInfo, setUpdateInfo] = useState<any>(null)

  useEffect(() => { window.dvault.settings.get().then((s:any)=>{ setSettings(s); setLang(s.language||'en') }) }, [])
  useEffect(()=>{ window.dvault.settings.listRegisteredUsb().then((r:any)=> setRegistered(r.items || [])) }, [])

  useEffect(()=>{
    // load initial legal doc
    setLegalDoc('terms')
  }, [])

  useEffect(()=>{
    // map legalDoc to HTML
    let txt = ''
    if(legalDoc === 'terms') txt = TERMS
    else if(legalDoc === 'privacy') txt = PRIVACY
    else if(legalDoc === 'safety') txt = SAFETY
    else if(legalDoc === 'disclaimer') txt = DISCLAIMER
    // simple plaintext -> HTML
    setLegalHtml(txt.replace(/\n/g,'<br/>'))
  }, [legalDoc])

  useEffect(()=>{
    (async ()=>{
      try{
        const v = await window.dvault.app.getVersion()
        setAppVersion(v.version || '0.0.0')
        const u = await window.dvault.updates.check()
        setUpdateInfo(u)
      }catch(e){}
    })()
  }, [])

  const addDevice = async () => {
    const name = prompt(t('settings.deviceName')) || 'USB Key'
    const serial = prompt(t('settings.serialNumber')) || ''
    try{
      const id = await window.dvault.settings.registerUsb({ name, serial })
      setRegistered(await window.dvault.settings.listRegisteredUsb().then((r:any)=>r.items))
      alert('Device registered')
    }catch(e){ alert('Register failed: '+String(e)) }
  }

  const removeDevice = async (id:string) => {
    await window.dvault.settings.removeRegisteredUsb(id)
    setRegistered(await window.dvault.settings.listRegisteredUsb().then((r:any)=>r.items))
  }

  const setPrimary = async (id:string) => {
    await window.dvault.settings.setPrimaryUsb(id)
    setRegistered(await window.dvault.settings.listRegisteredUsb().then((r:any)=>r.items))
  }

  const validateRpc = async () => {
    const rpc = (document.getElementById('rpcUrl') as HTMLInputElement).value
    const res = await window.dvault.settings.validateRpc(rpc)
    alert(JSON.stringify(res))
  }

  return (
    <div style={{ padding: 20, color: '#ddd', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2 style={{ color: '#d4af37' }}>{t('settings.title')}</h2>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 200, background: '#0b0b0b', padding: 8, borderRadius: 8 }}>
          <div style={tabStyle} onClick={()=>setTab('language')}>{t('settings.language')}</div>
          <div style={tabStyle} onClick={()=>setTab('usb')}>{t('settings.usbDevices')}</div>
          <div style={tabStyle} onClick={()=>setTab('chains')}>{t('settings.chains')}</div>
          <div style={tabStyle} onClick={()=>setTab('support')}>{t('settings.support')}</div>
          <div style={tabStyle} onClick={()=>setTab('legal')}>{t('settings.legal')}</div>
          <div style={tabStyle} onClick={()=>setTab('updates')}>{t('settings.updates')}</div>
        </div>

        <div style={{ flex: 1, background: '#071011', padding: 16, borderRadius: 8 }}>
          {tab === 'language' && (
            <div>
              <h3>{t('settings.language')}</h3>
              <select value={lang} onChange={e=>{ setLang(e.target.value); window.dvault.settings.setLanguage(e.target.value) }}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          )}

          {tab === 'usb' && (
            <div>
              <h3>{t('settings.usbDevices')}</h3>
              <button onClick={addDevice} style={{ background: '#0f9d58', color: '#000', padding: '6px 12px', borderRadius: 6 }}>{t('settings.addDevice')}</button>
              <div style={{ marginTop: 12 }}>
                {registered.map(r=> (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: '#0b0b0b', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>S/N: {r.serial}</div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>Status: {r.status}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={()=>setPrimary(r.id)}>{t('settings.setPrimary')}</button>
                      <button onClick={()=>removeDevice(r.id)} style={{ color: '#f66' }}>{t('settings.removeDevice')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'chains' && (
            <div>
              <h3>{t('settings.chains')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input id="chainName" placeholder={t('settings.chainName') as string} />
                <input id="symbol" placeholder={t('settings.symbol') as string} />
                <input id="rpcUrl" placeholder={t('settings.rpcUrl') as string} />
                <input id="chainId" placeholder={t('settings.chainId') as string} />
                <input id="derivation" placeholder={t('settings.derivationPath') as string} />
                <input id="decimals" placeholder={t('settings.decimals') as string} />
                <input id="contract" placeholder={t('settings.contractAddress') as string} />
                <div>
                  <button onClick={validateRpc}>{t('settings.validate')}</button>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="file" id="logoUpload" accept="image/*" />
                  <button onClick={async ()=>{
                    const name = (document.getElementById('chainName') as HTMLInputElement).value
                    const symbol = (document.getElementById('symbol') as HTMLInputElement).value
                    const rpc = (document.getElementById('rpcUrl') as HTMLInputElement).value
                    const chainIdInput = (document.getElementById('chainId') as HTMLInputElement).value
                    const chainId = chainIdInput ? Number(chainIdInput) : undefined
                    const derivation = (document.getElementById('derivation') as HTMLInputElement).value
                    const decimalsInput = (document.getElementById('decimals') as HTMLInputElement).value
                    const decimals = decimalsInput ? Number(decimalsInput) : undefined
                    const contract = (document.getElementById('contract') as HTMLInputElement).value
                    // basic client-side validation
                    if(!name||!symbol) return alert('Name and symbol required')
                    const chainObj:any = { id: symbol.toLowerCase(), name, rpc: rpc||'', chainId: chainId||undefined, type: 'EVM', derivation: derivation||undefined, decimals: decimals||undefined, tokens: [] }
                    if(contract) { chainObj.tokens = [{ symbol, contractAddress: contract, decimals: decimals||18 }] }
                    // attempt rpc validation
                    if(rpc){
                      const v = await window.dvault.settings.validateRpc(rpc)
                      if(!v.ok) return alert('RPC validation failed: '+(v.message||'invalid'))
                      // if chainId provided, compare
                      if(chainObj.chainId && v.chainId && chainObj.chainId !== v.chainId) {
                        return alert('Chain ID mismatch: RPC reports '+v.chainId)
                      }
                    }
                    // if contract provided validate it
                    if(contract && rpc){
                      const cv = await window.dvault.settings.validateContract(rpc, contract)
                      if(!cv.ok) return alert('Contract validation failed: '+(cv.message||'no code at address'))
                    }
                    await window.dvault.registry.addChain(chainObj)
                    alert('Chain added and will appear in wallet list')
                  }}>{t('settings.addChain')}</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'support' && (
            <div>
              <h3>{t('settings.support')}</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p>Contact Support</p>
                  <button onClick={()=> window.open('mailto:dsupport@dvault.online')} style={{ background: '#d4af37', border: 'none', padding: '8px 12px', borderRadius: 6 }}>Contact Support</button>
                  <button onClick={()=> window.open('https://support.dvault.online')} style={{ marginLeft: 8, padding: '8px 12px' }}>Open Support Portal</button>
                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: 'block', marginBottom: 6 }}>Registration Endpoint (optional)</label>
                    <input id="registrationEndpoint" defaultValue={settings?.licenseEndpoint || ''} placeholder="https://your-render-app.example/license" style={{ width: '100%' }} />
                    <div style={{ marginTop: 8 }}>
                      <button onClick={async ()=>{
                        const val = (document.getElementById('registrationEndpoint') as HTMLInputElement).value
                        await window.dvault.settings.save({ licenseEndpoint: val })
                        alert('Saved')
                      }} style={{ padding: '6px 10px' }}>Save Registration Endpoint</button>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h4>Troubleshooting</h4>
                  <ul>
                    <li>Check USB connections and drivers.</li>
                    <li>Ensure Dvault is up to date.</li>
                    <li>Restart app after firmware updates.</li>
                  </ul>
                  <h4>FAQ</h4>
                  <p>Common questions about wallet setup, backups, and security.</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'legal' && (
            <div>
              <h3>{t('settings.legal')}</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 200, background: '#0b0b0b', padding: 8, borderRadius: 8 }}>
                  <div style={{ padding: 8, cursor: 'pointer' }} onClick={()=> setLegalDoc('terms')}>Terms of Use</div>
                  <div style={{ padding: 8, cursor: 'pointer' }} onClick={()=> setLegalDoc('privacy')}>Privacy Policy</div>
                  <div style={{ padding: 8, cursor: 'pointer' }} onClick={()=> setLegalDoc('safety')}>Cold Wallet Safety</div>
                  <div style={{ padding: 8, cursor: 'pointer' }} onClick={()=> setLegalDoc('disclaimer')}>Disclaimer</div>
                </div>
                <div style={{ flex: 1, background: '#070707', padding: 12, borderRadius: 8, maxHeight: 420, overflow: 'auto' }}>
                  <div style={{ color: '#fff' }} dangerouslySetInnerHTML={{ __html: legalHtml }} />
                </div>
              </div>
            </div>
          )}

          {tab === 'updates' && (
            <div>
              <h3>{t('settings.updates')}</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                <div>Current version: <strong>{appVersion}</strong></div>
                <div>Latest: <strong>{updateInfo?.data?.latestVersion || updateInfo?.data?.latestVersion || 'n/a'}</strong></div>
                <div style={{ whiteSpace: 'pre-wrap', background: '#060606', padding: 10, borderRadius: 6, color: '#ddd' }}>{updateInfo?.data?.notes || 'No release notes available.'}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={async ()=>{ const u = await window.dvault.updates.check(); setUpdateInfo(u); alert('Checked'); }} style={{ background: '#d4af37', border: 'none', padding: '8px 12px', borderRadius: 6 }}>Check for updates</button>
                  <button onClick={()=>{ if(updateInfo?.data?.downloadUrl) window.open(updateInfo.data.downloadUrl); else alert('No download URL') }}>Download Update</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'onboarding' && (
            <div>
              <h3>Getting Started</h3>
              <div style={{ marginBottom: 8 }}>
                <input placeholder="Search guide..." id="onboardSearch" onChange={(e)=>{
                  const q = (e.target as HTMLInputElement).value.toLowerCase()
                  const items = document.querySelectorAll('.onboard-step')
                  items.forEach(it=>{
                    const el = it as HTMLElement
                    el.style.display = el.innerText.toLowerCase().includes(q) ? 'block' : 'none'
                  })
                }} />
              </div>
              <div style={{ maxHeight: 420, overflow: 'auto' }}>
                <div className="onboard-step"><h4>1. Install Dvault</h4><p>Download the installer for your OS and run the setup.</p></div>
                <div className="onboard-step"><h4>2. Connect USB device</h4><p>Insert your Dvault USB key and register it under Settings → USB Devices.</p></div>
                <div className="onboard-step"><h4>3. Create wallet</h4><p>Use the Wallet screen to create an account — keys remain on your hardware signer.</p></div>
                <div className="onboard-step"><h4>4. Receive crypto</h4><p>Use Receive to show an address and QR code.</p></div>
                <div className="onboard-step"><h4>5. Send crypto</h4><p>Initiate Send, fill recipient, then capture pre-transfer metadata and confirm on your device.</p></div>
                <div className="onboard-step"><h4>6. Add new coins</h4><p>Use Settings → Chains to add custom chains or tokens.</p></div>
                <div className="onboard-step"><h4>7. Use the vault</h4><p>Store encrypted documents and images in the Vault section.</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
