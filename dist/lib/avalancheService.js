"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvalancheService = void 0;
const blockchainService_1 = require("./blockchainService");
class AvalancheService extends blockchainService_1.BlockchainService {
    async getBalance(chain, address) {
        return 5;
    }
    async getTransactions(chain, address) {
        return [];
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        return {
            type: 'AVAX_Tx',
            from,
            to,
            value: amount,
            fee: fee || 225000,
            unsigned: true,
            createdAt: Date.now()
        };
    }
    async broadcastTransaction(chain, signedTx) {
        return `avax-tx-${Date.now()}`;
    }
}
exports.AvalancheService = AvalancheService;
//# sourceMappingURL=avalancheService.js.map