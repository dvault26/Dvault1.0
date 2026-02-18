import { HardwareSigner } from './hardwareSigner'
import fsPromises from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { app } from 'electron'

let HID: any = null
try {
  // dynamic require so build doesn't fail where node-hid unavailable
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  HID = require('node-hid')
} catch (e) {
  HID = null
}

function devicePath(deviceId: string) {
  const userData = app.getPath('userData')
  return path.join(userData, 'hid-devices', deviceId)
}

export class HIDSigner implements HardwareSigner {
  private deviceInfo: any
  private basePath: string
  private deviceHandle: any = null
  private vaultKey: Buffer | null = null
  private privateKeyPem: string | null = null
  private publicKeyPem: string | null = null
  private pinHash: string | null = null

  constructor(deviceInfo: any) {
    this.deviceInfo = deviceInfo
    this.basePath = devicePath(deviceInfo.path || `${deviceInfo.vendorId}-${deviceInfo.productId}`)
  }

  async initialize(): Promise<void> {
    await fsPromises.mkdir(this.basePath, { recursive: true })
    const vaultFile = path.join(this.basePath, 'vaultKey')
    try { this.vaultKey = Buffer.from(await fsPromises.readFile(vaultFile)) } catch (e) { this.vaultKey = crypto.randomBytes(32); await fsPromises.writeFile(vaultFile, this.vaultKey) }
    const pubFile = path.join(this.basePath, 'public.pem')
    const privFile = path.join(this.basePath, 'private.pem')
    try {
      this.publicKeyPem = (await fsPromises.readFile(pubFile)).toString()
      this.privateKeyPem = (await fsPromises.readFile(privFile)).toString()
    } catch (e) {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519')
      this.privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
      this.publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
      await fsPromises.writeFile(pubFile, this.publicKeyPem)
      await fsPromises.writeFile(privFile, this.privateKeyPem)
    }

    const pinFile = path.join(this.basePath, 'pin')
    try { this.pinHash = (await fsPromises.readFile(pinFile)).toString() } catch (e) { }

    if (HID && this.deviceInfo) {
      try {
        this.deviceHandle = new HID.HID(this.deviceInfo.path || this.deviceInfo.productId || '')
      } catch (e) {
        this.deviceHandle = null
      }
    }
  }

  async generateKeyPair(_chain: string): Promise<string> {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519')
    this.privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    this.publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
    await fsPromises.writeFile(path.join(this.basePath, 'public.pem'), this.publicKeyPem)
    await fsPromises.writeFile(path.join(this.basePath, 'private.pem'), this.privateKeyPem)
    return this.publicKeyPem
  }

  async getPublicKey(): Promise<string> { if (!this.publicKeyPem) throw new Error('no public key'); return this.publicKeyPem }

  async sign(_chain: string, payload: string): Promise<string> {
    // Prefer asking the device to sign if a HID handle exists
    if (this.deviceHandle) {
      try {
        const req = JSON.stringify({ cmd: 'sign', chain: _chain, payload })
        const buf = Buffer.from(req)
        // node-hid write expects an array; prefix with 0 report id
        const arr = [0].concat(Array.from(buf))
        try { this.deviceHandle.write(arr) } catch (e) { /* ignore write errors */ }
        // attempt synchronous read (may block); fallback to readTimeout if available
        let resp: any = null
        try {
          resp = this.deviceHandle.readTimeout ? this.deviceHandle.readTimeout(5000) : this.deviceHandle.read()
        } catch (e) {
          // ignore
        }
        if (resp) {
          const rbuf = Buffer.from(resp instanceof Buffer ? resp : resp.buffer || resp)
          // attempt to parse JSON response
          try {
            const text = rbuf.toString().replace(/\0+$/g, '')
            const obj = JSON.parse(text)
            if (obj && obj.signature) return obj.signature
          } catch (e) {
            // fallthrough
          }
        }
      } catch (e) {
        // fallthrough to local signing
      }
    }

    if (!this.privateKeyPem) throw new Error('no private key')
    const sign = crypto.createSign('SHA256')
    try {
      const obj = JSON.parse(payload)
      const signPayload = JSON.stringify(obj)
      sign.update(signPayload)
    } catch (e) {
      sign.update(payload)
    }
    sign.end()
    return sign.sign(this.privateKeyPem, 'base64')
  }

  async setPIN(pin: string): Promise<void> { this.pinHash = crypto.createHash('sha256').update(pin).digest('hex'); await fsPromises.writeFile(path.join(this.basePath, 'pin'), this.pinHash) }
  async verifyPIN(pin: string): Promise<boolean> { if (!this.pinHash) return false; return crypto.createHash('sha256').update(pin).digest('hex') === this.pinHash }

  async encryptBlob(data: Uint8Array): Promise<Uint8Array> { if (!this.vaultKey) throw new Error('vault key missing'); const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm', this.vaultKey, iv); const ct = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]); const tag = cipher.getAuthTag(); return Buffer.concat([iv, tag, ct]) }
  async decryptBlob(data: Uint8Array): Promise<Uint8Array> { if (!this.vaultKey) throw new Error('vault key missing'); const buf = Buffer.from(data); const iv = buf.slice(0,12); const tag = buf.slice(12,28); const ct = buf.slice(28); const decipher = crypto.createDecipheriv('aes-256-gcm', this.vaultKey, iv); decipher.setAuthTag(tag); const out = Buffer.concat([decipher.update(ct), decipher.final()]); return out }
}

export async function listHidDevices() {
  if (!HID) return []
  try {
    const devices = HID.devices()
    return devices
  } catch (e) { return [] }
}
