"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadExchanges = loadExchanges;
exports.detectBrokerage = detectBrokerage;
exports.clearCache = clearCache;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
function dataPath() {
    const userData = electron_1.app.getPath('userData');
    return path_1.default.join(userData, 'known_exchanges.json');
}
async function loadDefault() {
    const p = path_1.default.join(__dirname, 'data', 'known_exchanges.json');
    const raw = await promises_1.default.readFile(p, 'utf8');
    return JSON.parse(raw);
}
let cache = null;
async function loadExchanges() {
    if (cache)
        return cache;
    const p = dataPath();
    try {
        const raw = await promises_1.default.readFile(p, 'utf8');
        const parsed = JSON.parse(raw);
        cache = parsed.exchanges || [];
        return cache || [];
    }
    catch (e) {
        const def = await loadDefault();
        cache = def.exchanges || [];
        // persist a copy into userData for user editability
        try {
            await promises_1.default.writeFile(p, JSON.stringify(def, null, 2), 'utf8');
        }
        catch (_) { }
        return cache || [];
    }
}
function normalize(addr) {
    return addr.trim();
}
async function detectBrokerage(address, chain) {
    const addr = normalize(address);
    const ex = await loadExchanges();
    // Exact match
    for (const e of ex) {
        if (chain && e.chains && !e.chains.includes(chain))
            continue;
        for (const a of e.addresses) {
            if (!a)
                continue;
            if (!a.includes('.*') && a.toLowerCase() === addr.toLowerCase()) {
                return { found: true, id: e.id, name: e.name, confidence: 0.99, evidence: { type: 'exact', matchedAddress: a } };
            }
        }
    }
    // Pattern/regex match
    for (const e of ex) {
        if (chain && e.chains && !e.chains.includes(chain))
            continue;
        for (const a of e.addresses) {
            if (!a)
                continue;
            if (a.includes('.*') || a.includes('^') || a.includes('$')) {
                try {
                    const re = new RegExp(a, 'i');
                    if (re.test(addr)) {
                        return { found: true, id: e.id, name: e.name, confidence: 0.85, evidence: { type: 'pattern', pattern: a, matchedAddress: addr } };
                    }
                }
                catch (err) {
                    // ignore invalid regex
                }
            }
        }
    }
    // Substring/prefix heuristics
    for (const e of ex) {
        if (chain && e.chains && !e.chains.includes(chain))
            continue;
        for (const a of e.addresses) {
            if (!a)
                continue;
            const simple = a.replace(/\W/g, '');
            if (!simple)
                continue;
            if (addr.toLowerCase().includes(simple.toLowerCase())) {
                return { found: true, id: e.id, name: e.name, confidence: 0.7, evidence: { type: 'heuristic', pattern: a, matchedAddress: addr } };
            }
        }
    }
    return { found: false, confidence: 0 };
}
// convenience sync wrapper
function clearCache() { cache = null; }
//# sourceMappingURL=brokerage.js.map