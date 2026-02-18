import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import crypto from 'crypto'
import http from 'http'
import { generateCodeVerifier, generateCodeChallenge } from './pkce'

// Import security key manager
import SecurityKeyManager from '../lib/securityKeyManager'

// Plaid integration (sandbox)
async function getStoredPlaidCreds(signer: any) {
  const userData = app.getPath('userData')
  const pfile = path.join(userData, 'plaid.bin')
  try {
    const buf = await fsPromises.readFile(pfile)
    const dec = await signer.decryptBlob(Buffer.from(buf))
    return JSON.parse(dec.toString())
  } catch (e) {
    return null
  }
}
import { MockSigner } from '../lib/mockSigner'
import { HardwareSigner } from '../lib/hardwareSigner'
import { BlockchainMock } from './blockchainMock'
import fs from 'fs'
import fsPromises from 'fs/promises'
import * as registry from './registry'
import { detectBrokerage } from './brokerage'

// Settings storage helpers
function settingsPath() {
  const userData = app.getPath('userData')
  return path.join(userData, 'settings.json')
}

async function loadSettings(): Promise<any> {
  const p = settingsPath()
  try {
    const txt = await fsPromises.readFile(p, 'utf8')
    return JSON.parse(txt)
  } catch (e) {
    const def = { language: 'en', updatedAt: Date.now(), licenseEndpoint: 'https://your-render-app.onrender.com' }
    await fsPromises.writeFile(p, JSON.stringify(def, null, 2), 'utf8')
    return def
  }
}

async function saveSettings(obj: any) {
  const p = settingsPath()
  await fsPromises.writeFile(p, JSON.stringify(obj, null, 2), 'utf8')
}

// Registered USB devices storage path (secure blobs encrypted by active signer)
function registeredDevicesDir() {
  const userData = app.getPath('userData')
  return path.join(userData, 'registered-usb')
}


let mainWindow: BrowserWindow | null = null
let activeSigner: HardwareSigner | null = null
let blockchain = new BlockchainMock()
import { USBSigner } from '../lib/usbSigner'
import { HIDSigner, listHidDevices } from '../lib/hidSignerDevice'
let usbSigner: USBSigner | null = null
let hidSigner: HIDSigner | null = null

// brokerage detection now performed by `src/main/brokerage.ts`

function createWindow() {
  // Use icon.ico for Windows, icon.png for other platforms
  const iconPath = process.platform === 'win32' 
    ? path.join(__dirname, '..', '..', 'build', 'icon.ico')
    : path.join(__dirname, '..', '..', 'build', 'icon.png')
  
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl)
    mainWindow.webContents.openDevTools()
  } else {
    const indexHtml = path.join(__dirname, '..', 'renderer', 'index.html')
    mainWindow.loadFile(indexHtml).catch(err => {
      console.error('Failed to load HTML:', err)
    })
  }

  mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
    console.error(`Failed to load (code: ${code}): ${desc}`)
  })

  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed')
    app.quit()
  })
}

app.whenReady().then(() => {
  try {
    createWindow()
    // Run update check in background without blocking startup
    checkForUpdatesOnStartup().catch(err => console.error('Update check error:', err))
  } catch (e) {
    console.error('Error during app startup:', e)
    app.quit()
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      try {
        createWindow()
      } catch (e) {
        console.error('Error creating window on activate:', e)
      }
    }
  })
}).catch(err => {
  console.error('Error in app.whenReady():', err)
  app.quit()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// Signer IPC handlers (mock implementation)
ipcMain.handle('signer:connect-mock', async () => {
  const s = new MockSigner()
  await s.initialize()
  activeSigner = s
  return { connected: true }
})

ipcMain.handle('usb:listDevices', async () => {
  const userData = app.getPath('userData')
  const d = path.join(userData, 'usb-devices')
  try {
    const files = await fsPromises.readdir(d)
    return { devices: files }
  } catch (e) {
    return { devices: [] }
  }
})

ipcMain.handle('usb:scanHid', async () => {
  try {
    const devices = await listHidDevices()
    return { devices }
  } catch (e) {
    return { devices: [] }
  }
})

ipcMain.handle('usb:connect-hid', async (_ev, deviceInfo: any) => {
  hidSigner = new HIDSigner(deviceInfo)
  await hidSigner.initialize()
  activeSigner = hidSigner
  return { connected: true }
})

ipcMain.handle('usb:createDevice', async (_ev, deviceId: string, licenseId?: string) => {
  const userData = app.getPath('userData')
  const d = path.join(userData, 'usb-devices')
  await fsPromises.mkdir(d, { recursive: true })
  const entries = await fsPromises.readdir(d)
  if (entries.length >= 3) throw new Error('maximum of 3 devices allowed')
  const devPath = path.join(d, deviceId)
  await fsPromises.mkdir(devPath, { recursive: true })
  if (licenseId) {
    await fsPromises.writeFile(path.join(devPath, 'license.json'), JSON.stringify({ licenseId }))
  }
  return { created: true }
})

ipcMain.handle('usb:connect', async (_ev, deviceId: string) => {
  usbSigner = new USBSigner(deviceId)
  await usbSigner.initialize()
  activeSigner = usbSigner
  return { connected: true }
})

ipcMain.handle('usb:disconnect', async () => {
  usbSigner = null
  activeSigner = null
  return { disconnected: true }
})

ipcMain.handle('signer:status', async () => {
  return { connected: !!activeSigner }
})

ipcMain.handle('signer:generateKeyPair', async (_ev, chain: string) => {
  if (!activeSigner) throw new Error('signer not connected')
  const pub = await activeSigner.generateKeyPair(chain)
  return { publicKey: pub }
})

ipcMain.handle('signer:getPublicKey', async () => {
  if (!activeSigner) throw new Error('signer not connected')
  return { publicKey: await activeSigner.getPublicKey() }
})

ipcMain.handle('signer:sign', async (_ev, chain: string, payload: string) => {
  if (!activeSigner) throw new Error('signer not connected')
  const sig = await activeSigner.sign(chain, payload)
  return { signature: sig }
})

// Blockchain IPC handlers (mock)
ipcMain.handle('blockchain:getBalance', async (_ev, chain: string, address: string) => {
  return { balance: await blockchain.getBalance(chain, address) }
})

ipcMain.handle('blockchain:getTransactions', async (_ev, chain: string, address: string) => {
  return { transactions: await blockchain.getTransactions(chain, address) }
})

ipcMain.handle('blockchain:buildTransaction', async (_ev, chain: string, from: string, to: string, amount: number, fee?: number) => {
  return { tx: await blockchain.buildTransaction(chain, from, to, amount, fee) }
})

ipcMain.handle('blockchain:broadcastTransaction', async (_ev, chain: string, signedTx: string) => {
  const txid = await blockchain.broadcastTransaction(chain, signedTx)
  // persist transaction record and attempt to attach metadata
  try {
    const userData = app.getPath('userData')
    const txDir = path.join(userData, 'transactions')
    await fsPromises.mkdir(txDir, { recursive: true })
    const txRecord: any = { txid, chain, signedTx, createdAt: Date.now() }
    // try to guess to/from from signedTx if it's JSON
    try { txRecord.parsed = JSON.parse(signedTx) } catch (e) { }
    // attempt to find matching pretransfer by address
    try {
      const preDir = path.join(userData, 'pretransfers')
      const metas = await fsPromises.readdir(preDir)
      for(const m of metas.filter(x=>x.endsWith('.json'))){
        const txt = await fsPromises.readFile(path.join(preDir,m),'utf8')
        const meta = JSON.parse(txt)
        const maybeBin = path.join(preDir, meta.id + '.bin')
        if(fs.existsSync(maybeBin)){
          const buf = await fsPromises.readFile(maybeBin)
          if(activeSigner){
            const dec = await activeSigner.decryptBlob(Buffer.from(buf))
            const info = JSON.parse(dec.toString())
            const addr = info.address || info.to || info.from
            if(addr && txRecord.parsed){
              const contains = JSON.stringify(txRecord.parsed).includes(addr)
              if(contains){ txRecord.metadata = info; break }
            }
          }
        }
      }
    } catch (e) { /* ignore */ }
    await fsPromises.writeFile(path.join(txDir, `${txid}.json`), JSON.stringify(txRecord, null, 2))
  } catch (e) { /* ignore persistence errors */ }
  return { txid }
})

// Vault IPC handlers (store encrypted blobs on disk)
ipcMain.handle('vault:storeBlob', async (_ev, filename: string, b64data: string) => {
  const userData = app.getPath('userData')
  const vaultDir = path.join(userData, 'vault')
  await fsPromises.mkdir(vaultDir, { recursive: true })
  const filePath = path.join(vaultDir, filename)
  const buf = Buffer.from(b64data, 'base64')
  await fsPromises.writeFile(filePath, buf)
  return { stored: true }
})

ipcMain.handle('vault:listBlobs', async () => {
  const userData = app.getPath('userData')
  const vaultDir = path.join(userData, 'vault')
  try {
    const files = await fsPromises.readdir(vaultDir)
    return { files }
  } catch (e) {
    return { files: [] }
  }
})

ipcMain.handle('vault:getBlob', async (_ev, filename: string) => {
  const userData = app.getPath('userData')
  const vaultDir = path.join(userData, 'vault')
  const filePath = path.join(vaultDir, filename)
  try {
    const buf = await fsPromises.readFile(filePath)
    return { data: buf.toString('base64') }
  } catch (e) {
    return { data: null }
  }
})

// Security Key Management IPC handlers
ipcMain.handle('security-key:initialize', async () => {
  try {
    await SecurityKeyManager.initialize()
    return { ok: true }
  } catch (e: any) {
    console.error('Security key initialization error:', e)
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('security-key:list', async () => {
  try {
    const keys = await SecurityKeyManager.listSecurityKeys()
    return { keys, ok: true }
  } catch (e: any) {
    console.error('List security keys error:', e)
    return { keys: [], ok: false, error: e.message }
  }
})

ipcMain.handle('security-key:register', async (_ev, deviceInfo: any, password: string, name: string) => {
  try {
    const key = await SecurityKeyManager.registerSecurityKey(deviceInfo, password, name)
    console.log(`[IPC] Registered security key: ${key.id}`)
    return { key, ok: true }
  } catch (e: any) {
    console.error('Register security key error:', e)
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('security-key:setPrimary', async (_ev, keyId: string) => {
  try {
    await SecurityKeyManager.setPrimarySecurityKey(keyId)
    return { ok: true }
  } catch (e: any) {
    console.error('Set primary security key error:', e)
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('security-key:remove', async (_ev, keyId: string) => {
  try {
    await SecurityKeyManager.removeSecurityKey(keyId)
    return { ok: true }
  } catch (e: any) {
    console.error('Remove security key error:', e)
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('security-key:sign', async (_ev, keyId: string, data: string, password: string) => {
  try {
    const dataBuffer = Buffer.from(data, 'hex')
    const signature = await SecurityKeyManager.signWithSecurityKey(keyId, dataBuffer, password)
    return { signature: signature.toString('hex'), ok: true }
  } catch (e: any) {
    console.error('Security key sign error:', e)
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('security-key:verify', async (_ev, keyId: string, data: string, signature: string, password: string) => {
  try {
    const dataBuffer = Buffer.from(data, 'hex')
    const sigBuffer = Buffer.from(signature, 'hex')
    const valid = await SecurityKeyManager.verifySignature(keyId, dataBuffer, sigBuffer, password)
    return { valid, ok: true }
  } catch (e: any) {
    console.error('Security key verify error:', e)
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('security-key:export', async (_ev, keyId: string, password: string) => {
  try {
    const exported = await SecurityKeyManager.exportSecurityKey(keyId, password)
    return { exported, ok: true }
  } catch (e: any) {
    console.error('Security key export error:', e)
    return { ok: false, error: e.message }
  }
})

ipcMain.handle('security-key:import', async (_ev, exportedKey: string, password: string) => {
  try {
    const key = await SecurityKeyManager.importSecurityKey(exportedKey, password)
    return { key, ok: true }
  } catch (e: any) {
    console.error('Security key import error:', e)
    return { ok: false, error: e.message }
  }
})

// Bank connections: credentials are encrypted using the active signer and stored on disk
ipcMain.handle('bank:createConnection', async (_ev, id: string, name: string, username: string, password: string) => {
  if (!activeSigner) throw new Error('no active signer')
  const userData = app.getPath('userData')
  const banksDir = path.join(userData, 'banks')
  await fsPromises.mkdir(banksDir, { recursive: true })
  const payload = JSON.stringify({ id, name, username, password })
  const enc = await activeSigner.encryptBlob(Buffer.from(payload))
  const filePath = path.join(banksDir, `${id}.bin`)
  await fsPromises.writeFile(filePath, Buffer.from(enc))
  // also store metadata
  const meta = { id, name, created: Date.now() }
  await fsPromises.writeFile(path.join(banksDir, `${id}.json`), JSON.stringify(meta))
  return { created: true }
})

ipcMain.handle('bank:listConnections', async () => {
  const userData = app.getPath('userData')
  const banksDir = path.join(userData, 'banks')
  try {
    const files = await fsPromises.readdir(banksDir)
    const metas = files.filter(f => f.endsWith('.json'))
    const res = [] as any[]
    for (const m of metas) {
      const txt = await fsPromises.readFile(path.join(banksDir, m), 'utf8')
      res.push(JSON.parse(txt))
    }
    return { connections: res }
  } catch (e) {
    return { connections: [] }
  }
})

ipcMain.handle('bank:getConnection', async (_ev, id: string) => {
  if (!activeSigner) throw new Error('no active signer')
  const userData = app.getPath('userData')
  const banksDir = path.join(userData, 'banks')
  const filePath = path.join(banksDir, `${id}.bin`)
  try {
    const buf = await fsPromises.readFile(filePath)
    const dec = await activeSigner.decryptBlob(Buffer.from(buf))
    const obj = JSON.parse(dec.toString())
    return { connection: { id: obj.id, name: obj.name, username: obj.username, password: obj.password } }
  } catch (e) {
    return { connection: null }
  }
})

ipcMain.handle('bank:removeConnection', async (_ev, id: string) => {
  const userData = app.getPath('userData')
  const banksDir = path.join(userData, 'banks')
  try {
    await fsPromises.unlink(path.join(banksDir, `${id}.bin`))
    await fsPromises.unlink(path.join(banksDir, `${id}.json`))
  } catch (e) {
    // ignore
  }
  return { removed: true }
})

// Mock bank balance fetch — placeholder for future integration with bank APIs
ipcMain.handle('bank:getBalance', async (_ev, id: string) => {
  // For now return a deterministic mock balance based on id hash
  const h = crypto.createHash('sha256').update(id).digest()
  const bal = (h.readUInt32BE(0) % 10000) / 100
  return { balance: bal }
})

// OAuth PKCE: start an authorization flow and exchange code for tokens
ipcMain.handle('bank:oauth-start', async (_ev, opts: { authUrl: string, tokenUrl: string, clientId: string, scope?: string, id?: string }) => {
  if (!activeSigner) throw new Error('no active signer')
  const signer = activeSigner
  const { authUrl, tokenUrl, clientId, scope } = opts
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)

  return await new Promise(async (resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const reqUrl = req.url || ''
        const full = new URL(reqUrl, `http://localhost`)
        if (full.pathname === '/callback') {
          const code = full.searchParams.get('code')
          if (!code) {
            res.writeHead(400)
            res.end('Missing code')
            return
          }
          // Exchange code for token
          const redirectUri = `http://localhost:${(server.address() as any).port}/callback`
          const params = new URLSearchParams()
          params.set('grant_type', 'authorization_code')
          params.set('code', code)
          params.set('redirect_uri', redirectUri)
          params.set('client_id', clientId)
          params.set('code_verifier', codeVerifier)

          const resp = await fetch(tokenUrl, { method: 'POST', body: params })
          const tokenResp = await resp.json()

          // store encrypted token
          const id = opts.id || Date.now().toString()
          const userData = app.getPath('userData')
          const banksDir = path.join(userData, 'banks')
          await fsPromises.mkdir(banksDir, { recursive: true })
          const enc = await signer!.encryptBlob(Buffer.from(JSON.stringify(tokenResp)))
          await fsPromises.writeFile(path.join(banksDir, `${id}.bin`), Buffer.from(enc))
          await fsPromises.writeFile(path.join(banksDir, `${id}.json`), JSON.stringify({ id, name: clientId, oauth: true, created: Date.now() }))

          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('<html><body>Authorization complete. You may close this window.</body></html>')
          server.close()
          resolve({ success: true, token: tokenResp, id })
        } else {
          res.writeHead(404)
          res.end('Not found')
        }
      } catch (e) {
        res.writeHead(500)
        res.end('Server error')
      }
    })

    server.listen(0, async () => {
      const port = (server.address() as any).port
      const redirectUri = `http://localhost:${port}/callback`
      const u = new URL(authUrl)
      u.searchParams.set('response_type', 'code')
      u.searchParams.set('client_id', clientId)
      u.searchParams.set('redirect_uri', redirectUri)
      u.searchParams.set('code_challenge', codeChallenge)
      u.searchParams.set('code_challenge_method', 'S256')
      if (scope) u.searchParams.set('scope', scope)

      const win = new BrowserWindow({ width: 800, height: 700, webPreferences: { nodeIntegration: false } })
      win.loadURL(u.toString())
    })
  })
})

// Plaid handlers
ipcMain.handle('plaid:setCredentials', async (_ev, clientId: string, secret: string) => {
  if (!activeSigner) throw new Error('no active signer')
  const signer = activeSigner
  const userData = app.getPath('userData')
  const pfile = path.join(userData, 'plaid.bin')
  const enc = await signer.encryptBlob(Buffer.from(JSON.stringify({ clientId, secret })))
  await fsPromises.writeFile(pfile, Buffer.from(enc))
  return { stored: true }
})

ipcMain.handle('plaid:createSandboxPublicToken', async (_ev, institution_id: string, initial_products: string[] = ['auth']) => {
  const signer = activeSigner
  if (!signer) throw new Error('no active signer')
  const creds = await getStoredPlaidCreds(signer)
  if (!creds) throw new Error('no plaid credentials stored')
  const body = { client_id: creds.clientId, secret: creds.secret, institution_id, initial_products }
  const resp = await fetch('https://sandbox.plaid.com/sandbox/public_token/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const json = await resp.json()
  return json
})

ipcMain.handle('plaid:exchangePublicToken', async (_ev, public_token: string) => {
  const signer = activeSigner
  if (!signer) throw new Error('no active signer')
  const creds = await getStoredPlaidCreds(signer)
  if (!creds) throw new Error('no plaid credentials stored')
  const body = { client_id: creds.clientId, secret: creds.secret, public_token }
  const resp = await fetch('https://sandbox.plaid.com/item/public_token/exchange', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const json = await resp.json()
  if (json && json.access_token && json.item_id) {
    const id = json.item_id
    const userData = app.getPath('userData')
    const banksDir = path.join(userData, 'banks')
    await fsPromises.mkdir(banksDir, { recursive: true })
    const enc = await signer.encryptBlob(Buffer.from(JSON.stringify(json)))
    await fsPromises.writeFile(path.join(banksDir, `${id}.bin`), Buffer.from(enc))
    await fsPromises.writeFile(path.join(banksDir, `${id}.json`), JSON.stringify({ id, name: 'plaid', oauth: true, created: Date.now() }))
  }
  return json
})

ipcMain.handle('plaid:getBalances', async (_ev, access_token: string) => {
  const signer = activeSigner
  if (!signer) throw new Error('no active signer')
  const creds = await getStoredPlaidCreds(signer)
  if (!creds) throw new Error('no plaid credentials stored')
  const body = { client_id: creds.clientId, secret: creds.secret, access_token }
  const resp = await fetch('https://sandbox.plaid.com/accounts/balance/get', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const json = await resp.json()
  return json
})

// Registry IPC handlers
ipcMain.handle('registry:get', async () => {
  return await registry.loadRegistry()
})

ipcMain.handle('registry:addChain', async (_ev, chain: registry.ChainEntry) => {
  return await registry.addChain(chain)
})

// Pre-Transfer capture: store encrypted pre-transfer info and label transactions
ipcMain.handle('transfer:storePretransfer', async (_ev, info: any) => {
  if (!activeSigner) throw new Error('no active signer')
  const id = crypto.randomBytes(6).toString('hex')
  const userData = app.getPath('userData')
  const dir = path.join(userData, 'pretransfers')
  await fsPromises.mkdir(dir, { recursive: true })
  // if brokerage not provided, attempt to detect from address
  try{
    if(!info.receivingBroker && info.address){
      try{
        const det = await detectBrokerage(info.address, info.chain)
        if(det && det.found){ info.receivingBroker = det.name }
      }catch(e){}
    }
  }catch(e){}

  const payload = { id, ...info, createdAt: Date.now() }
  const enc = await activeSigner.encryptBlob(Buffer.from(JSON.stringify(payload)))
  await fsPromises.writeFile(path.join(dir, `${id}.bin`), Buffer.from(enc))
  await fsPromises.writeFile(path.join(dir, `${id}.json`), JSON.stringify({ id, label: info.label || '', mode: info.mode || 'transfer', createdAt: Date.now() }))
  return { id }
})

ipcMain.handle('transfer:getPretransfer', async (_ev, id: string) => {
  if (!activeSigner) throw new Error('no active signer')
  const userData = app.getPath('userData')
  const dir = path.join(userData, 'pretransfers')
  try {
    const buf = await fsPromises.readFile(path.join(dir, `${id}.bin`))
    const dec = await activeSigner.decryptBlob(Buffer.from(buf))
    return { ok: true, data: JSON.parse(dec.toString()) }
  } catch (e) {
    return { ok: false, message: 'not found' }
  }
})

ipcMain.handle('transfer:listPretransfers', async () => {
  const userData = app.getPath('userData')
  const dir = path.join(userData, 'pretransfers')
  try {
    const files = await fsPromises.readdir(dir)
    const metas = files.filter(f => f.endsWith('.json'))
    const res: any[] = []
    for (const m of metas) {
      const txt = await fsPromises.readFile(path.join(dir, m), 'utf8')
      res.push(JSON.parse(txt))
    }
    return { items: res }
  } catch (e) { return { items: [] } }
})

ipcMain.handle('transfer:labelTransaction', async (_ev, tx: any, preId: string) => {
  if (!activeSigner) throw new Error('no active signer')
  // load pretransfer and attach to tx (read directly from disk)
  const userData = app.getPath('userData')
  const dir = path.join(userData, 'pretransfers')
  try {
    const buf = await fsPromises.readFile(path.join(dir, `${preId}.bin`))
    const dec = await activeSigner.decryptBlob(Buffer.from(buf))
    const info = JSON.parse(dec.toString())
    const labeled = Object.assign({}, tx, { label: info.label || info.reference || info.purpose || 'User note', pretransfer: info })
    return { ok: true, tx: labeled }
  } catch (e) {
    return { ok: false, message: 'pretransfer not found' }
  }
})

// Brokerage detection
ipcMain.handle('brokerage:detect', async (_ev, address: string, chain?: string) => {
  if(!address) return { found: false, name: 'Unknown', confidence: 0 }
  try{
    const res = await detectBrokerage(address, chain)
    return res
  }catch(e){
    return { found: false, name: 'Unknown', confidence: 0 }
  }
})

ipcMain.handle('transfer:findMetadata', async (_ev, tx: any) => {
  const userData = app.getPath('userData')
  const dir = path.join(userData, 'pretransfers')
  try{
    const files = await fsPromises.readdir(dir)
    for(const f of files.filter(x=>x.endsWith('.json'))){
      const meta = JSON.parse(await fsPromises.readFile(path.join(dir,f),'utf8'))
      const bin = path.join(dir, meta.id + '.bin')
      try{
        const buf = await fsPromises.readFile(bin)
        if(activeSigner){
          const dec = await activeSigner.decryptBlob(Buffer.from(buf))
          const info = JSON.parse(dec.toString())
          // match by address or label heuristics
          if((tx.to && info.address && tx.to === info.address) || (tx.from && info.address && tx.from === info.address)){
            return { ok: true, info }
          }
        }
      }catch(e){ }
    }
  }catch(e){ }
  return { ok: false }
})

// License verification (simulated backend)
ipcMain.handle('license:verify', async (_ev, fullName: string, email: string, licenseKey: string, deviceInfo?: any) => {
  // Prefer using a remote license registration service (e.g., hosted on Render).
  const settings = await loadSettings()
  if (settings.licenseEndpoint) {
    try {
      const payload: any = { fullName, email, licenseKey }
      if (deviceInfo) payload.device = deviceInfo
      const resp = await fetch(settings.licenseEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await resp.json()
      // Expecting remote response shape: { ok: boolean, authCode?: string, message?: string }
      if (j && typeof j.ok !== 'undefined') return j
    } catch (e) {
      // fall through to local check on error
    }
  }

  // Fallback: local license file (development/testing)
  const userData = app.getPath('userData')
  const f = path.join(userData, 'licenses.json')
  let licenses: Record<string, any> = {}
  try {
    const txt = await fsPromises.readFile(f, 'utf8')
    licenses = JSON.parse(txt)
  } catch (e) {
    // initialize with a sample license for testing
    licenses = {
      'TEST-ABCDE-12345': { used: false, assignedTo: null },
      'SAMPLE-00000-ABCDE': { used: false, assignedTo: null }
    }
  }

  const entry = licenses[licenseKey]
  if (!entry) {
    return { ok: false, message: 'License key not found' }
  }
  if (entry.used) {
    // if assigned to same email, allow re-activation
    if (entry.assignedTo && entry.assignedTo.email === email) {
      return { ok: true, authCode: entry.authCode }
    }
    return { ok: false, message: 'License key already used' }
  }

  // assign to user
  const authCode = crypto.randomBytes(6).toString('hex').toUpperCase().match(/.{1,5}/g)?.join('-') || 'AUTH-UNKNOWN'
  const meta: any = { used: true, assignedTo: { name: fullName, email }, authCode, activatedAt: Date.now() }
  if (deviceInfo) meta.boundDevices = [ deviceInfo ]
  licenses[licenseKey] = meta
  await fsPromises.writeFile(f, JSON.stringify(licenses, null, 2))
  return { ok: true, authCode }
})

ipcMain.handle('license:getStatus', async () => {
  const userData = app.getPath('userData')
  const f = path.join(userData, 'licenses.json')
  try {
    const txt = await fsPromises.readFile(f, 'utf8')
    const licenses = JSON.parse(txt)
    return { licenses }
  } catch (e) { return { licenses: {} } }
})

ipcMain.handle('registry:updateChain', async (_ev, id: string, patch: Partial<registry.ChainEntry>) => {
  return await registry.updateChain(id, patch)
})

// App metadata
ipcMain.handle('app:getVersion', async () => {
  return { version: app.getVersion() }
})

// Updates: check local update metadata (stub) and optionally query remote update server
ipcMain.handle('updates:check', async () => {
  try {
    // prefer configured update endpoint in settings
    const settings = await loadSettings()
    if (settings.updateEndpoint) {
      try {
        const resp = await fetch(settings.updateEndpoint)
        const json = await resp.json()
        return { ok: true, source: 'remote', data: json }
      } catch (e) {
        // fallback to local
      }
    }
    const def = path.join(__dirname, 'data', 'update.json')
    const txt = await fsPromises.readFile(def, 'utf8')
    const json = JSON.parse(txt)
    const current = app.getVersion()
    const updateAvailable = json.latestVersion && json.latestVersion !== current
    return { ok: true, source: 'local', data: json, currentVersion: current, updateAvailable }
  } catch (e) {
    return { ok: false, message: String(e) }
  }
})

async function checkForUpdatesOnStartup() {
  try {
    // reuse the same logic as handler: read settings and local update.json
    const settings = await loadSettings()
    if (settings.updateEndpoint) {
      try {
        // Add timeout to fetch to prevent hanging
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        try {
          const resp = await fetch(settings.updateEndpoint, { signal: controller.signal })
          const json = await resp.json()
          if (json.latestVersion && json.latestVersion !== app.getVersion()) {
            await dialog.showMessageBox({ type: 'info', title: 'Update available', message: `A new version ${json.latestVersion} is available.` })
          }
          clearTimeout(timeout)
          return
        } finally {
          clearTimeout(timeout)
        }
      } catch (e) { }
    }
    const def = path.join(__dirname, 'data', 'update.json')
    const txt = await fsPromises.readFile(def, 'utf8')
    const json = JSON.parse(txt)
    if (json.latestVersion && json.latestVersion !== app.getVersion()) {
      await dialog.showMessageBox({ type: 'info', title: 'Update available', message: `A new version ${json.latestVersion} is available.` })
    }
  } catch (e) { }
}

// Settings IPC
ipcMain.handle('settings:get', async () => {
  try {
    return await loadSettings()
  } catch (e) {
    console.error('Error loading settings:', e)
    return { language: 'en', updatedAt: Date.now(), licenseEndpoint: 'https://your-render-app.onrender.com' }
  }
})

ipcMain.handle('settings:setLanguage', async (_ev, lang: string) => {
  try {
    const s = await loadSettings()
    s.language = lang
    s.updatedAt = Date.now()
    await saveSettings(s)
    return { ok: true }
  } catch (e) {
    console.error('Error setting language:', e)
    throw e
  }
})

ipcMain.handle('settings:save', async (_ev, patch: any) => {
  try {
    const s = await loadSettings()
    const merged = Object.assign({}, s, patch)
    merged.updatedAt = Date.now()
    await saveSettings(merged)
    return { ok: true, settings: merged }
  } catch (e) {
    console.error('Error saving settings:', e)
    throw e
  }
})

// USB registered device management (secure)
ipcMain.handle('usb:listRegistered', async () => {
  const dir = registeredDevicesDir()
  try {
    const files = await fsPromises.readdir(dir)
    const metas = files.filter(f => f.endsWith('.json'))
    const res: any[] = []
    for (const m of metas) {
      const txt = await fsPromises.readFile(path.join(dir, m), 'utf8')
      res.push(JSON.parse(txt))
    }
    return { items: res }
  } catch (e) { return { items: [] } }
})

ipcMain.handle('usb:registerDevice', async (_ev, deviceInfo: any) => {
  if (!activeSigner) throw new Error('no active signer')
  const dir = registeredDevicesDir()
  await fsPromises.mkdir(dir, { recursive: true })
  const id = crypto.randomBytes(6).toString('hex')
  const payload = { id, deviceInfo, createdAt: Date.now() }
  const enc = await activeSigner.encryptBlob(Buffer.from(JSON.stringify(payload)))
  await fsPromises.writeFile(path.join(dir, `${id}.bin`), Buffer.from(enc))
  await fsPromises.writeFile(path.join(dir, `${id}.json`), JSON.stringify({ id, name: deviceInfo.name || 'USB Key', serial: deviceInfo.serial || null, status: 'backup', createdAt: Date.now() }))
  return { id }
})

ipcMain.handle('usb:removeRegisteredDevice', async (_ev, id: string) => {
  const dir = registeredDevicesDir()
  try {
    await fsPromises.unlink(path.join(dir, `${id}.bin`))
    await fsPromises.unlink(path.join(dir, `${id}.json`))
  } catch (e) { }
  return { ok: true }
})

ipcMain.handle('usb:setPrimaryDevice', async (_ev, id: string) => {
  const dir = registeredDevicesDir()
  try {
    const files = await fsPromises.readdir(dir)
    for (const f of files.filter(x => x.endsWith('.json'))) {
      const p = path.join(dir, f)
      const txt = await fsPromises.readFile(p, 'utf8')
      const meta = JSON.parse(txt)
      meta.status = meta.id === id ? 'primary' : (meta.status === 'primary' ? 'backup' : meta.status || 'backup')
      await fsPromises.writeFile(p, JSON.stringify(meta, null, 2), 'utf8')
    }
  } catch (e) { }
  return { ok: true }
})

// Validation helpers: RPC and contract checks (basic)
ipcMain.handle('validate:rpc', async (_ev, rpcUrl: string) => {
  try {
    const body = JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 })
    const resp = await fetch(rpcUrl, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } })
    const j = await resp.json()
    if (j && j.result) return { ok: true, chainId: parseInt(j.result, 16) }
    return { ok: false }
  } catch (e) { return { ok: false, message: String(e) } }
})

ipcMain.handle('validate:contract', async (_ev, rpcUrl: string, contractAddress: string) => {
  try {
    const body = JSON.stringify({ jsonrpc: '2.0', method: 'eth_getCode', params: [contractAddress, 'latest'], id: 1 })
    const resp = await fetch(rpcUrl, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } })
    const j = await resp.json()
    if (j && j.result) return { ok: true, code: j.result }
    return { ok: false }
  } catch (e) { return { ok: false, message: String(e) } }
})

ipcMain.handle('registry:addToken', async (_ev, chainId: string, token: registry.TokenEntry) => {
  return await registry.addTokenToChain(chainId, token)
})

ipcMain.handle('registry:removeToken', async (_ev, chainId: string, symbol: string) => {
  return await registry.removeToken(chainId, symbol)
})
