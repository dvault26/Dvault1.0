"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitcoinService = void 0;
const blockchainService_1 = require("./blockchainService");
class BitcoinService extends blockchainService_1.BlockchainService {
    async getBalance(chain, address) {
        return 0.12345678;
    }
    async getTransactions(chain, address) {
        return [];
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        return {
            type: 'BTC_Tx',
            inputs: [{ from }],
            outputs: [{ to, amount }],
            fee: fee || 0.0001,
            unsigned: true,
            createdAt: Date.now()
        };
    }
    async broadcastTransaction(chain, signedTx) {
        return `btc-tx-${Date.now()}`;
    }
}
exports.BitcoinService = BitcoinService;
//# sourceMappingURL=bitcoinService.js.map