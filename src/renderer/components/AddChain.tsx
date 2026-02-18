import React, { useState } from 'react'
import { useI18n } from '../i18n/i18n'
import '../styles/AddChain.css'

export interface ChainConfig {
  name: string
  symbol: string
  rpcUrl: string
  chainId: number
  derivationPath: string
  decimals: number
  logo?: string
  contractAddress?: string
}

interface AddChainProps {
  onAdd: (chain: ChainConfig) => Promise<boolean>
  onCancel: () => void
  isToken?: boolean
}

export const AddChain: React.FC<AddChainProps> = ({ onAdd, onCancel, isToken = false }) => {
  const { t } = useI18n()
  const [formData, setFormData] = useState<ChainConfig>({
    name: '',
    symbol: '',
    rpcUrl: '',
    chainId: 1,
    derivationPath: "m/44'/60'/0'/0/0",
    decimals: 18,
  })
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'chainId' || name === 'decimals' ? parseInt(value) : value,
    }))
    setError('')
  }

  const validateChain = async () => {
    setValidating(true)
    try {
      // Test RPC connection with timeout
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(formData.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'net_version',
          params: [],
          id: 1,
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        setError(t('chains.chainInvalid'))
        return false
      }

      const data = await response.json()
      if (data.error) {
        setError(t('chains.chainInvalid'))
        return false
      }

      setSuccess(true)
      return true
    } catch (err) {
      console.error('Chain validation error:', err)
      setError(t('errors.networkError'))
      return false
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.name || !formData.symbol || !formData.rpcUrl || !formData.derivationPath) {
      setError(t('errors.invalidInput'))
      return
    }

    // Validate RPC URL format
    try {
      new URL(formData.rpcUrl)
    } catch {
      setError(t('chains.chainInvalid'))
      return
    }

    // Validate derivation path format
    if (!/^m\/\d+'\/\d+'\/\d+'\/\d+\/\d+$/.test(formData.derivationPath)) {
      setError('Invalid derivation path format (expected: m/44\'/60\'/0\'/0/0)')
      return
    }

    // Validate contract address if token
    if (isToken && formData.contractAddress) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(formData.contractAddress)) {
        setError('Invalid Ethereum address format')
        return
      }
    }

    const isValid = await validateChain()
    if (isValid) {
      const result = await onAdd(formData)
      if (result) {
        setFormData({
          name: '',
          symbol: '',
          rpcUrl: '',
          chainId: 1,
          derivationPath: "m/44'/60'/0'/0/0",
          decimals: 18,
        })
        setTimeout(onCancel, 1000)
      }
    }
  }

  return (
    <div className="add-chain-container">
      <h2>{isToken ? 'Add Custom Token' : 'Add Blockchain Network'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Network Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Ethereum Mainnet"
            disabled={validating}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="symbol">Symbol *</label>
            <input
              id="symbol"
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="e.g., ETH"
              maxLength={10}
              disabled={validating}
            />
          </div>

          <div className="form-group">
            <label htmlFor="decimals">Decimals *</label>
            <input
              id="decimals"
              type="number"
              name="decimals"
              value={formData.decimals}
              onChange={handleChange}
              min={0}
              max={18}
              disabled={validating}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rpcUrl">RPC URL *</label>
          <input
            id="rpcUrl"
            type="url"
            name="rpcUrl"
            value={formData.rpcUrl}
            onChange={handleChange}
            placeholder="https://rpc.example.com"
            disabled={validating}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="chainId">Chain ID *</label>
            <input
              id="chainId"
              type="number"
              name="chainId"
              value={formData.chainId}
              onChange={handleChange}
              min={1}
              disabled={validating}
            />
          </div>

          <div className="form-group">
            <label htmlFor="derivationPath">Derivation Path *</label>
            <input
              id="derivationPath"
              type="text"
              name="derivationPath"
              value={formData.derivationPath}
              onChange={handleChange}
              placeholder="m/44'/60'/0'/0/0"
              disabled={validating}
            />
          </div>
        </div>

        {isToken && (
          <div className="form-group">
            <label htmlFor="contractAddress">Contract Address</label>
            <input
              id="contractAddress"
              type="text"
              name="contractAddress"
              value={formData.contractAddress || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, contractAddress: e.target.value }))}
              placeholder="0x..."
              disabled={validating}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="logo">Logo URL</label>
          <input
            id="logo"
            type="url"
            name="logo"
            value={formData.logo || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
            placeholder="https://..."
            disabled={validating}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Configuration valid!</div>}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={validating}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={validating}
            className="btn-primary"
          >
            {validating ? 'Validating...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
