"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaService = void 0;
const blockchainService_1 = require("./blockchainService");
class SolanaService extends blockchainService_1.BlockchainService {
    async getBalance(chain, address) {
        return 12.34;
    }
    async getTransactions(chain, address) {
        return [];
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        return {
            type: 'SOL_Transfer',
            from,
            to,
            lamports: amount,
            fee: fee || 5000,
            unsigned: true,
            createdAt: Date.now()
        };
    }
    async broadcastTransaction(chain, signedTx) {
        return `sol-tx-${Date.now()}`;
    }
}
exports.SolanaService = SolanaService;
//# sourceMappingURL=solanaService.js.map