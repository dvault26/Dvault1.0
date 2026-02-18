"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeVerifier = generateCodeVerifier;
exports.generateCodeChallenge = generateCodeChallenge;
const crypto_1 = __importDefault(require("crypto"));
function base64UrlEncode(buf) {
    return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function generateCodeVerifier() {
    return base64UrlEncode(crypto_1.default.randomBytes(32));
}
function generateCodeChallenge(verifier) {
    const hash = crypto_1.default.createHash('sha256').update(verifier).digest();
    return base64UrlEncode(hash);
}
//# sourceMappingURL=pkce.js.map