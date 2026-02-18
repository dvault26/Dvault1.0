/**
 * LicenseClient - small internal module for talking to a license/registration service.
 *
 * Features:
 * - Configurable base URL and endpoint paths
 * - Methods: verifyLicense, getStatus, ping
 * - JSON fetch with timeout and basic error handling
 */

type VerifyRequest = { fullName: string; email: string; licenseKey: string }
type VerifyResponse = { ok: boolean; authCode?: string; message?: string; [k: string]: any }
type StatusResponse = { ok: boolean; licenses?: any; message?: string }

export interface LicenseClientOptions {
  baseUrl: string
  paths?: {
    verify?: string
    status?: string
    ping?: string
  }
  timeoutMs?: number
}

function timeoutPromise<T>(ms: number, p: Promise<T>) {
  const t = new Promise<T>((_res, rej) => setTimeout(() => rej(new Error('timeout')), ms))
  return Promise.race([p, t]) as Promise<T>
}

export class LicenseClient {
  baseUrl: string
  paths: Required<NonNullable<LicenseClientOptions['paths']>>
  timeoutMs: number

  constructor(opts: LicenseClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '')
    this.paths = Object.assign({ verify: '/license/verify', status: '/license/status', ping: '/' }, opts.paths || {})
    this.timeoutMs = opts.timeoutMs || 5000
  }

  private async fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    try {
      const p = fetch(input, Object.assign({ credentials: 'omit', headers: { 'Content-Type': 'application/json' } }, init))
      const resp = await timeoutPromise<Response>(this.timeoutMs, p as unknown as Promise<Response>)
      const txt = await resp.text()
      try { return JSON.parse(txt) as T } catch (e) { throw new Error('invalid-json') }
    } catch (e:any) {
      throw e
    }
  }

  private buildUrl(path: string) {
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    return this.baseUrl + (path.startsWith('/') ? path : '/' + path)
  }

  async verifyLicense(fullName: string, email: string, licenseKey: string, deviceInfo?: any): Promise<VerifyResponse> {
    const url = this.buildUrl(this.paths.verify)
    try {
      const payload: any = { fullName, email, licenseKey }
      if (deviceInfo) payload.device = deviceInfo
      const body = JSON.stringify(payload)
      const j = await this.fetchJson<VerifyResponse>(url, { method: 'POST', body })
      return j
    } catch (e:any) {
      return { ok: false, message: e?.message || String(e) }
    }
  }

  async getStatus(): Promise<StatusResponse> {
    const url = this.buildUrl(this.paths.status)
    try {
      const j = await this.fetchJson<StatusResponse>(url, { method: 'GET' })
      return j
    } catch (e:any) {
      return { ok: false, message: e?.message || String(e) }
    }
  }

  async ping(): Promise<{ ok: boolean; message?: string }> {
    const url = this.buildUrl(this.paths.ping)
    try {
      const resp = await timeoutPromise<Response>(this.timeoutMs, fetch(url))
      return { ok: resp.ok }
    } catch (e:any) { return { ok: false, message: e?.message || String(e) } }
  }
}

export default LicenseClient
