"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LitecoinService = void 0;
const blockchainService_1 = require("./blockchainService");
class LitecoinService extends blockchainService_1.BlockchainService {
    async getBalance(chain, address) {
        return 0.5;
    }
    async getTransactions(chain, address) {
        return [];
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        return {
            type: 'LTC_Tx',
            inputs: [{ from }],
            outputs: [{ to, amount }],
            fee: fee || 0.001,
            unsigned: true,
            createdAt: Date.now()
        };
    }
    async broadcastTransaction(chain, signedTx) {
        return `ltc-tx-${Date.now()}`;
    }
}
exports.LitecoinService = LitecoinService;
//# sourceMappingURL=litecoinService.js.map