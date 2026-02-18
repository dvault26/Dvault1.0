"use strict";
/**
 * LicenseClient - small internal module for talking to a license/registration service.
 *
 * Features:
 * - Configurable base URL and endpoint paths
 * - Methods: verifyLicense, getStatus, ping
 * - JSON fetch with timeout and basic error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseClient = void 0;
function timeoutPromise(ms, p) {
    const t = new Promise((_res, rej) => setTimeout(() => rej(new Error('timeout')), ms));
    return Promise.race([p, t]);
}
class LicenseClient {
    constructor(opts) {
        this.baseUrl = opts.baseUrl.replace(/\/$/, '');
        this.paths = Object.assign({ verify: '/license/verify', status: '/license/status', ping: '/' }, opts.paths || {});
        this.timeoutMs = opts.timeoutMs || 5000;
    }
    async fetchJson(input, init) {
        try {
            const p = fetch(input, Object.assign({ credentials: 'omit', headers: { 'Content-Type': 'application/json' } }, init));
            const resp = await timeoutPromise(this.timeoutMs, p);
            const txt = await resp.text();
            try {
                return JSON.parse(txt);
            }
            catch (e) {
                throw new Error('invalid-json');
            }
        }
        catch (e) {
            throw e;
        }
    }
    buildUrl(path) {
        if (path.startsWith('http://') || path.startsWith('https://'))
            return path;
        return this.baseUrl + (path.startsWith('/') ? path : '/' + path);
    }
    async verifyLicense(fullName, email, licenseKey, deviceInfo) {
        const url = this.buildUrl(this.paths.verify);
        try {
            const payload = { fullName, email, licenseKey };
            if (deviceInfo)
                payload.device = deviceInfo;
            const body = JSON.stringify(payload);
            const j = await this.fetchJson(url, { method: 'POST', body });
            return j;
        }
        catch (e) {
            return { ok: false, message: e?.message || String(e) };
        }
    }
    async getStatus() {
        const url = this.buildUrl(this.paths.status);
        try {
            const j = await this.fetchJson(url, { method: 'GET' });
            return j;
        }
        catch (e) {
            return { ok: false, message: e?.message || String(e) };
        }
    }
    async ping() {
        const url = this.buildUrl(this.paths.ping);
        try {
            const resp = await timeoutPromise(this.timeoutMs, fetch(url));
            return { ok: resp.ok };
        }
        catch (e) {
            return { ok: false, message: e?.message || String(e) };
        }
    }
}
exports.LicenseClient = LicenseClient;
exports.default = LicenseClient;
//# sourceMappingURL=licenseClient.js.map