"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const http_1 = __importDefault(require("http"));
const pkce_1 = require("./pkce");
// Import security key manager
const securityKeyManager_1 = __importDefault(require("../lib/securityKeyManager"));
// Plaid integration (sandbox)
async function getStoredPlaidCreds(signer) {
    const userData = electron_1.app.getPath('userData');
    const pfile = path_1.default.join(userData, 'plaid.bin');
    try {
        const buf = await promises_1.default.readFile(pfile);
        const dec = await signer.decryptBlob(Buffer.from(buf));
        return JSON.parse(dec.toString());
    }
    catch (e) {
        return null;
    }
}
const mockSigner_1 = require("../lib/mockSigner");
const blockchainMock_1 = require("./blockchainMock");
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const registry = __importStar(require("./registry"));
const brokerage_1 = require("./brokerage");
// Settings storage helpers
function settingsPath() {
    const userData = electron_1.app.getPath('userData');
    return path_1.default.join(userData, 'settings.json');
}
async function loadSettings() {
    const p = settingsPath();
    try {
        const txt = await promises_1.default.readFile(p, 'utf8');
        return JSON.parse(txt);
    }
    catch (e) {
        const def = { language: 'en', updatedAt: Date.now(), licenseEndpoint: 'https://your-render-app.onrender.com' };
        await promises_1.default.writeFile(p, JSON.stringify(def, null, 2), 'utf8');
        return def;
    }
}
async function saveSettings(obj) {
    const p = settingsPath();
    await promises_1.default.writeFile(p, JSON.stringify(obj, null, 2), 'utf8');
}
// Registered USB devices storage path (secure blobs encrypted by active signer)
function registeredDevicesDir() {
    const userData = electron_1.app.getPath('userData');
    return path_1.default.join(userData, 'registered-usb');
}
let mainWindow = null;
let activeSigner = null;
let blockchain = new blockchainMock_1.BlockchainMock();
const usbSigner_1 = require("../lib/usbSigner");
const hidSignerDevice_1 = require("../lib/hidSignerDevice");
let usbSigner = null;
let hidSigner = null;
// brokerage detection now performed by `src/main/brokerage.ts`
function createWindow() {
    // Use icon.ico for Windows, icon.png for other platforms
    const iconPath = process.platform === 'win32'
        ? path_1.default.join(__dirname, '..', '..', 'build', 'icon.ico')
        : path_1.default.join(__dirname, '..', '..', 'build', 'icon.png');
    mainWindow = new electron_1.BrowserWindow({
        width: 1024,
        height: 768,
        icon: iconPath,
        webPreferences: {
            preload: path_1.default.join(__dirname, '..', 'preload', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });
    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl) {
        mainWindow.loadURL(devServerUrl);
        mainWindow.webContents.openDevTools();
    }
    else {
        const indexHtml = path_1.default.join(__dirname, '..', 'renderer', 'index.html');
        mainWindow.loadFile(indexHtml).catch(err => {
            console.error('Failed to load HTML:', err);
        });
    }
    mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
        console.error(`Failed to load (code: ${code}): ${desc}`);
    });
    mainWindow.webContents.on('crashed', () => {
        console.error('Renderer process crashed');
        electron_1.app.quit();
    });
}
electron_1.app.whenReady().then(() => {
    try {
        createWindow();
        // Run update check in background without blocking startup
        checkForUpdatesOnStartup().catch(err => console.error('Update check error:', err));
    }
    catch (e) {
        console.error('Error during app startup:', e);
        electron_1.app.quit();
    }
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            try {
                createWindow();
            }
            catch (e) {
                console.error('Error creating window on activate:', e);
            }
        }
    });
}).catch(err => {
    console.error('Error in app.whenReady():', err);
    electron_1.app.quit();
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// Signer IPC handlers (mock implementation)
electron_1.ipcMain.handle('signer:connect-mock', async () => {
    const s = new mockSigner_1.MockSigner();
    await s.initialize();
    activeSigner = s;
    return { connected: true };
});
electron_1.ipcMain.handle('usb:listDevices', async () => {
    const userData = electron_1.app.getPath('userData');
    const d = path_1.default.join(userData, 'usb-devices');
    try {
        const files = await promises_1.default.readdir(d);
        return { devices: files };
    }
    catch (e) {
        return { devices: [] };
    }
});
electron_1.ipcMain.handle('usb:scanHid', async () => {
    try {
        const devices = await (0, hidSignerDevice_1.listHidDevices)();
        return { devices };
    }
    catch (e) {
        return { devices: [] };
    }
});
electron_1.ipcMain.handle('usb:connect-hid', async (_ev, deviceInfo) => {
    hidSigner = new hidSignerDevice_1.HIDSigner(deviceInfo);
    await hidSigner.initialize();
    activeSigner = hidSigner;
    return { connected: true };
});
electron_1.ipcMain.handle('usb:createDevice', async (_ev, deviceId, licenseId) => {
    const userData = electron_1.app.getPath('userData');
    const d = path_1.default.join(userData, 'usb-devices');
    await promises_1.default.mkdir(d, { recursive: true });
    const entries = await promises_1.default.readdir(d);
    if (entries.length >= 3)
        throw new Error('maximum of 3 devices allowed');
    const devPath = path_1.default.join(d, deviceId);
    await promises_1.default.mkdir(devPath, { recursive: true });
    if (licenseId) {
        await promises_1.default.writeFile(path_1.default.join(devPath, 'license.json'), JSON.stringify({ licenseId }));
    }
    return { created: true };
});
electron_1.ipcMain.handle('usb:connect', async (_ev, deviceId) => {
    usbSigner = new usbSigner_1.USBSigner(deviceId);
    await usbSigner.initialize();
    activeSigner = usbSigner;
    return { connected: true };
});
electron_1.ipcMain.handle('usb:disconnect', async () => {
    usbSigner = null;
    activeSigner = null;
    return { disconnected: true };
});
electron_1.ipcMain.handle('signer:status', async () => {
    return { connected: !!activeSigner };
});
electron_1.ipcMain.handle('signer:generateKeyPair', async (_ev, chain) => {
    if (!activeSigner)
        throw new Error('signer not connected');
    const pub = await activeSigner.generateKeyPair(chain);
    return { publicKey: pub };
});
electron_1.ipcMain.handle('signer:getPublicKey', async () => {
    if (!activeSigner)
        throw new Error('signer not connected');
    return { publicKey: await activeSigner.getPublicKey() };
});
electron_1.ipcMain.handle('signer:sign', async (_ev, chain, payload) => {
    if (!activeSigner)
        throw new Error('signer not connected');
    const sig = await activeSigner.sign(chain, payload);
    return { signature: sig };
});
// Blockchain IPC handlers (mock)
electron_1.ipcMain.handle('blockchain:getBalance', async (_ev, chain, address) => {
    return { balance: await blockchain.getBalance(chain, address) };
});
electron_1.ipcMain.handle('blockchain:getTransactions', async (_ev, chain, address) => {
    return { transactions: await blockchain.getTransactions(chain, address) };
});
electron_1.ipcMain.handle('blockchain:buildTransaction', async (_ev, chain, from, to, amount, fee) => {
    return { tx: await blockchain.buildTransaction(chain, from, to, amount, fee) };
});
electron_1.ipcMain.handle('blockchain:broadcastTransaction', async (_ev, chain, signedTx) => {
    const txid = await blockchain.broadcastTransaction(chain, signedTx);
    // persist transaction record and attempt to attach metadata
    try {
        const userData = electron_1.app.getPath('userData');
        const txDir = path_1.default.join(userData, 'transactions');
        await promises_1.default.mkdir(txDir, { recursive: true });
        const txRecord = { txid, chain, signedTx, createdAt: Date.now() };
        // try to guess to/from from signedTx if it's JSON
        try {
            txRecord.parsed = JSON.parse(signedTx);
        }
        catch (e) { }
        // attempt to find matching pretransfer by address
        try {
            const preDir = path_1.default.join(userData, 'pretransfers');
            const metas = await promises_1.default.readdir(preDir);
            for (const m of metas.filter(x => x.endsWith('.json'))) {
                const txt = await promises_1.default.readFile(path_1.default.join(preDir, m), 'utf8');
                const meta = JSON.parse(txt);
                const maybeBin = path_1.default.join(preDir, meta.id + '.bin');
                if (fs_1.default.existsSync(maybeBin)) {
                    const buf = await promises_1.default.readFile(maybeBin);
                    if (activeSigner) {
                        const dec = await activeSigner.decryptBlob(Buffer.from(buf));
                        const info = JSON.parse(dec.toString());
                        const addr = info.address || info.to || info.from;
                        if (addr && txRecord.parsed) {
                            const contains = JSON.stringify(txRecord.parsed).includes(addr);
                            if (contains) {
                                txRecord.metadata = info;
                                break;
                            }
                        }
                    }
                }
            }
        }
        catch (e) { /* ignore */ }
        await promises_1.default.writeFile(path_1.default.join(txDir, `${txid}.json`), JSON.stringify(txRecord, null, 2));
    }
    catch (e) { /* ignore persistence errors */ }
    return { txid };
});
// Vault IPC handlers (store encrypted blobs on disk)
electron_1.ipcMain.handle('vault:storeBlob', async (_ev, filename, b64data) => {
    const userData = electron_1.app.getPath('userData');
    const vaultDir = path_1.default.join(userData, 'vault');
    await promises_1.default.mkdir(vaultDir, { recursive: true });
    const filePath = path_1.default.join(vaultDir, filename);
    const buf = Buffer.from(b64data, 'base64');
    await promises_1.default.writeFile(filePath, buf);
    return { stored: true };
});
electron_1.ipcMain.handle('vault:listBlobs', async () => {
    const userData = electron_1.app.getPath('userData');
    const vaultDir = path_1.default.join(userData, 'vault');
    try {
        const files = await promises_1.default.readdir(vaultDir);
        return { files };
    }
    catch (e) {
        return { files: [] };
    }
});
electron_1.ipcMain.handle('vault:getBlob', async (_ev, filename) => {
    const userData = electron_1.app.getPath('userData');
    const vaultDir = path_1.default.join(userData, 'vault');
    const filePath = path_1.default.join(vaultDir, filename);
    try {
        const buf = await promises_1.default.readFile(filePath);
        return { data: buf.toString('base64') };
    }
    catch (e) {
        return { data: null };
    }
});
// Security Key Management IPC handlers
electron_1.ipcMain.handle('security-key:initialize', async () => {
    try {
        await securityKeyManager_1.default.initialize();
        return { ok: true };
    }
    catch (e) {
        console.error('Security key initialization error:', e);
        return { ok: false, error: e.message };
    }
});
electron_1.ipcMain.handle('security-key:list', async () => {
    try {
        const keys = await securityKeyManager_1.default.listSecurityKeys();
        return { keys, ok: true };
    }
    catch (e) {
        console.error('List security keys error:', e);
        return { keys: [], ok: false, error: e.message };
    }
});
electron_1.ipcMain.handle('security-key:register', async (_ev, deviceInfo, password, name) => {
    try {
        const key = await securityKeyManager_1.default.registerSecurityKey(deviceInfo, password, name);
        console.log(`[IPC] Registered security key: ${key.id}`);
        return { key, ok: true };
    }
    catch (e) {
        console.error('Register security key error:', e);
        return { ok: false, error: e.message };
    }
});
electron_1.ipcMain.handle('security-key:setPrimary', async (_ev, keyId) => {
    try {
        await securityKeyManager_1.default.setPrimarySecurityKey(keyId);
        return { ok: true };
    }
    catch (e) {
        console.error('Set primary security key error:', e);
        return { ok: false, error: e.message };
    }
});
electron_1.ipcMain.handle('security-key:remove', async (_ev, keyId) => {
    try {
        await securityKeyManager_1.default.removeSecurityKey(keyId);
        return { ok: true };
    }
    catch (e) {
        console.error('Remove security key error:', e);
        return { ok: false, error: e.message };
    }
});
electron_1.ipcMain.handle('security-key:sign', async (_ev, keyId, data, password) => {
    try {
        const dataBuffer = Buffer.from(data, 'hex');
        const signature = await securityKeyManager_1.default.signWithSecurityKey(keyId, dataBuffer, password);
        return { signature: signature.toString('hex'), ok: true };
    }
    catch (e) {
        console.error('Security key sign error:', e);
        return { ok: false, error: e.message };
    }
});
electron_1.ipcMain.handle('security-key:verify', async (_ev, keyId, data, signature, password) => {
    try {
        const dataBuffer = Buffer.from(data, 'hex');
        const sigBuffer = Buffer.from(signature, 'hex');
        const valid = await securityKeyManager_1.default.verifySignature(keyId, dataBuffer, sigBuffer, password);
        return { valid, ok: true };
    }
    catch (e) {
        console.error('Security key verify error:', e);
        return { ok: false, error: e.message };
    }
});
electron_1.ipcMain.handle('security-key:export', async (_ev, keyId, password) => {
    try {
        const exported = await securityKeyManager_1.default.exportSecurityKey(keyId, password);
        return { exported, ok: true };
    }
    catch (e) {
        console.error('Security key export error:', e);
        return { ok: false, error: e.message };
    }
});
electron_1.ipcMain.handle('security-key:import', async (_ev, exportedKey, password) => {
    try {
        const key = await securityKeyManager_1.default.importSecurityKey(exportedKey, password);
        return { key, ok: true };
    }
    catch (e) {
        console.error('Security key import error:', e);
        return { ok: false, error: e.message };
    }
});
// Bank connections: credentials are encrypted using the active signer and stored on disk
electron_1.ipcMain.handle('bank:createConnection', async (_ev, id, name, username, password) => {
    if (!activeSigner)
        throw new Error('no active signer');
    const userData = electron_1.app.getPath('userData');
    const banksDir = path_1.default.join(userData, 'banks');
    await promises_1.default.mkdir(banksDir, { recursive: true });
    const payload = JSON.stringify({ id, name, username, password });
    const enc = await activeSigner.encryptBlob(Buffer.from(payload));
    const filePath = path_1.default.join(banksDir, `${id}.bin`);
    await promises_1.default.writeFile(filePath, Buffer.from(enc));
    // also store metadata
    const meta = { id, name, created: Date.now() };
    await promises_1.default.writeFile(path_1.default.join(banksDir, `${id}.json`), JSON.stringify(meta));
    return { created: true };
});
electron_1.ipcMain.handle('bank:listConnections', async () => {
    const userData = electron_1.app.getPath('userData');
    const banksDir = path_1.default.join(userData, 'banks');
    try {
        const files = await promises_1.default.readdir(banksDir);
        const metas = files.filter(f => f.endsWith('.json'));
        const res = [];
        for (const m of metas) {
            const txt = await promises_1.default.readFile(path_1.default.join(banksDir, m), 'utf8');
            res.push(JSON.parse(txt));
        }
        return { connections: res };
    }
    catch (e) {
        return { connections: [] };
    }
});
electron_1.ipcMain.handle('bank:getConnection', async (_ev, id) => {
    if (!activeSigner)
        throw new Error('no active signer');
    const userData = electron_1.app.getPath('userData');
    const banksDir = path_1.default.join(userData, 'banks');
    const filePath = path_1.default.join(banksDir, `${id}.bin`);
    try {
        const buf = await promises_1.default.readFile(filePath);
        const dec = await activeSigner.decryptBlob(Buffer.from(buf));
        const obj = JSON.parse(dec.toString());
        return { connection: { id: obj.id, name: obj.name, username: obj.username, password: obj.password } };
    }
    catch (e) {
        return { connection: null };
    }
});
electron_1.ipcMain.handle('bank:removeConnection', async (_ev, id) => {
    const userData = electron_1.app.getPath('userData');
    const banksDir = path_1.default.join(userData, 'banks');
    try {
        await promises_1.default.unlink(path_1.default.join(banksDir, `${id}.bin`));
        await promises_1.default.unlink(path_1.default.join(banksDir, `${id}.json`));
    }
    catch (e) {
        // ignore
    }
    return { removed: true };
});
// Mock bank balance fetch — placeholder for future integration with bank APIs
electron_1.ipcMain.handle('bank:getBalance', async (_ev, id) => {
    // For now return a deterministic mock balance based on id hash
    const h = crypto_1.default.createHash('sha256').update(id).digest();
    const bal = (h.readUInt32BE(0) % 10000) / 100;
    return { balance: bal };
});
// OAuth PKCE: start an authorization flow and exchange code for tokens
electron_1.ipcMain.handle('bank:oauth-start', async (_ev, opts) => {
    if (!activeSigner)
        throw new Error('no active signer');
    const signer = activeSigner;
    const { authUrl, tokenUrl, clientId, scope } = opts;
    const codeVerifier = (0, pkce_1.generateCodeVerifier)();
    const codeChallenge = (0, pkce_1.generateCodeChallenge)(codeVerifier);
    return await new Promise(async (resolve, reject) => {
        const server = http_1.default.createServer(async (req, res) => {
            try {
                const reqUrl = req.url || '';
                const full = new URL(reqUrl, `http://localhost`);
                if (full.pathname === '/callback') {
                    const code = full.searchParams.get('code');
                    if (!code) {
                        res.writeHead(400);
                        res.end('Missing code');
                        return;
                    }
                    // Exchange code for token
                    const redirectUri = `http://localhost:${server.address().port}/callback`;
                    const params = new URLSearchParams();
                    params.set('grant_type', 'authorization_code');
                    params.set('code', code);
                    params.set('redirect_uri', redirectUri);
                    params.set('client_id', clientId);
                    params.set('code_verifier', codeVerifier);
                    const resp = await fetch(tokenUrl, { method: 'POST', body: params });
                    const tokenResp = await resp.json();
                    // store encrypted token
                    const id = opts.id || Date.now().toString();
                    const userData = electron_1.app.getPath('userData');
                    const banksDir = path_1.default.join(userData, 'banks');
                    await promises_1.default.mkdir(banksDir, { recursive: true });
                    const enc = await signer.encryptBlob(Buffer.from(JSON.stringify(tokenResp)));
                    await promises_1.default.writeFile(path_1.default.join(banksDir, `${id}.bin`), Buffer.from(enc));
                    await promises_1.default.writeFile(path_1.default.join(banksDir, `${id}.json`), JSON.stringify({ id, name: clientId, oauth: true, created: Date.now() }));
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end('<html><body>Authorization complete. You may close this window.</body></html>');
                    server.close();
                    resolve({ success: true, token: tokenResp, id });
                }
                else {
                    res.writeHead(404);
                    res.end('Not found');
                }
            }
            catch (e) {
                res.writeHead(500);
                res.end('Server error');
            }
        });
        server.listen(0, async () => {
            const port = server.address().port;
            const redirectUri = `http://localhost:${port}/callback`;
            const u = new URL(authUrl);
            u.searchParams.set('response_type', 'code');
            u.searchParams.set('client_id', clientId);
            u.searchParams.set('redirect_uri', redirectUri);
            u.searchParams.set('code_challenge', codeChallenge);
            u.searchParams.set('code_challenge_method', 'S256');
            if (scope)
                u.searchParams.set('scope', scope);
            const win = new electron_1.BrowserWindow({ width: 800, height: 700, webPreferences: { nodeIntegration: false } });
            win.loadURL(u.toString());
        });
    });
});
// Plaid handlers
electron_1.ipcMain.handle('plaid:setCredentials', async (_ev, clientId, secret) => {
    if (!activeSigner)
        throw new Error('no active signer');
    const signer = activeSigner;
    const userData = electron_1.app.getPath('userData');
    const pfile = path_1.default.join(userData, 'plaid.bin');
    const enc = await signer.encryptBlob(Buffer.from(JSON.stringify({ clientId, secret })));
    await promises_1.default.writeFile(pfile, Buffer.from(enc));
    return { stored: true };
});
electron_1.ipcMain.handle('plaid:createSandboxPublicToken', async (_ev, institution_id, initial_products = ['auth']) => {
    const signer = activeSigner;
    if (!signer)
        throw new Error('no active signer');
    const creds = await getStoredPlaidCreds(signer);
    if (!creds)
        throw new Error('no plaid credentials stored');
    const body = { client_id: creds.clientId, secret: creds.secret, institution_id, initial_products };
    const resp = await fetch('https://sandbox.plaid.com/sandbox/public_token/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await resp.json();
    return json;
});
electron_1.ipcMain.handle('plaid:exchangePublicToken', async (_ev, public_token) => {
    const signer = activeSigner;
    if (!signer)
        throw new Error('no active signer');
    const creds = await getStoredPlaidCreds(signer);
    if (!creds)
        throw new Error('no plaid credentials stored');
    const body = { client_id: creds.clientId, secret: creds.secret, public_token };
    const resp = await fetch('https://sandbox.plaid.com/item/public_token/exchange', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await resp.json();
    if (json && json.access_token && json.item_id) {
        const id = json.item_id;
        const userData = electron_1.app.getPath('userData');
        const banksDir = path_1.default.join(userData, 'banks');
        await promises_1.default.mkdir(banksDir, { recursive: true });
        const enc = await signer.encryptBlob(Buffer.from(JSON.stringify(json)));
        await promises_1.default.writeFile(path_1.default.join(banksDir, `${id}.bin`), Buffer.from(enc));
        await promises_1.default.writeFile(path_1.default.join(banksDir, `${id}.json`), JSON.stringify({ id, name: 'plaid', oauth: true, created: Date.now() }));
    }
    return json;
});
electron_1.ipcMain.handle('plaid:getBalances', async (_ev, access_token) => {
    const signer = activeSigner;
    if (!signer)
        throw new Error('no active signer');
    const creds = await getStoredPlaidCreds(signer);
    if (!creds)
        throw new Error('no plaid credentials stored');
    const body = { client_id: creds.clientId, secret: creds.secret, access_token };
    const resp = await fetch('https://sandbox.plaid.com/accounts/balance/get', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await resp.json();
    return json;
});
// Registry IPC handlers
electron_1.ipcMain.handle('registry:get', async () => {
    return await registry.loadRegistry();
});
electron_1.ipcMain.handle('registry:addChain', async (_ev, chain) => {
    return await registry.addChain(chain);
});
// Pre-Transfer capture: store encrypted pre-transfer info and label transactions
electron_1.ipcMain.handle('transfer:storePretransfer', async (_ev, info) => {
    if (!activeSigner)
        throw new Error('no active signer');
    const id = crypto_1.default.randomBytes(6).toString('hex');
    const userData = electron_1.app.getPath('userData');
    const dir = path_1.default.join(userData, 'pretransfers');
    await promises_1.default.mkdir(dir, { recursive: true });
    // if brokerage not provided, attempt to detect from address
    try {
        if (!info.receivingBroker && info.address) {
            try {
                const det = await (0, brokerage_1.detectBrokerage)(info.address, info.chain);
                if (det && det.found) {
                    info.receivingBroker = det.name;
                }
            }
            catch (e) { }
        }
    }
    catch (e) { }
    const payload = { id, ...info, createdAt: Date.now() };
    const enc = await activeSigner.encryptBlob(Buffer.from(JSON.stringify(payload)));
    await promises_1.default.writeFile(path_1.default.join(dir, `${id}.bin`), Buffer.from(enc));
    await promises_1.default.writeFile(path_1.default.join(dir, `${id}.json`), JSON.stringify({ id, label: info.label || '', mode: info.mode || 'transfer', createdAt: Date.now() }));
    return { id };
});
electron_1.ipcMain.handle('transfer:getPretransfer', async (_ev, id) => {
    if (!activeSigner)
        throw new Error('no active signer');
    const userData = electron_1.app.getPath('userData');
    const dir = path_1.default.join(userData, 'pretransfers');
    try {
        const buf = await promises_1.default.readFile(path_1.default.join(dir, `${id}.bin`));
        const dec = await activeSigner.decryptBlob(Buffer.from(buf));
        return { ok: true, data: JSON.parse(dec.toString()) };
    }
    catch (e) {
        return { ok: false, message: 'not found' };
    }
});
electron_1.ipcMain.handle('transfer:listPretransfers', async () => {
    const userData = electron_1.app.getPath('userData');
    const dir = path_1.default.join(userData, 'pretransfers');
    try {
        const files = await promises_1.default.readdir(dir);
        const metas = files.filter(f => f.endsWith('.json'));
        const res = [];
        for (const m of metas) {
            const txt = await promises_1.default.readFile(path_1.default.join(dir, m), 'utf8');
            res.push(JSON.parse(txt));
        }
        return { items: res };
    }
    catch (e) {
        return { items: [] };
    }
});
electron_1.ipcMain.handle('transfer:labelTransaction', async (_ev, tx, preId) => {
    if (!activeSigner)
        throw new Error('no active signer');
    // load pretransfer and attach to tx (read directly from disk)
    const userData = electron_1.app.getPath('userData');
    const dir = path_1.default.join(userData, 'pretransfers');
    try {
        const buf = await promises_1.default.readFile(path_1.default.join(dir, `${preId}.bin`));
        const dec = await activeSigner.decryptBlob(Buffer.from(buf));
        const info = JSON.parse(dec.toString());
        const labeled = Object.assign({}, tx, { label: info.label || info.reference || info.purpose || 'User note', pretransfer: info });
        return { ok: true, tx: labeled };
    }
    catch (e) {
        return { ok: false, message: 'pretransfer not found' };
    }
});
// Brokerage detection
electron_1.ipcMain.handle('brokerage:detect', async (_ev, address, chain) => {
    if (!address)
        return { found: false, name: 'Unknown', confidence: 0 };
    try {
        const res = await (0, brokerage_1.detectBrokerage)(address, chain);
        return res;
    }
    catch (e) {
        return { found: false, name: 'Unknown', confidence: 0 };
    }
});
electron_1.ipcMain.handle('transfer:findMetadata', async (_ev, tx) => {
    const userData = electron_1.app.getPath('userData');
    const dir = path_1.default.join(userData, 'pretransfers');
    try {
        const files = await promises_1.default.readdir(dir);
        for (const f of files.filter(x => x.endsWith('.json'))) {
            const meta = JSON.parse(await promises_1.default.readFile(path_1.default.join(dir, f), 'utf8'));
            const bin = path_1.default.join(dir, meta.id + '.bin');
            try {
                const buf = await promises_1.default.readFile(bin);
                if (activeSigner) {
                    const dec = await activeSigner.decryptBlob(Buffer.from(buf));
                    const info = JSON.parse(dec.toString());
                    // match by address or label heuristics
                    if ((tx.to && info.address && tx.to === info.address) || (tx.from && info.address && tx.from === info.address)) {
                        return { ok: true, info };
                    }
                }
            }
            catch (e) { }
        }
    }
    catch (e) { }
    return { ok: false };
});
// License verification (simulated backend)
electron_1.ipcMain.handle('license:verify', async (_ev, fullName, email, licenseKey, deviceInfo) => {
    // Prefer using a remote license registration service (e.g., hosted on Render).
    const settings = await loadSettings();
    if (settings.licenseEndpoint) {
        try {
            const payload = { fullName, email, licenseKey };
            if (deviceInfo)
                payload.device = deviceInfo;
            const resp = await fetch(settings.licenseEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const j = await resp.json();
            // Expecting remote response shape: { ok: boolean, authCode?: string, message?: string }
            if (j && typeof j.ok !== 'undefined')
                return j;
        }
        catch (e) {
            // fall through to local check on error
        }
    }
    // Fallback: local license file (development/testing)
    const userData = electron_1.app.getPath('userData');
    const f = path_1.default.join(userData, 'licenses.json');
    let licenses = {};
    try {
        const txt = await promises_1.default.readFile(f, 'utf8');
        licenses = JSON.parse(txt);
    }
    catch (e) {
        // initialize with a sample license for testing
        licenses = {
            'TEST-ABCDE-12345': { used: false, assignedTo: null },
            'SAMPLE-00000-ABCDE': { used: false, assignedTo: null }
        };
    }
    const entry = licenses[licenseKey];
    if (!entry) {
        return { ok: false, message: 'License key not found' };
    }
    if (entry.used) {
        // if assigned to same email, allow re-activation
        if (entry.assignedTo && entry.assignedTo.email === email) {
            return { ok: true, authCode: entry.authCode };
        }
        return { ok: false, message: 'License key already used' };
    }
    // assign to user
    const authCode = crypto_1.default.randomBytes(6).toString('hex').toUpperCase().match(/.{1,5}/g)?.join('-') || 'AUTH-UNKNOWN';
    const meta = { used: true, assignedTo: { name: fullName, email }, authCode, activatedAt: Date.now() };
    if (deviceInfo)
        meta.boundDevices = [deviceInfo];
    licenses[licenseKey] = meta;
    await promises_1.default.writeFile(f, JSON.stringify(licenses, null, 2));
    return { ok: true, authCode };
});
electron_1.ipcMain.handle('license:getStatus', async () => {
    const userData = electron_1.app.getPath('userData');
    const f = path_1.default.join(userData, 'licenses.json');
    try {
        const txt = await promises_1.default.readFile(f, 'utf8');
        const licenses = JSON.parse(txt);
        return { licenses };
    }
    catch (e) {
        return { licenses: {} };
    }
});
electron_1.ipcMain.handle('registry:updateChain', async (_ev, id, patch) => {
    return await registry.updateChain(id, patch);
});
// App metadata
electron_1.ipcMain.handle('app:getVersion', async () => {
    return { version: electron_1.app.getVersion() };
});
// Updates: check local update metadata (stub) and optionally query remote update server
electron_1.ipcMain.handle('updates:check', async () => {
    try {
        // prefer configured update endpoint in settings
        const settings = await loadSettings();
        if (settings.updateEndpoint) {
            try {
                const resp = await fetch(settings.updateEndpoint);
                const json = await resp.json();
                return { ok: true, source: 'remote', data: json };
            }
            catch (e) {
                // fallback to local
            }
        }
        const def = path_1.default.join(__dirname, 'data', 'update.json');
        const txt = await promises_1.default.readFile(def, 'utf8');
        const json = JSON.parse(txt);
        const current = electron_1.app.getVersion();
        const updateAvailable = json.latestVersion && json.latestVersion !== current;
        return { ok: true, source: 'local', data: json, currentVersion: current, updateAvailable };
    }
    catch (e) {
        return { ok: false, message: String(e) };
    }
});
async function checkForUpdatesOnStartup() {
    try {
        // reuse the same logic as handler: read settings and local update.json
        const settings = await loadSettings();
        if (settings.updateEndpoint) {
            try {
                // Add timeout to fetch to prevent hanging
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                try {
                    const resp = await fetch(settings.updateEndpoint, { signal: controller.signal });
                    const json = await resp.json();
                    if (json.latestVersion && json.latestVersion !== electron_1.app.getVersion()) {
                        await electron_1.dialog.showMessageBox({ type: 'info', title: 'Update available', message: `A new version ${json.latestVersion} is available.` });
                    }
                    clearTimeout(timeout);
                    return;
                }
                finally {
                    clearTimeout(timeout);
                }
            }
            catch (e) { }
        }
        const def = path_1.default.join(__dirname, 'data', 'update.json');
        const txt = await promises_1.default.readFile(def, 'utf8');
        const json = JSON.parse(txt);
        if (json.latestVersion && json.latestVersion !== electron_1.app.getVersion()) {
            await electron_1.dialog.showMessageBox({ type: 'info', title: 'Update available', message: `A new version ${json.latestVersion} is available.` });
        }
    }
    catch (e) { }
}
// Settings IPC
electron_1.ipcMain.handle('settings:get', async () => {
    try {
        return await loadSettings();
    }
    catch (e) {
        console.error('Error loading settings:', e);
        return { language: 'en', updatedAt: Date.now(), licenseEndpoint: 'https://your-render-app.onrender.com' };
    }
});
electron_1.ipcMain.handle('settings:setLanguage', async (_ev, lang) => {
    try {
        const s = await loadSettings();
        s.language = lang;
        s.updatedAt = Date.now();
        await saveSettings(s);
        return { ok: true };
    }
    catch (e) {
        console.error('Error setting language:', e);
        throw e;
    }
});
electron_1.ipcMain.handle('settings:save', async (_ev, patch) => {
    try {
        const s = await loadSettings();
        const merged = Object.assign({}, s, patch);
        merged.updatedAt = Date.now();
        await saveSettings(merged);
        return { ok: true, settings: merged };
    }
    catch (e) {
        console.error('Error saving settings:', e);
        throw e;
    }
});
// USB registered device management (secure)
electron_1.ipcMain.handle('usb:listRegistered', async () => {
    const dir = registeredDevicesDir();
    try {
        const files = await promises_1.default.readdir(dir);
        const metas = files.filter(f => f.endsWith('.json'));
        const res = [];
        for (const m of metas) {
            const txt = await promises_1.default.readFile(path_1.default.join(dir, m), 'utf8');
            res.push(JSON.parse(txt));
        }
        return { items: res };
    }
    catch (e) {
        return { items: [] };
    }
});
electron_1.ipcMain.handle('usb:registerDevice', async (_ev, deviceInfo) => {
    if (!activeSigner)
        throw new Error('no active signer');
    const dir = registeredDevicesDir();
    await promises_1.default.mkdir(dir, { recursive: true });
    const id = crypto_1.default.randomBytes(6).toString('hex');
    const payload = { id, deviceInfo, createdAt: Date.now() };
    const enc = await activeSigner.encryptBlob(Buffer.from(JSON.stringify(payload)));
    await promises_1.default.writeFile(path_1.default.join(dir, `${id}.bin`), Buffer.from(enc));
    await promises_1.default.writeFile(path_1.default.join(dir, `${id}.json`), JSON.stringify({ id, name: deviceInfo.name || 'USB Key', serial: deviceInfo.serial || null, status: 'backup', createdAt: Date.now() }));
    return { id };
});
electron_1.ipcMain.handle('usb:removeRegisteredDevice', async (_ev, id) => {
    const dir = registeredDevicesDir();
    try {
        await promises_1.default.unlink(path_1.default.join(dir, `${id}.bin`));
        await promises_1.default.unlink(path_1.default.join(dir, `${id}.json`));
    }
    catch (e) { }
    return { ok: true };
});
electron_1.ipcMain.handle('usb:setPrimaryDevice', async (_ev, id) => {
    const dir = registeredDevicesDir();
    try {
        const files = await promises_1.default.readdir(dir);
        for (const f of files.filter(x => x.endsWith('.json'))) {
            const p = path_1.default.join(dir, f);
            const txt = await promises_1.default.readFile(p, 'utf8');
            const meta = JSON.parse(txt);
            meta.status = meta.id === id ? 'primary' : (meta.status === 'primary' ? 'backup' : meta.status || 'backup');
            await promises_1.default.writeFile(p, JSON.stringify(meta, null, 2), 'utf8');
        }
    }
    catch (e) { }
    return { ok: true };
});
// Validation helpers: RPC and contract checks (basic)
electron_1.ipcMain.handle('validate:rpc', async (_ev, rpcUrl) => {
    try {
        const body = JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 });
        const resp = await fetch(rpcUrl, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } });
        const j = await resp.json();
        if (j && j.result)
            return { ok: true, chainId: parseInt(j.result, 16) };
        return { ok: false };
    }
    catch (e) {
        return { ok: false, message: String(e) };
    }
});
electron_1.ipcMain.handle('validate:contract', async (_ev, rpcUrl, contractAddress) => {
    try {
        const body = JSON.stringify({ jsonrpc: '2.0', method: 'eth_getCode', params: [contractAddress, 'latest'], id: 1 });
        const resp = await fetch(rpcUrl, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } });
        const j = await resp.json();
        if (j && j.result)
            return { ok: true, code: j.result };
        return { ok: false };
    }
    catch (e) {
        return { ok: false, message: String(e) };
    }
});
electron_1.ipcMain.handle('registry:addToken', async (_ev, chainId, token) => {
    return await registry.addTokenToChain(chainId, token);
});
electron_1.ipcMain.handle('registry:removeToken', async (_ev, chainId, symbol) => {
    return await registry.removeToken(chainId, symbol);
});
//# sourceMappingURL=main.js.map