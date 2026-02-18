import { HardwareSigner } from './hardwareSigner'
import crypto from 'crypto'

let HID: any = null
try {
  // dynamic require so build doesn't fail where node-hid unavailable
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  HID = require('node-hid')
} catch (e) {
  HID = null
}

function toReportArray(buf: Buffer) {
  return [0].concat(Array.from(buf))
}

export class HIDSigner implements HardwareSigner {
  private deviceInfo: any
  private deviceHandle: any = null
  private publicKeyPem: string | null = null

  constructor(deviceInfo: any) {
    this.deviceInfo = deviceInfo
  }

  private async sendCommand(cmdObj: any, timeout = 5000): Promise<any> {
    if (!this.deviceHandle) throw new Error('no device handle')
    const req = JSON.stringify(cmdObj)
    const buf = Buffer.from(req)
    const arr = toReportArray(buf)
    try {
      this.deviceHandle.write(arr)
    } catch (e) {
      // write may fail
    }
    // try read
    try {
      const resp = this.deviceHandle.readTimeout ? this.deviceHandle.readTimeout(timeout) : this.deviceHandle.read()
      if (!resp) throw new Error('no response')
      const rbuf = Buffer.from(resp instanceof Buffer ? resp : resp.buffer || resp)
      const text = rbuf.toString().replace(/\0+$/g, '')
      return JSON.parse(text)
    } catch (e) {
      throw new Error('device no response or parse error')
    }
  }

  async initialize(): Promise<void> {
    if (!HID) throw new Error('node-hid not available')
    try {
      this.deviceHandle = new HID.HID(this.deviceInfo.path || this.deviceInfo.productId || this.deviceInfo)
    } catch (e) {
      throw new Error('unable to open HID device')
    }
    // request public key from device
    const resp = await this.sendCommand({ cmd: 'get_public' })
    if (!resp || !resp.publicKey) throw new Error('device did not provide public key')
    this.publicKeyPem = resp.publicKey
  }

  async generateKeyPair(_chain: string): Promise<string> {
    const resp = await this.sendCommand({ cmd: 'generate_key' })
    if (!resp || !resp.publicKey) throw new Error('generate_key failed')
    this.publicKeyPem = resp.publicKey
    return this.publicKeyPem as string
  }

  async getPublicKey(): Promise<string> { if (!this.publicKeyPem) throw new Error('no public key'); return this.publicKeyPem as string }

  async sign(chain: string, payload: string): Promise<string> {
    const resp = await this.sendCommand({ cmd: 'sign', chain, payload })
    if (!resp || !resp.signature) throw new Error('sign failed')
    return resp.signature
  }

  async setPIN(pin: string): Promise<void> { await this.sendCommand({ cmd: 'set_pin', pin }) }
  async verifyPIN(pin: string): Promise<boolean> { const r = await this.sendCommand({ cmd: 'verify_pin', pin }); return !!r.ok }

  async encryptBlob(data: Uint8Array): Promise<Uint8Array> { const resp = await this.sendCommand({ cmd: 'encrypt', data: Buffer.from(data).toString('base64') }); if (!resp || !resp.cipher) throw new Error('encrypt failed'); return Buffer.from(resp.cipher, 'base64') }
  async decryptBlob(data: Uint8Array): Promise<Uint8Array> { const resp = await this.sendCommand({ cmd: 'decrypt', data: Buffer.from(data).toString('base64') }); if (!resp || !resp.plain) throw new Error('decrypt failed'); return Buffer.from(resp.plain, 'base64') }
}

export async function listHidDevices() {
  if (!HID) return []
  try {
    const devices = HID.devices()
    return devices
  } catch (e) { return [] }
}
