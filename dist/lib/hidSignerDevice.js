"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIDSigner = void 0;
exports.listHidDevices = listHidDevices;
let HID = null;
try {
    // dynamic require so build doesn't fail where node-hid unavailable
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    HID = require('node-hid');
}
catch (e) {
    HID = null;
}
function toReportArray(buf) {
    return [0].concat(Array.from(buf));
}
class HIDSigner {
    constructor(deviceInfo) {
        this.deviceHandle = null;
        this.publicKeyPem = null;
        this.deviceInfo = deviceInfo;
    }
    async sendCommand(cmdObj, timeout = 5000) {
        if (!this.deviceHandle)
            throw new Error('no device handle');
        const req = JSON.stringify(cmdObj);
        const buf = Buffer.from(req);
        const arr = toReportArray(buf);
        try {
            this.deviceHandle.write(arr);
        }
        catch (e) {
            // write may fail
        }
        // try read
        try {
            const resp = this.deviceHandle.readTimeout ? this.deviceHandle.readTimeout(timeout) : this.deviceHandle.read();
            if (!resp)
                throw new Error('no response');
            const rbuf = Buffer.from(resp instanceof Buffer ? resp : resp.buffer || resp);
            const text = rbuf.toString().replace(/\0+$/g, '');
            return JSON.parse(text);
        }
        catch (e) {
            throw new Error('device no response or parse error');
        }
    }
    async initialize() {
        if (!HID)
            throw new Error('node-hid not available');
        try {
            this.deviceHandle = new HID.HID(this.deviceInfo.path || this.deviceInfo.productId || this.deviceInfo);
        }
        catch (e) {
            throw new Error('unable to open HID device');
        }
        // request public key from device
        const resp = await this.sendCommand({ cmd: 'get_public' });
        if (!resp || !resp.publicKey)
            throw new Error('device did not provide public key');
        this.publicKeyPem = resp.publicKey;
    }
    async generateKeyPair(_chain) {
        const resp = await this.sendCommand({ cmd: 'generate_key' });
        if (!resp || !resp.publicKey)
            throw new Error('generate_key failed');
        this.publicKeyPem = resp.publicKey;
        return this.publicKeyPem;
    }
    async getPublicKey() { if (!this.publicKeyPem)
        throw new Error('no public key'); return this.publicKeyPem; }
    async sign(chain, payload) {
        const resp = await this.sendCommand({ cmd: 'sign', chain, payload });
        if (!resp || !resp.signature)
            throw new Error('sign failed');
        return resp.signature;
    }
    async setPIN(pin) { await this.sendCommand({ cmd: 'set_pin', pin }); }
    async verifyPIN(pin) { const r = await this.sendCommand({ cmd: 'verify_pin', pin }); return !!r.ok; }
    async encryptBlob(data) { const resp = await this.sendCommand({ cmd: 'encrypt', data: Buffer.from(data).toString('base64') }); if (!resp || !resp.cipher)
        throw new Error('encrypt failed'); return Buffer.from(resp.cipher, 'base64'); }
    async decryptBlob(data) { const resp = await this.sendCommand({ cmd: 'decrypt', data: Buffer.from(data).toString('base64') }); if (!resp || !resp.plain)
        throw new Error('decrypt failed'); return Buffer.from(resp.plain, 'base64'); }
}
exports.HIDSigner = HIDSigner;
async function listHidDevices() {
    if (!HID)
        return [];
    try {
        const devices = HID.devices();
        return devices;
    }
    catch (e) {
        return [];
    }
}
//# sourceMappingURL=hidSignerDevice.js.map