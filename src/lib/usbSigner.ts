import { HardwareSigner } from './hardwareSigner'
import { HIDSigner } from './hidSignerDevice'

// USBSigner proxies to HIDSigner when available; it no longer stores keys on filesystem.
export class USBSigner implements HardwareSigner {
  private deviceId: string
  private hid: HIDSigner | null = null

  constructor(deviceId: string) {
    this.deviceId = deviceId
  }

  async initialize(): Promise<void> {
    this.hid = new HIDSigner({ path: this.deviceId })
    await this.hid.initialize()
  }

  async generateKeyPair(chain: string): Promise<string> {
    if (!this.hid) throw new Error('not initialized')
    return this.hid.generateKeyPair(chain)
  }

  async getPublicKey(): Promise<string> { if (!this.hid) throw new Error('not initialized'); return this.hid.getPublicKey() }

  async sign(chain: string, payload: string): Promise<string> { if (!this.hid) throw new Error('not initialized'); return this.hid.sign(chain, payload) }

  async setPIN(pin: string): Promise<void> { if (!this.hid) throw new Error('not initialized'); return this.hid.setPIN(pin) }
  async verifyPIN(pin: string): Promise<boolean> { if (!this.hid) throw new Error('not initialized'); return this.hid.verifyPIN(pin) }

  async encryptBlob(data: Uint8Array): Promise<Uint8Array> { if (!this.hid) throw new Error('not initialized'); return this.hid.encryptBlob(data) }
  async decryptBlob(data: Uint8Array): Promise<Uint8Array> { if (!this.hid) throw new Error('not initialized'); return this.hid.decryptBlob(data) }
}

