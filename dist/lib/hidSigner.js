"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIDSigner = void 0;
exports.listHidDevices = listHidDevices;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const electron_1 = require("electron");
let HID = null;
try {
    // dynamic require so build doesn't fail where node-hid unavailable
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    HID = require('node-hid');
}
catch (e) {
    HID = null;
}
function devicePath(deviceId) {
    const userData = electron_1.app.getPath('userData');
    return path_1.default.join(userData, 'hid-devices', deviceId);
}
class HIDSigner {
    constructor(deviceInfo) {
        this.deviceHandle = null;
        this.vaultKey = null;
        this.privateKeyPem = null;
        this.publicKeyPem = null;
        this.pinHash = null;
        this.deviceInfo = deviceInfo;
        this.basePath = devicePath(deviceInfo.path || `${deviceInfo.vendorId}-${deviceInfo.productId}`);
    }
    async initialize() {
        await promises_1.default.mkdir(this.basePath, { recursive: true });
        const vaultFile = path_1.default.join(this.basePath, 'vaultKey');
        try {
            this.vaultKey = Buffer.from(await promises_1.default.readFile(vaultFile));
        }
        catch (e) {
            this.vaultKey = crypto_1.default.randomBytes(32);
            await promises_1.default.writeFile(vaultFile, this.vaultKey);
        }
        const pubFile = path_1.default.join(this.basePath, 'public.pem');
        const privFile = path_1.default.join(this.basePath, 'private.pem');
        try {
            this.publicKeyPem = (await promises_1.default.readFile(pubFile)).toString();
            this.privateKeyPem = (await promises_1.default.readFile(privFile)).toString();
        }
        catch (e) {
            const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync('ed25519');
            this.privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
            this.publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
            await promises_1.default.writeFile(pubFile, this.publicKeyPem);
            await promises_1.default.writeFile(privFile, this.privateKeyPem);
        }
        const pinFile = path_1.default.join(this.basePath, 'pin');
        try {
            this.pinHash = (await promises_1.default.readFile(pinFile)).toString();
        }
        catch (e) { }
        if (HID && this.deviceInfo) {
            try {
                this.deviceHandle = new HID.HID(this.deviceInfo.path || this.deviceInfo.productId || '');
            }
            catch (e) {
                this.deviceHandle = null;
            }
        }
    }
    async generateKeyPair(_chain) {
        const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync('ed25519');
        this.privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
        this.publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
        await promises_1.default.writeFile(path_1.default.join(this.basePath, 'public.pem'), this.publicKeyPem);
        await promises_1.default.writeFile(path_1.default.join(this.basePath, 'private.pem'), this.privateKeyPem);
        return this.publicKeyPem;
    }
    async getPublicKey() { if (!this.publicKeyPem)
        throw new Error('no public key'); return this.publicKeyPem; }
    async sign(_chain, payload) {
        // Prefer asking the device to sign if a HID handle exists
        if (this.deviceHandle) {
            try {
                const req = JSON.stringify({ cmd: 'sign', chain: _chain, payload });
                const buf = Buffer.from(req);
                // node-hid write expects an array; prefix with 0 report id
                const arr = [0].concat(Array.from(buf));
                try {
                    this.deviceHandle.write(arr);
                }
                catch (e) { /* ignore write errors */ }
                // attempt synchronous read (may block); fallback to readTimeout if available
                let resp = null;
                try {
                    resp = this.deviceHandle.readTimeout ? this.deviceHandle.readTimeout(5000) : this.deviceHandle.read();
                }
                catch (e) {
                    // ignore
                }
                if (resp) {
                    const rbuf = Buffer.from(resp instanceof Buffer ? resp : resp.buffer || resp);
                    // attempt to parse JSON response
                    try {
                        const text = rbuf.toString().replace(/\0+$/g, '');
                        const obj = JSON.parse(text);
                        if (obj && obj.signature)
                            return obj.signature;
                    }
                    catch (e) {
                        // fallthrough
                    }
                }
            }
            catch (e) {
                // fallthrough to local signing
            }
        }
        if (!this.privateKeyPem)
            throw new Error('no private key');
        const sign = crypto_1.default.createSign('SHA256');
        try {
            const obj = JSON.parse(payload);
            const signPayload = JSON.stringify(obj);
            sign.update(signPayload);
        }
        catch (e) {
            sign.update(payload);
        }
        sign.end();
        return sign.sign(this.privateKeyPem, 'base64');
    }
    async setPIN(pin) { this.pinHash = crypto_1.default.createHash('sha256').update(pin).digest('hex'); await promises_1.default.writeFile(path_1.default.join(this.basePath, 'pin'), this.pinHash); }
    async verifyPIN(pin) { if (!this.pinHash)
        return false; return crypto_1.default.createHash('sha256').update(pin).digest('hex') === this.pinHash; }
    async encryptBlob(data) { if (!this.vaultKey)
        throw new Error('vault key missing'); const iv = crypto_1.default.randomBytes(12); const cipher = crypto_1.default.createCipheriv('aes-256-gcm', this.vaultKey, iv); const ct = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]); const tag = cipher.getAuthTag(); return Buffer.concat([iv, tag, ct]); }
    async decryptBlob(data) { if (!this.vaultKey)
        throw new Error('vault key missing'); const buf = Buffer.from(data); const iv = buf.slice(0, 12); const tag = buf.slice(12, 28); const ct = buf.slice(28); const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', this.vaultKey, iv); decipher.setAuthTag(tag); const out = Buffer.concat([decipher.update(ct), decipher.final()]); return out; }
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
//# sourceMappingURL=hidSigner.js.map