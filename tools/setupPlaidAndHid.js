const HID = (() => { try { return require('node-hid') } catch (e) { return null } })()
const crypto = require('crypto')
const fs = require('fs')
const fsPromises = fs.promises
const path = require('path')
const os = require('os')

function getUserDataPath() {
  const appData = process.env.APPDATA || (process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Application Support') : path.join(os.homedir(), '.config'))
  return path.join(appData, 'Dvault')
}

function aesEncrypt(key, data) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ct = Buffer.concat([cipher.update(data), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ct])
}

function aesDecrypt(key, buf) {
  const iv = buf.slice(0,12)
  const tag = buf.slice(12,28)
  const ct = buf.slice(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()])
}

async function ensureHidDevice() {
  const devices = HID ? HID.devices() : []
  if (!devices.length) {
    console.log('No HID devices found, will create filesystem-emulated device')
    return null
  }
  // pick first
  return devices[0]
}

async function initSignerForDevice(deviceInfo) {
  const userData = getUserDataPath()
  const rawId = deviceInfo ? (deviceInfo.path || `${deviceInfo.vendorId}-${deviceInfo.productId}`) : 'local-dev'
  // sanitize rawId for filesystem
  const safeId = rawId.toString().replace(/[^a-zA-Z0-9._-]/g, '_')
  const baseDir = path.join(userData, 'hid-devices', safeId)
  await fsPromises.mkdir(baseDir, { recursive: true })
  const vaultFile = path.join(baseDir, 'vaultKey')
  let vaultKey
  try { vaultKey = await fsPromises.readFile(vaultFile) } catch (e) { vaultKey = crypto.randomBytes(32); await fsPromises.writeFile(vaultFile, vaultKey) }
  const pubFile = path.join(baseDir, 'public.pem')
  const privFile = path.join(baseDir, 'private.pem')
  let publicPem, privatePem
  try { publicPem = await fsPromises.readFile(pubFile, 'utf8'); privatePem = await fsPromises.readFile(privFile, 'utf8') } catch (e) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519')
    privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
    await fsPromises.writeFile(pubFile, publicPem)
    await fsPromises.writeFile(privFile, privatePem)
  }
  return { vaultKey, publicPem, privatePem, baseDir }
}

async function storePlaidCreds(signer, clientId, secret) {
  const userData = getUserDataPath()
  const pfile = path.join(userData, 'plaid.bin')
  const payload = JSON.stringify({ clientId, secret })
  const enc = aesEncrypt(signer.vaultKey, Buffer.from(payload))
  await fsPromises.mkdir(userData, { recursive: true })
  await fsPromises.writeFile(pfile, enc)
  console.log('Stored encrypted Plaid creds at', pfile)
}

async function createSandboxPublicToken(signer, institution_id) {
  const credsBuf = await fsPromises.readFile(path.join(getUserDataPath(), 'plaid.bin'))
  const creds = JSON.parse(aesDecrypt(signer.vaultKey, credsBuf).toString())
  const body = { client_id: creds.clientId, secret: creds.secret, institution_id, initial_products: ['auth','transactions'] }
  console.log('Calling Plaid sandbox public_token/create...')
  const resp = await fetch('https://sandbox.plaid.com/sandbox/public_token/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const json = await resp.json()
  return json
}

async function exchangePublicToken(signer, public_token) {
  const credsBuf = await fsPromises.readFile(path.join(getUserDataPath(), 'plaid.bin'))
  const creds = JSON.parse(aesDecrypt(signer.vaultKey, credsBuf).toString())
  const body = { client_id: creds.clientId, secret: creds.secret, public_token }
  console.log('Exchanging public_token for access_token...')
  const resp = await fetch('https://sandbox.plaid.com/item/public_token/exchange', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const json = await resp.json()
  if (json && json.access_token && json.item_id) {
    const id = json.item_id
    const userData = getUserDataPath()
    const banksDir = path.join(userData, 'banks')
    await fsPromises.mkdir(banksDir, { recursive: true })
    const enc = aesEncrypt(signer.vaultKey, Buffer.from(JSON.stringify(json)))
    await fsPromises.writeFile(path.join(banksDir, `${id}.bin`), enc)
    await fsPromises.writeFile(path.join(banksDir, `${id}.json`), JSON.stringify({ id, name: 'plaid', oauth: true, created: Date.now() }))
    console.log('Stored item under', path.join(banksDir, `${id}.bin`))
  }
  return json
}

async function main(){
  const deviceRaw = await ensureHidDevice()
  const signer = await initSignerForDevice(deviceRaw)
  console.log('Signer initialized. Public key length:', signer.publicPem.length)

  // Plaid creds from user (hard-coded per user's message)
  const clientId = '694db382168aa50020a892cc'
  const secret = 'e80331dc8272728343d789300009f8'

  await storePlaidCreds(signer, clientId, secret)
  const pub = await createSandboxPublicToken(signer, 'ins_109508')
  console.log('public_token response:', pub)
  if (pub && pub.public_token) {
    const ex = await exchangePublicToken(signer, pub.public_token)
    console.log('exchange response:', ex)
  }
}

main().then(()=>console.log('Done')).catch(e=>{console.error(e); process.exit(1)})
