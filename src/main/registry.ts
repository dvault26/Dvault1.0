import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'

export type TokenEntry = {
  symbol: string
  contractAddress?: string
  decimals?: number
  logo?: string
}

export type ChainEntry = {
  id: string // internal id like 'ethereum'
  name: string
  rpc?: string
  chainId?: number
  type?: 'EVM' | 'UTXO' | 'STELLAR' | 'XRP' | 'OTHER'
  derivation?: string
  logo?: string
  tokens?: TokenEntry[]
}

export type Registry = {
  chains: ChainEntry[]
}

const defaultRegistry: Registry = {
  chains: [
    { id: 'ethereum', name: 'Ethereum', rpc: '', chainId: 1, type: 'EVM', tokens: [] },
    { id: 'polygon', name: 'Polygon', rpc: '', chainId: 137, type: 'EVM', tokens: [] },
    { id: 'avalanche', name: 'Avalanche', rpc: '', chainId: 43114, type: 'EVM', tokens: [] },
    { id: 'bsc', name: 'BNB Chain', rpc: '', chainId: 56, type: 'EVM', tokens: [] },
    { id: 'mutuum', name: 'Mutuum Finance', rpc: '', type: 'EVM', tokens: [] },
    { id: 'solana', name: 'Solana', rpc: '', type: 'OTHER', tokens: [] },
    { id: 'xrp', name: 'XRP Ledger', rpc: '', type: 'XRP', tokens: [] },
    { id: 'stellar', name: 'Stellar', rpc: '', type: 'STELLAR', tokens: [] }
  ]
}

function registryPath() {
  const userData = app.getPath('userData')
  return path.join(userData, 'registry.json')
}

export async function loadRegistry(): Promise<Registry> {
  const p = registryPath()
  try {
    const raw = await fs.readFile(p, 'utf8')
    return JSON.parse(raw) as Registry
  } catch (e) {
    await saveRegistry(defaultRegistry)
    return defaultRegistry
  }
}

export async function saveRegistry(reg: Registry): Promise<void> {
  const p = registryPath()
  await fs.writeFile(p, JSON.stringify(reg, null, 2), 'utf8')
}

export async function addChain(chain: ChainEntry): Promise<Registry> {
  const reg = await loadRegistry()
  reg.chains.push(chain)
  await saveRegistry(reg)
  return reg
}

export async function updateChain(id: string, patch: Partial<ChainEntry>): Promise<Registry> {
  const reg = await loadRegistry()
  const idx = reg.chains.findIndex(c => c.id === id)
  if (idx === -1) throw new Error('chain not found')
  reg.chains[idx] = { ...reg.chains[idx], ...patch }
  await saveRegistry(reg)
  return reg
}

export async function addTokenToChain(chainId: string, token: TokenEntry): Promise<Registry> {
  const reg = await loadRegistry()
  const ch = reg.chains.find(c => c.id === chainId)
  if (!ch) throw new Error('chain not found')
  ch.tokens = ch.tokens || []
  ch.tokens.push(token)
  await saveRegistry(reg)
  return reg
}

export async function removeToken(chainId: string, symbol: string): Promise<Registry> {
  const reg = await loadRegistry()
  const ch = reg.chains.find(c => c.id === chainId)
  if (!ch) throw new Error('chain not found')
  ch.tokens = (ch.tokens || []).filter(t => t.symbol !== symbol)
  await saveRegistry(reg)
  return reg
}
