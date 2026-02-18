"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USBSigner = void 0;
const hidSignerDevice_1 = require("./hidSignerDevice");
// USBSigner proxies to HIDSigner when available; it no longer stores keys on filesystem.
class USBSigner {
    constructor(deviceId) {
        this.hid = null;
        this.deviceId = deviceId;
    }
    async initialize() {
        this.hid = new hidSignerDevice_1.HIDSigner({ path: this.deviceId });
        await this.hid.initialize();
    }
    async generateKeyPair(chain) {
        if (!this.hid)
            throw new Error('not initialized');
        return this.hid.generateKeyPair(chain);
    }
    async getPublicKey() { if (!this.hid)
        throw new Error('not initialized'); return this.hid.getPublicKey(); }
    async sign(chain, payload) { if (!this.hid)
        throw new Error('not initialized'); return this.hid.sign(chain, payload); }
    async setPIN(pin) { if (!this.hid)
        throw new Error('not initialized'); return this.hid.setPIN(pin); }
    async verifyPIN(pin) { if (!this.hid)
        throw new Error('not initialized'); return this.hid.verifyPIN(pin); }
    async encryptBlob(data) { if (!this.hid)
        throw new Error('not initialized'); return this.hid.encryptBlob(data); }
    async decryptBlob(data) { if (!this.hid)
        throw new Error('not initialized'); return this.hid.decryptBlob(data); }
}
exports.USBSigner = USBSigner;
//# sourceMappingURL=usbSigner.js.map