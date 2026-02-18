"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRegistry = loadRegistry;
exports.saveRegistry = saveRegistry;
exports.addChain = addChain;
exports.updateChain = updateChain;
exports.addTokenToChain = addTokenToChain;
exports.removeToken = removeToken;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const defaultRegistry = {
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
};
function registryPath() {
    const userData = electron_1.app.getPath('userData');
    return path_1.default.join(userData, 'registry.json');
}
async function loadRegistry() {
    const p = registryPath();
    try {
        const raw = await promises_1.default.readFile(p, 'utf8');
        return JSON.parse(raw);
    }
    catch (e) {
        await saveRegistry(defaultRegistry);
        return defaultRegistry;
    }
}
async function saveRegistry(reg) {
    const p = registryPath();
    await promises_1.default.writeFile(p, JSON.stringify(reg, null, 2), 'utf8');
}
async function addChain(chain) {
    const reg = await loadRegistry();
    reg.chains.push(chain);
    await saveRegistry(reg);
    return reg;
}
async function updateChain(id, patch) {
    const reg = await loadRegistry();
    const idx = reg.chains.findIndex(c => c.id === id);
    if (idx === -1)
        throw new Error('chain not found');
    reg.chains[idx] = { ...reg.chains[idx], ...patch };
    await saveRegistry(reg);
    return reg;
}
async function addTokenToChain(chainId, token) {
    const reg = await loadRegistry();
    const ch = reg.chains.find(c => c.id === chainId);
    if (!ch)
        throw new Error('chain not found');
    ch.tokens = ch.tokens || [];
    ch.tokens.push(token);
    await saveRegistry(reg);
    return reg;
}
async function removeToken(chainId, symbol) {
    const reg = await loadRegistry();
    const ch = reg.chains.find(c => c.id === chainId);
    if (!ch)
        throw new Error('chain not found');
    ch.tokens = (ch.tokens || []).filter(t => t.symbol !== symbol);
    await saveRegistry(reg);
    return reg;
}
//# sourceMappingURL=registry.js.map