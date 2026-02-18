import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'

export type ExchangeEntry = {
  id: string
  name: string
  chains: string[]
  addresses: string[] // exact or regex patterns
  notes?: string
}

export type DetectionResult = {
  found: boolean
  id?: string
  name?: string
  confidence: number
  evidence?: { type: 'exact' | 'pattern' | 'heuristic'; pattern?: string; matchedAddress?: string }
}

function dataPath() {
  const userData = app.getPath('userData')
  return path.join(userData, 'known_exchanges.json')
}

async function loadDefault(): Promise<{ exchanges: ExchangeEntry[] }> {
  const p = path.join(__dirname, 'data', 'known_exchanges.json')
  const raw = await fs.readFile(p, 'utf8')
  return JSON.parse(raw)
}

let cache: ExchangeEntry[] | null = null

export async function loadExchanges(): Promise<ExchangeEntry[]> {
  if (cache) return cache
  const p = dataPath()
  try {
    const raw = await fs.readFile(p, 'utf8')
    const parsed = JSON.parse(raw)
    cache = parsed.exchanges || []
    return cache || []
  } catch (e) {
    const def = await loadDefault()
    cache = def.exchanges || []
    // persist a copy into userData for user editability
    try { await fs.writeFile(p, JSON.stringify(def, null, 2), 'utf8') } catch (_) {}
    return cache || []
  }
}

function normalize(addr: string): string {
  return addr.trim()
}

export async function detectBrokerage(address: string, chain?: string): Promise<DetectionResult> {
  const addr = normalize(address)
  const ex = await loadExchanges()

  // Exact match
  for (const e of ex) {
    if (chain && e.chains && !e.chains.includes(chain)) continue
    for (const a of e.addresses) {
      if (!a) continue
      if (!a.includes('.*') && a.toLowerCase() === addr.toLowerCase()) {
        return { found: true, id: e.id, name: e.name, confidence: 0.99, evidence: { type: 'exact', matchedAddress: a } }
      }
    }
  }

  // Pattern/regex match
  for (const e of ex) {
    if (chain && e.chains && !e.chains.includes(chain)) continue
    for (const a of e.addresses) {
      if (!a) continue
      if (a.includes('.*') || a.includes('^') || a.includes('$')) {
        try {
          const re = new RegExp(a, 'i')
          if (re.test(addr)) {
            return { found: true, id: e.id, name: e.name, confidence: 0.85, evidence: { type: 'pattern', pattern: a, matchedAddress: addr } }
          }
        } catch (err) {
          // ignore invalid regex
        }
      }
    }
  }

  // Substring/prefix heuristics
  for (const e of ex) {
    if (chain && e.chains && !e.chains.includes(chain)) continue
    for (const a of e.addresses) {
      if (!a) continue
      const simple = a.replace(/\W/g, '')
      if (!simple) continue
      if (addr.toLowerCase().includes(simple.toLowerCase())) {
        return { found: true, id: e.id, name: e.name, confidence: 0.7, evidence: { type: 'heuristic', pattern: a, matchedAddress: addr } }
      }
    }
  }

  return { found: false, confidence: 0 }
}

// convenience sync wrapper
export function clearCache() { cache = null }
