import { HardwareSigner } from './hardwareSigner'
import { generateKeyPairSync, createSign } from 'crypto'
import crypto from 'crypto'

export class MockSigner implements HardwareSigner {
  private privateKeyPem: string | null = null
  private publicKeyPem: string | null = null
  private pinHash: string | null = null
  private vaultKey: Buffer | null = null // 32 bytes AES key

  async initialize(): Promise<void> {
    // Generate a vault master key inside the mock signer (simulates hardware storage)
    this.vaultKey = crypto.randomBytes(32)
  }

  async generateKeyPair(_chain: string): Promise<string> {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519')
    this.privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    this.publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString()
    return this.publicKeyPem
  }

  async getPublicKey(): Promise<string> {
    if (!this.publicKeyPem) throw new Error('no key')
    return this.publicKeyPem
  }

  async sign(_chain: string, payload: string): Promise<string> {
    if (!this.privateKeyPem) throw new Error('no private key')
    const chain = (_chain || '').toUpperCase()
    // If payload looks like an object, try to sign chain-specific format
    try {
      const obj = JSON.parse(payload)
      if (chain === 'XRP') return this.signXRP(obj)
      if (chain === 'XLM') return this.signXLM(obj)
    } catch (e) {
      // fallback to generic signing
    }
    const sign = createSign('SHA256')
    sign.update(payload)
    sign.end()
    const signature = sign.sign(this.privateKeyPem, 'base64')
    return signature
  }

  private signXRP(unsignedTx: any): string {
    // Mock XRP signing: include original tx and a base64 signature
    const payload = JSON.stringify(unsignedTx)
    const sign = createSign('SHA256')
    sign.update(payload)
    sign.end()
    const signature = sign.sign(this.privateKeyPem!, 'base64')
    const signed = { tx: unsignedTx, signature }
    return Buffer.from(JSON.stringify(signed)).toString('base64')
  }

  private signXLM(unsignedTx: any): string {
    // Mock XLM signing: similar structure
    const payload = JSON.stringify(unsignedTx)
    const sign = createSign('SHA256')
    sign.update(payload)
    sign.end()
    const signature = sign.sign(this.privateKeyPem!, 'base64')
    const signed = { tx: unsignedTx, signature }
    return Buffer.from(JSON.stringify(signed)).toString('base64')
  }

  async setPIN(pin: string): Promise<void> {
    // store a simple hash of the PIN
    this.pinHash = crypto.createHash('sha256').update(pin).digest('hex')
  }

  async verifyPIN(pin: string): Promise<boolean> {
    if (!this.pinHash) return false
    const h = crypto.createHash('sha256').update(pin).digest('hex')
    return h === this.pinHash
  }

  async encryptBlob(data: Uint8Array): Promise<Uint8Array> {
    if (!this.vaultKey) throw new Error('vault key missing')
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.vaultKey, iv)
    const ct = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()])
    const tag = cipher.getAuthTag()
    // output: iv (12) | tag (16) | ciphertext
    return Buffer.concat([iv, tag, ct])
  }

  async decryptBlob(data: Uint8Array): Promise<Uint8Array> {
    if (!this.vaultKey) throw new Error('vault key missing')
    const buf = Buffer.from(data)
    const iv = buf.slice(0, 12)
    const tag = buf.slice(12, 28)
    const ct = buf.slice(28)
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.vaultKey, iv)
    decipher.setAuthTag(tag)
    const out = Buffer.concat([decipher.update(ct), decipher.final()])
    return out
  }
}

