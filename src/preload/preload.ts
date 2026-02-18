import { contextBridge, ipcRenderer } from 'electron'

// Add console logging for debugging
console.log('[Preload] Loading preload script...')

contextBridge.exposeInMainWorld('dvault', {
  signer: {
    connectMock: async () => ipcRenderer.invoke('signer:connect-mock'),
    status: async () => ipcRenderer.invoke('signer:status'),
    generateKeyPair: async (chain: string) => ipcRenderer.invoke('signer:generateKeyPair', chain),
    getPublicKey: async () => ipcRenderer.invoke('signer:getPublicKey'),
    sign: async (chain: string, payload: string) => ipcRenderer.invoke('signer:sign', chain, payload)
  }
})

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  blockchain: {
    getBalance: async (chain: string, address: string) => ipcRenderer.invoke('blockchain:getBalance', chain, address),
    getTransactions: async (chain: string, address: string) => ipcRenderer.invoke('blockchain:getTransactions', chain, address),
    buildTransaction: async (chain: string, from: string, to: string, amount: number, fee?: number) => ipcRenderer.invoke('blockchain:buildTransaction', chain, from, to, amount, fee),
    broadcastTransaction: async (chain: string, signedTx: string) => ipcRenderer.invoke('blockchain:broadcastTransaction', chain, signedTx)
  }
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  vault: {
    storeBlob: async (filename: string, b64data: string) => ipcRenderer.invoke('vault:storeBlob', filename, b64data),
    listBlobs: async () => ipcRenderer.invoke('vault:listBlobs'),
    getBlob: async (filename: string) => ipcRenderer.invoke('vault:getBlob', filename)
  }
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  registry: {
    get: async () => ipcRenderer.invoke('registry:get'),
    addChain: async (chain: any) => ipcRenderer.invoke('registry:addChain', chain),
    updateChain: async (id: string, patch: any) => ipcRenderer.invoke('registry:updateChain', id, patch),
    addToken: async (chainId: string, token: any) => ipcRenderer.invoke('registry:addToken', chainId, token),
    removeToken: async (chainId: string, symbol: string) => ipcRenderer.invoke('registry:removeToken', chainId, symbol)
  }
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  usb: {
    listDevices: async () => ipcRenderer.invoke('usb:listDevices'),
    createDevice: async (deviceId: string, licenseId?: string) => ipcRenderer.invoke('usb:createDevice', deviceId, licenseId),
    connect: async (deviceId: string) => ipcRenderer.invoke('usb:connect', deviceId),
    disconnect: async () => ipcRenderer.invoke('usb:disconnect'),
    scanHid: async () => ipcRenderer.invoke('usb:scanHid'),
    connectHid: async (deviceInfo: any) => ipcRenderer.invoke('usb:connect-hid', deviceInfo)
  }
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  bank: {
    createConnection: async (id: string, name: string, username: string, password: string) => ipcRenderer.invoke('bank:createConnection', id, name, username, password),
    listConnections: async () => ipcRenderer.invoke('bank:listConnections'),
    getConnection: async (id: string) => ipcRenderer.invoke('bank:getConnection', id),
    removeConnection: async (id: string) => ipcRenderer.invoke('bank:removeConnection', id),
    getBalance: async (id: string) => ipcRenderer.invoke('bank:getBalance', id)
  }
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  oauth: {
    start: async (opts: { authUrl: string, tokenUrl: string, clientId: string, scope?: string, id?: string }) => ipcRenderer.invoke('bank:oauth-start', opts)
  }
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  plaid: {
    setCredentials: async (clientId: string, secret: string) => ipcRenderer.invoke('plaid:setCredentials', clientId, secret),
    createSandboxPublicToken: async (institution_id: string, initial_products?: string[]) => ipcRenderer.invoke('plaid:createSandboxPublicToken', institution_id, initial_products),
    exchangePublicToken: async (public_token: string) => ipcRenderer.invoke('plaid:exchangePublicToken', public_token),
    getBalances: async (access_token: string) => ipcRenderer.invoke('plaid:getBalances', access_token)
  }
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  license: {
    verify: async (fullName: string, email: string, licenseKey: string, deviceInfo?: any) => ipcRenderer.invoke('license:verify', fullName, email, licenseKey, deviceInfo),
    status: async () => ipcRenderer.invoke('license:getStatus')
  }
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  transfer: {
    storePretransfer: async (info: any) => ipcRenderer.invoke('transfer:storePretransfer', info),
    getPretransfer: async (id: string) => ipcRenderer.invoke('transfer:getPretransfer', id),
    listPretransfers: async () => ipcRenderer.invoke('transfer:listPretransfers'),
    labelTransaction: async (tx: any, preId: string) => ipcRenderer.invoke('transfer:labelTransaction', tx, preId)
  }
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  brokerage: {
    detect: async (address: string, chain?: string) => ipcRenderer.invoke('brokerage:detect', address, chain)
  },
  transfer: Object.assign((window as any).dvault.transfer || {}, {
    findMetadata: async (tx: any) => ipcRenderer.invoke('transfer:findMetadata', tx)
  })
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  settings: {
    get: async () => ipcRenderer.invoke('settings:get'),
    setLanguage: async (lang: string) => ipcRenderer.invoke('settings:setLanguage', lang),
    save: async (patch: any) => ipcRenderer.invoke('settings:save', patch),
    listRegisteredUsb: async () => ipcRenderer.invoke('usb:listRegistered'),
    registerUsb: async (deviceInfo: any) => ipcRenderer.invoke('usb:registerDevice', deviceInfo),
    removeRegisteredUsb: async (id: string) => ipcRenderer.invoke('usb:removeRegisteredDevice', id),
    setPrimaryUsb: async (id: string) => ipcRenderer.invoke('usb:setPrimaryDevice', id),
    validateRpc: async (rpcUrl: string) => ipcRenderer.invoke('validate:rpc', rpcUrl),
    validateContract: async (rpcUrl: string, contractAddress: string) => ipcRenderer.invoke('validate:contract', rpcUrl, contractAddress)
  }
}))

contextBridge.exposeInMainWorld('dvault', Object.assign((window as any).dvault || {}, {
  app: {
    getVersion: async () => ipcRenderer.invoke('app:getVersion')
  },
  updates: {
    check: async () => ipcRenderer.invoke('updates:check')
  },
  securityKey: {
    initialize: async () => ipcRenderer.invoke('security-key:initialize'),
    list: async () => ipcRenderer.invoke('security-key:list'),
    register: async (deviceInfo: any, password: string, name: string) => ipcRenderer.invoke('security-key:register', deviceInfo, password, name),
    setPrimary: async (keyId: string) => ipcRenderer.invoke('security-key:setPrimary', keyId),
    remove: async (keyId: string) => ipcRenderer.invoke('security-key:remove', keyId),
    sign: async (keyId: string, data: string, password: string) => ipcRenderer.invoke('security-key:sign', keyId, data, password),
    verify: async (keyId: string, data: string, signature: string, password: string) => ipcRenderer.invoke('security-key:verify', keyId, data, signature, password),
    export: async (keyId: string, password: string) => ipcRenderer.invoke('security-key:export', keyId, password),
    import: async (exportedKey: string, password: string) => ipcRenderer.invoke('security-key:import', exportedKey, password)
  }
}))

console.log('[Preload] Successfully exposed window.dvault API')
console.log('[Preload] Available APIs:', Object.keys((window as any).dvault || {}).join(', '))
