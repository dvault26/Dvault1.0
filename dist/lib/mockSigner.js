"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSigner = void 0;
const crypto_1 = require("crypto");
const crypto_2 = __importDefault(require("crypto"));
class MockSigner {
    constructor() {
        this.privateKeyPem = null;
        this.publicKeyPem = null;
        this.pinHash = null;
        this.vaultKey = null; // 32 bytes AES key
    }
    async initialize() {
        // Generate a vault master key inside the mock signer (simulates hardware storage)
        this.vaultKey = crypto_2.default.randomBytes(32);
    }
    async generateKeyPair(_chain) {
        const { publicKey, privateKey } = (0, crypto_1.generateKeyPairSync)('ed25519');
        this.privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
        this.publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
        return this.publicKeyPem;
    }
    async getPublicKey() {
        if (!this.publicKeyPem)
            throw new Error('no key');
        return this.publicKeyPem;
    }
    async sign(_chain, payload) {
        if (!this.privateKeyPem)
            throw new Error('no private key');
        const chain = (_chain || '').toUpperCase();
        // If payload looks like an object, try to sign chain-specific format
        try {
            const obj = JSON.parse(payload);
            if (chain === 'XRP')
                return this.signXRP(obj);
            if (chain === 'XLM')
                return this.signXLM(obj);
        }
        catch (e) {
            // fallback to generic signing
        }
        const sign = (0, crypto_1.createSign)('SHA256');
        sign.update(payload);
        sign.end();
        const signature = sign.sign(this.privateKeyPem, 'base64');
        return signature;
    }
    signXRP(unsignedTx) {
        // Mock XRP signing: include original tx and a base64 signature
        const payload = JSON.stringify(unsignedTx);
        const sign = (0, crypto_1.createSign)('SHA256');
        sign.update(payload);
        sign.end();
        const signature = sign.sign(this.privateKeyPem, 'base64');
        const signed = { tx: unsignedTx, signature };
        return Buffer.from(JSON.stringify(signed)).toString('base64');
    }
    signXLM(unsignedTx) {
        // Mock XLM signing: similar structure
        const payload = JSON.stringify(unsignedTx);
        const sign = (0, crypto_1.createSign)('SHA256');
        sign.update(payload);
        sign.end();
        const signature = sign.sign(this.privateKeyPem, 'base64');
        const signed = { tx: unsignedTx, signature };
        return Buffer.from(JSON.stringify(signed)).toString('base64');
    }
    async setPIN(pin) {
        // store a simple hash of the PIN
        this.pinHash = crypto_2.default.createHash('sha256').update(pin).digest('hex');
    }
    async verifyPIN(pin) {
        if (!this.pinHash)
            return false;
        const h = crypto_2.default.createHash('sha256').update(pin).digest('hex');
        return h === this.pinHash;
    }
    async encryptBlob(data) {
        if (!this.vaultKey)
            throw new Error('vault key missing');
        const iv = crypto_2.default.randomBytes(12);
        const cipher = crypto_2.default.createCipheriv('aes-256-gcm', this.vaultKey, iv);
        const ct = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]);
        const tag = cipher.getAuthTag();
        // output: iv (12) | tag (16) | ciphertext
        return Buffer.concat([iv, tag, ct]);
    }
    async decryptBlob(data) {
        if (!this.vaultKey)
            throw new Error('vault key missing');
        const buf = Buffer.from(data);
        const iv = buf.slice(0, 12);
        const tag = buf.slice(12, 28);
        const ct = buf.slice(28);
        const decipher = crypto_2.default.createDecipheriv('aes-256-gcm', this.vaultKey, iv);
        decipher.setAuthTag(tag);
        const out = Buffer.concat([decipher.update(ct), decipher.final()]);
        return out;
    }
}
exports.MockSigner = MockSigner;
//# sourceMappingURL=mockSigner.js.map