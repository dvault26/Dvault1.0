"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainMock = void 0;
const xrpService_1 = require("../lib/xrpService");
const xlmService_1 = require("../lib/xlmService");
const bitcoinService_1 = require("../lib/bitcoinService");
const ethereumService_1 = require("../lib/ethereumService");
const solanaService_1 = require("../lib/solanaService");
const polygonService_1 = require("../lib/polygonService");
const bscService_1 = require("../lib/bscService");
const avalancheService_1 = require("../lib/avalancheService");
const litecoinService_1 = require("../lib/litecoinService");
const cardanoService_1 = require("../lib/cardanoService");
const genericService_1 = require("../lib/genericService");
class BlockchainMock {
    constructor() {
        this.xrp = new xrpService_1.XRPService();
        this.xlm = new xlmService_1.XLMService();
        this.btc = new bitcoinService_1.BitcoinService();
        this.eth = new ethereumService_1.EthereumService();
        this.sol = new solanaService_1.SolanaService();
        this.polygon = new polygonService_1.PolygonService();
        this.bsc = new bscService_1.BSCService();
        this.avax = new avalancheService_1.AvalancheService();
        this.ltc = new litecoinService_1.LitecoinService();
        this.ada = new cardanoService_1.CardanoService();
        this.genericMap = {};
    }
    ensureGeneric(sym) {
        const s = sym.toUpperCase();
        if (!this.genericMap[s])
            this.genericMap[s] = new genericService_1.GenericService(s);
        return this.genericMap[s];
    }
    serviceFor(chain) {
        const c = (chain || '').toUpperCase();
        switch (c) {
            case 'XRP': return this.xrp;
            case 'XLM': return this.xlm;
            case 'BTC': return this.btc;
            case 'BITCOIN': return this.btc;
            case 'ETH': return this.eth;
            case 'ETHEREUM': return this.eth;
            case 'SOL': return this.sol;
            case 'SOLANA': return this.sol;
            case 'POLYGON': return this.polygon;
            case 'MATIC': return this.polygon;
            case 'BSC': return this.bsc;
            case 'BEP20': return this.bsc;
            case 'AVAX': return this.avax;
            case 'LTC': return this.ltc;
            case 'LITECOIN': return this.ltc;
            case 'ADA': return this.ada;
            case 'CARDANO': return this.ada;
            default:
                // If user passes a token symbol (e.g., DOGE, SHIB, PEPE, USDT, USDC, etc.), return a generic service
                return this.ensureGeneric(c);
        }
    }
    async getBalance(chain, address) {
        return this.serviceFor(chain).getBalance(chain, address);
    }
    async getTransactions(chain, address) {
        return this.serviceFor(chain).getTransactions(chain, address);
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        return this.serviceFor(chain).buildTransaction(chain, from, to, amount, fee);
    }
    async broadcastTransaction(chain, signedTx) {
        return this.serviceFor(chain).broadcastTransaction(chain, signedTx);
    }
}
exports.BlockchainMock = BlockchainMock;
//# sourceMappingURL=blockchainMock.js.map