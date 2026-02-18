import React, { useState, useEffect } from 'react'
import './securityKeyManager.css'

export default function SecurityKeyManager() {
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [password, setPassword] = useState('')
  const [keyName, setKeyName] = useState('')

  useEffect(() => {
    loadSecurityKeys()
  }, [])

  async function loadSecurityKeys() {
    setLoading(true)
    try {
      // @ts-ignore
      const res = await window.dvault.securityKey.list()
      if (res.ok) {
        setKeys(res.keys || [])
      } else {
        setError(res.error || 'Failed to load security keys')
      }
    } catch (e: any) {
      setError(e.message || 'Error loading security keys')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegisterKey() {
    if (!password || !keyName) {
      setError('Password and key name are required')
      return
    }

    setLoading(true)
    try {
      const deviceInfo = {
        serialNumber: `KEY-${Date.now()}`,
        manufacturer: 'Dvault',
        productId: Math.random().toString(16).substring(2)
      }

      // @ts-ignore
      const res = await window.dvault.securityKey.register(deviceInfo, password, keyName)
      if (res.ok) {
        setShowRegisterModal(false)
        setPassword('')
        setKeyName('')
        await loadSecurityKeys()
      } else {
        setError(res.error || 'Failed to register security key')
      }
    } catch (e: any) {
      setError(e.message || 'Error registering security key')
    } finally {
      setLoading(false)
    }
  }

  async function handleSetPrimary(keyId: string) {
    setLoading(true)
    try {
      // @ts-ignore
      const res = await window.dvault.securityKey.setPrimary(keyId)
      if (res.ok) {
        await loadSecurityKeys()
      } else {
        setError(res.error || 'Failed to set primary key')
      }
    } catch (e: any) {
      setError(e.message || 'Error setting primary key')
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveKey(keyId: string) {
    if (!confirm('Are you sure? This cannot be undone.')) return

    setLoading(true)
    try {
      // @ts-ignore
      const res = await window.dvault.securityKey.remove(keyId)
      if (res.ok) {
        await loadSecurityKeys()
      } else {
        setError(res.error || 'Failed to remove security key')
      }
    } catch (e: any) {
      setError(e.message || 'Error removing security key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="security-key-manager">
      <div className="security-key-header">
        <h2>🔐 Security Keys</h2>
        <p className="muted">Manage your hardware security devices and USB keys</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="security-key-controls">
        <button
          className="button"
          onClick={() => setShowRegisterModal(true)}
          disabled={loading}
        >
          + Register New Key
        </button>
        <button
          className="button button-secondary"
          onClick={loadSecurityKeys}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="security-key-empty">
          <div className="empty-icon">🔑</div>
          <h3>No Security Keys</h3>
          <p>Register a USB security key to start protecting your wallet</p>
        </div>
      ) : (
        <div className="security-keys-list">
          {keys.map((key) => (
            <div key={key.id} className={`security-key-card ${key.status}`}>
              <div className="key-header">
                <div className="key-info">
                  <h3>{key.name}</h3>
                  <p className="muted">{key.serialNumber}</p>
                </div>
                <div className={`key-badge ${key.status}`}>
                  {key.status === 'primary' ? '⭐ Primary' : '💾 Backup'}
                </div>
              </div>

              <div className="key-details">
                <div className="detail">
                  <span className="label">Manufacturer:</span>
                  <span className="value">{key.manufacturer}</span>
                </div>
                <div className="detail">
                  <span className="label">Created:</span>
                  <span className="value">{new Date(key.createdAt).toLocaleDateString()}</span>
                </div>
                {key.lastUsed && (
                  <div className="detail">
                    <span className="label">Last Used:</span>
                    <span className="value">{new Date(key.lastUsed).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="key-actions">
                {key.status !== 'primary' && (
                  <button
                    className="button button-secondary"
                    onClick={() => handleSetPrimary(key.id)}
                    disabled={loading}
                  >
                    Make Primary
                  </button>
                )}
                <button
                  className="button button-danger"
                  onClick={() => handleRemoveKey(key.id)}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Register New Security Key</h3>
              <button
                className="modal-close"
                onClick={() => setShowRegisterModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>
                Connect your USB security device and enter a strong password to protect it.
              </p>

              <div className="form-group">
                <label htmlFor="key-name">Key Name</label>
                <input
                  id="key-name"
                  type="text"
                  placeholder="e.g., My Hardware Wallet"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="key-password">Password</label>
                <input
                  id="key-password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <p className="password-hint">
                  ⚠️ Use a strong password. You'll need it to sign transactions.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="button button-secondary"
                onClick={() => setShowRegisterModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="button"
                onClick={handleRegisterKey}
                disabled={loading || !password || !keyName}
              >
                {loading ? 'Registering...' : 'Register Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
