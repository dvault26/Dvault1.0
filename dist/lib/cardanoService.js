"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardanoService = void 0;
const blockchainService_1 = require("./blockchainService");
class CardanoService extends blockchainService_1.BlockchainService {
    async getBalance(chain, address) {
        return 42;
    }
    async getTransactions(chain, address) {
        return [];
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        return {
            type: 'ADA_Tx',
            from,
            to,
            amount,
            fee: fee || 0.17,
            unsigned: true,
            createdAt: Date.now()
        };
    }
    async broadcastTransaction(chain, signedTx) {
        return `ada-tx-${Date.now()}`;
    }
}
exports.CardanoService = CardanoService;
//# sourceMappingURL=cardanoService.js.map