"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Add console logging for debugging
console.log('[Preload] Loading preload script...');
electron_1.contextBridge.exposeInMainWorld('dvault', {
    signer: {
        connectMock: async () => electron_1.ipcRenderer.invoke('signer:connect-mock'),
        status: async () => electron_1.ipcRenderer.invoke('signer:status'),
        generateKeyPair: async (chain) => electron_1.ipcRenderer.invoke('signer:generateKeyPair', chain),
        getPublicKey: async () => electron_1.ipcRenderer.invoke('signer:getPublicKey'),
        sign: async (chain, payload) => electron_1.ipcRenderer.invoke('signer:sign', chain, payload)
    }
});
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    blockchain: {
        getBalance: async (chain, address) => electron_1.ipcRenderer.invoke('blockchain:getBalance', chain, address),
        getTransactions: async (chain, address) => electron_1.ipcRenderer.invoke('blockchain:getTransactions', chain, address),
        buildTransaction: async (chain, from, to, amount, fee) => electron_1.ipcRenderer.invoke('blockchain:buildTransaction', chain, from, to, amount, fee),
        broadcastTransaction: async (chain, signedTx) => electron_1.ipcRenderer.invoke('blockchain:broadcastTransaction', chain, signedTx)
    }
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    vault: {
        storeBlob: async (filename, b64data) => electron_1.ipcRenderer.invoke('vault:storeBlob', filename, b64data),
        listBlobs: async () => electron_1.ipcRenderer.invoke('vault:listBlobs'),
        getBlob: async (filename) => electron_1.ipcRenderer.invoke('vault:getBlob', filename)
    }
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    registry: {
        get: async () => electron_1.ipcRenderer.invoke('registry:get'),
        addChain: async (chain) => electron_1.ipcRenderer.invoke('registry:addChain', chain),
        updateChain: async (id, patch) => electron_1.ipcRenderer.invoke('registry:updateChain', id, patch),
        addToken: async (chainId, token) => electron_1.ipcRenderer.invoke('registry:addToken', chainId, token),
        removeToken: async (chainId, symbol) => electron_1.ipcRenderer.invoke('registry:removeToken', chainId, symbol)
    }
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    usb: {
        listDevices: async () => electron_1.ipcRenderer.invoke('usb:listDevices'),
        createDevice: async (deviceId, licenseId) => electron_1.ipcRenderer.invoke('usb:createDevice', deviceId, licenseId),
        connect: async (deviceId) => electron_1.ipcRenderer.invoke('usb:connect', deviceId),
        disconnect: async () => electron_1.ipcRenderer.invoke('usb:disconnect'),
        scanHid: async () => electron_1.ipcRenderer.invoke('usb:scanHid'),
        connectHid: async (deviceInfo) => electron_1.ipcRenderer.invoke('usb:connect-hid', deviceInfo)
    }
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    bank: {
        createConnection: async (id, name, username, password) => electron_1.ipcRenderer.invoke('bank:createConnection', id, name, username, password),
        listConnections: async () => electron_1.ipcRenderer.invoke('bank:listConnections'),
        getConnection: async (id) => electron_1.ipcRenderer.invoke('bank:getConnection', id),
        removeConnection: async (id) => electron_1.ipcRenderer.invoke('bank:removeConnection', id),
        getBalance: async (id) => electron_1.ipcRenderer.invoke('bank:getBalance', id)
    }
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    oauth: {
        start: async (opts) => electron_1.ipcRenderer.invoke('bank:oauth-start', opts)
    }
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    plaid: {
        setCredentials: async (clientId, secret) => electron_1.ipcRenderer.invoke('plaid:setCredentials', clientId, secret),
        createSandboxPublicToken: async (institution_id, initial_products) => electron_1.ipcRenderer.invoke('plaid:createSandboxPublicToken', institution_id, initial_products),
        exchangePublicToken: async (public_token) => electron_1.ipcRenderer.invoke('plaid:exchangePublicToken', public_token),
        getBalances: async (access_token) => electron_1.ipcRenderer.invoke('plaid:getBalances', access_token)
    }
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    license: {
        verify: async (fullName, email, licenseKey, deviceInfo) => electron_1.ipcRenderer.invoke('license:verify', fullName, email, licenseKey, deviceInfo),
        status: async () => electron_1.ipcRenderer.invoke('license:getStatus')
    }
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    transfer: {
        storePretransfer: async (info) => electron_1.ipcRenderer.invoke('transfer:storePretransfer', info),
        getPretransfer: async (id) => electron_1.ipcRenderer.invoke('transfer:getPretransfer', id),
        listPretransfers: async () => electron_1.ipcRenderer.invoke('transfer:listPretransfers'),
        labelTransaction: async (tx, preId) => electron_1.ipcRenderer.invoke('transfer:labelTransaction', tx, preId)
    }
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    brokerage: {
        detect: async (address, chain) => electron_1.ipcRenderer.invoke('brokerage:detect', address, chain)
    },
    transfer: Object.assign(window.dvault.transfer || {}, {
        findMetadata: async (tx) => electron_1.ipcRenderer.invoke('transfer:findMetadata', tx)
    })
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    settings: {
        get: async () => electron_1.ipcRenderer.invoke('settings:get'),
        setLanguage: async (lang) => electron_1.ipcRenderer.invoke('settings:setLanguage', lang),
        save: async (patch) => electron_1.ipcRenderer.invoke('settings:save', patch),
        listRegisteredUsb: async () => electron_1.ipcRenderer.invoke('usb:listRegistered'),
        registerUsb: async (deviceInfo) => electron_1.ipcRenderer.invoke('usb:registerDevice', deviceInfo),
        removeRegisteredUsb: async (id) => electron_1.ipcRenderer.invoke('usb:removeRegisteredDevice', id),
        setPrimaryUsb: async (id) => electron_1.ipcRenderer.invoke('usb:setPrimaryDevice', id),
        validateRpc: async (rpcUrl) => electron_1.ipcRenderer.invoke('validate:rpc', rpcUrl),
        validateContract: async (rpcUrl, contractAddress) => electron_1.ipcRenderer.invoke('validate:contract', rpcUrl, contractAddress)
    }
}));
electron_1.contextBridge.exposeInMainWorld('dvault', Object.assign(window.dvault || {}, {
    app: {
        getVersion: async () => electron_1.ipcRenderer.invoke('app:getVersion')
    },
    updates: {
        check: async () => electron_1.ipcRenderer.invoke('updates:check')
    },
    securityKey: {
        initialize: async () => electron_1.ipcRenderer.invoke('security-key:initialize'),
        list: async () => electron_1.ipcRenderer.invoke('security-key:list'),
        register: async (deviceInfo, password, name) => electron_1.ipcRenderer.invoke('security-key:register', deviceInfo, password, name),
        setPrimary: async (keyId) => electron_1.ipcRenderer.invoke('security-key:setPrimary', keyId),
        remove: async (keyId) => electron_1.ipcRenderer.invoke('security-key:remove', keyId),
        sign: async (keyId, data, password) => electron_1.ipcRenderer.invoke('security-key:sign', keyId, data, password),
        verify: async (keyId, data, signature, password) => electron_1.ipcRenderer.invoke('security-key:verify', keyId, data, signature, password),
        export: async (keyId, password) => electron_1.ipcRenderer.invoke('security-key:export', keyId, password),
        import: async (exportedKey, password) => electron_1.ipcRenderer.invoke('security-key:import', exportedKey, password)
    }
}));
console.log('[Preload] Successfully exposed window.dvault API');
console.log('[Preload] Available APIs:', Object.keys(window.dvault || {}).join(', '));
//# sourceMappingURL=preload.js.map