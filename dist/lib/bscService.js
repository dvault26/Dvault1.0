"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BSCService = void 0;
const blockchainService_1 = require("./blockchainService");
class BSCService extends blockchainService_1.BlockchainService {
    async getBalance(chain, address) {
        return 20;
    }
    async getTransactions(chain, address) {
        return [];
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        return {
            type: 'BSC_Tx',
            from,
            to,
            value: amount,
            gasPrice: fee || 1e9,
            unsigned: true,
            createdAt: Date.now()
        };
    }
    async broadcastTransaction(chain, signedTx) {
        return `bsc-tx-${Date.now()}`;
    }
}
exports.BSCService = BSCService;
//# sourceMappingURL=bscService.js.map