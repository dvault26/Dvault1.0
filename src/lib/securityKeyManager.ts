/**
 * USB Security Key Manager
 * 
 * Manages secure hardware wallets and USB security devices
 * Implements encrypted key storage and signing operations
 */

import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'
import { app } from 'electron'

export interface SecurityKey {
  id: string
  name: string
  serialNumber: string
  manufacturer: string
  type: 'hardware_wallet' | 'security_key' | 'hid_device'
  status: 'primary' | 'backup' | 'inactive'
  createdAt: number
  lastUsed?: number
  metadata?: Record<string, any>
}

export interface EncryptedKeystore {
  version: string
  algorithm: string
  iv: string
  salt: string
  encryptedData: string
}

export class SecurityKeyManager {
  private keystorePath: string
  private masterPassword: Buffer | null = null
  private keys: Map<string, SecurityKey> = new Map()
  private deviceCache: Map<string, any> = new Map()

  constructor() {
    const userData = app.getPath('userData')
    this.keystorePath = path.join(userData, 'security-keys')
  }

  /**
   * Initialize the security key manager
   * Creates necessary directories and loads existing keys
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.keystorePath, { recursive: true })
      await this.loadKeys()
      console.log('[SecurityKeyManager] Initialized successfully')
    } catch (error) {
      console.error('[SecurityKeyManager] Initialization failed:', error)
      throw error
    }
  }

  /**
   * Register a new security key device
   */
  async registerSecurityKey(
    deviceInfo: any,
    masterPassword: string,
    name: string
  ): Promise<SecurityKey> {
    try {
      const keyId = crypto.randomBytes(16).toString('hex')
      const now = Date.now()

      const securityKey: SecurityKey = {
        id: keyId,
        name: name || `Security Key ${now}`,
        serialNumber: deviceInfo.serialNumber || `${deviceInfo.vendorId}-${deviceInfo.productId}`,
        manufacturer: deviceInfo.manufacturer || 'Unknown',
        type: 'hid_device',
        status: this.keys.size === 0 ? 'primary' : 'backup',
        createdAt: now,
        metadata: {
          vendorId: deviceInfo.vendorId,
          productId: deviceInfo.productId,
          path: deviceInfo.path
        }
      }

      // Store encrypted device data
      await this.encryptAndStoreKey(keyId, deviceInfo, masterPassword)

      // Store metadata (not encrypted)
      const metaPath = path.join(this.keystorePath, `${keyId}.json`)
      await fs.writeFile(metaPath, JSON.stringify(securityKey, null, 2), 'utf8')

      this.keys.set(keyId, securityKey)
      return securityKey
    } catch (error) {
      console.error('[SecurityKeyManager] Registration failed:', error)
      throw error
    }
  }

  /**
   * Encrypt and store security key data
   */
  private async encryptAndStoreKey(
    keyId: string,
    data: any,
    password: string
  ): Promise<void> {
    const salt = crypto.randomBytes(16)
    const iv = crypto.randomBytes(16)

    // Derive key from password
    const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')

    // Encrypt data
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv)
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final()
    ])
    const authTag = cipher.getAuthTag()

    // Store encrypted data
    const encryptedKeystore: EncryptedKeystore = {
      version: '1.0',
      algorithm: 'aes-256-gcm',
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      encryptedData: Buffer.concat([encrypted, authTag]).toString('hex')
    }

    const dataPath = path.join(this.keystorePath, `${keyId}.bin`)
    await fs.writeFile(dataPath, JSON.stringify(encryptedKeystore), 'utf8')
  }

  /**
   * Decrypt and retrieve security key data
   */
  private async decryptStoredKey(
    keyId: string,
    password: string
  ): Promise<any> {
    try {
      const dataPath = path.join(this.keystorePath, `${keyId}.bin`)
      const content = await fs.readFile(dataPath, 'utf8')
      const keystore: EncryptedKeystore = JSON.parse(content)

      const salt = Buffer.from(keystore.salt, 'hex')
      const iv = Buffer.from(keystore.iv, 'hex')
      const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')

      const encryptedBuffer = Buffer.from(keystore.encryptedData, 'hex')
      const encrypted = encryptedBuffer.slice(0, -16)
      const authTag = encryptedBuffer.slice(-16)

      const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv)
      decipher.setAuthTag(authTag)

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ])

      return JSON.parse(decrypted.toString('utf8'))
    } catch (error) {
      console.error('[SecurityKeyManager] Decryption failed:', error)
      throw new Error('Failed to decrypt security key data')
    }
  }

  /**
   * Load all security keys from storage
   */
  private async loadKeys(): Promise<void> {
    try {
      const files = await fs.readdir(this.keystorePath)
      const metaFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('.'))

      for (const file of metaFiles) {
        const metaPath = path.join(this.keystorePath, file)
        const content = await fs.readFile(metaPath, 'utf8')
        const key: SecurityKey = JSON.parse(content)
        this.keys.set(key.id, key)
      }

      console.log(`[SecurityKeyManager] Loaded ${this.keys.size} security keys`)
    } catch (error) {
      console.error('[SecurityKeyManager] Failed to load keys:', error)
    }
  }

  /**
   * Get all registered security keys
   */
  async listSecurityKeys(): Promise<SecurityKey[]> {
    return Array.from(this.keys.values())
  }

  /**
   * Get a specific security key
   */
  async getSecurityKey(keyId: string): Promise<SecurityKey | undefined> {
    return this.keys.get(keyId)
  }

  /**
   * Set a security key as primary
   */
  async setPrimarySecurityKey(keyId: string): Promise<void> {
    try {
      // Remove primary status from all other keys
      for (const [id, key] of this.keys) {
        if (key.status === 'primary') {
          key.status = 'backup'
          await this.updateKeyMetadata(id, key)
        }
      }

      // Set as primary
      const key = this.keys.get(keyId)
      if (key) {
        key.status = 'primary'
        await this.updateKeyMetadata(keyId, key)
      }
    } catch (error) {
      console.error('[SecurityKeyManager] Failed to set primary key:', error)
      throw error
    }
  }

  /**
   * Remove a security key
   */
  async removeSecurityKey(keyId: string): Promise<void> {
    try {
      const key = this.keys.get(keyId)
      if (!key) throw new Error('Security key not found')

      // Delete files
      const metaPath = path.join(this.keystorePath, `${keyId}.json`)
      const dataPath = path.join(this.keystorePath, `${keyId}.bin`)

      await fs.unlink(metaPath).catch(() => {})
      await fs.unlink(dataPath).catch(() => {})

      this.keys.delete(keyId)
      this.deviceCache.delete(keyId)

      console.log(`[SecurityKeyManager] Removed security key: ${keyId}`)
    } catch (error) {
      console.error('[SecurityKeyManager] Failed to remove key:', error)
      throw error
    }
  }

  /**
   * Update security key metadata
   */
  private async updateKeyMetadata(keyId: string, key: SecurityKey): Promise<void> {
    const metaPath = path.join(this.keystorePath, `${keyId}.json`)
    await fs.writeFile(metaPath, JSON.stringify(key, null, 2), 'utf8')
  }

  /**
   * Sign data using a security key
   */
  async signWithSecurityKey(
    keyId: string,
    data: Buffer,
    password: string
  ): Promise<Buffer> {
    try {
      const key = this.keys.get(keyId)
      if (!key) throw new Error('Security key not found')

      // Decrypt key data
      const keyData = await this.decryptStoredKey(keyId, password)

      // Create signature
      const hmac = crypto.createHmac('sha256', Buffer.from(keyData.secret || keyData.privateKey))
      const signature = hmac.update(data).digest()

      // Update last used timestamp
      key.lastUsed = Date.now()
      await this.updateKeyMetadata(keyId, key)

      return signature
    } catch (error) {
      console.error('[SecurityKeyManager] Signing failed:', error)
      throw error
    }
  }

  /**
   * Verify signature using a security key
   */
  async verifySignature(
    keyId: string,
    data: Buffer,
    signature: Buffer,
    password: string
  ): Promise<boolean> {
    try {
      const key = this.keys.get(keyId)
      if (!key) throw new Error('Security key not found')

      const keyData = await this.decryptStoredKey(keyId, password)
      const expectedSig = crypto.createHmac('sha256', Buffer.from(keyData.secret || keyData.privateKey))
        .update(data)
        .digest()

      return signature.equals(expectedSig)
    } catch (error) {
      console.error('[SecurityKeyManager] Verification failed:', error)
      return false
    }
  }

  /**
   * Export security key (encrypted)
   */
  async exportSecurityKey(keyId: string, password: string): Promise<string> {
    try {
      const key = this.keys.get(keyId)
      if (!key) throw new Error('Security key not found')

      const dataPath = path.join(this.keystorePath, `${keyId}.bin`)
      const content = await fs.readFile(dataPath, 'utf8')

      return `dvault-key:${keyId}:${Buffer.from(content).toString('base64')}`
    } catch (error) {
      console.error('[SecurityKeyManager] Export failed:', error)
      throw error
    }
  }

  /**
   * Import security key (encrypted)
   */
  async importSecurityKey(
    exportedKey: string,
    password: string
  ): Promise<SecurityKey> {
    try {
      const [prefix, keyId, dataB64] = exportedKey.split(':')
      if (prefix !== 'dvault-key') throw new Error('Invalid export format')

      const dataPath = path.join(this.keystorePath, `${keyId}.bin`)
      const content = Buffer.from(dataB64, 'base64').toString('utf8')

      await fs.writeFile(dataPath, content, 'utf8')

      // Verify by decrypting
      const decryptedData = await this.decryptStoredKey(keyId, password)

      await this.loadKeys()
      const key = this.keys.get(keyId)
      if (!key) throw new Error('Failed to import security key')

      return key
    } catch (error) {
      console.error('[SecurityKeyManager] Import failed:', error)
      throw error
    }
  }
}

export default new SecurityKeyManager()
