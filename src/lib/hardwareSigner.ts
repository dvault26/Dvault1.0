export interface HardwareSigner {
  initialize(): Promise<void>
  generateKeyPair(chain: string): Promise<string>
  getPublicKey(): Promise<string>
  sign(chain: string, payload: string): Promise<string>
  setPIN(pin: string): Promise<void>
  verifyPIN(pin: string): Promise<boolean>
  // Vault encryption/decryption
  encryptBlob(data: Uint8Array): Promise<Uint8Array>
  decryptBlob(data: Uint8Array): Promise<Uint8Array>
}
