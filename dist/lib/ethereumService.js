"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumService = void 0;
const blockchainService_1 = require("./blockchainService");
class EthereumService extends blockchainService_1.BlockchainService {
    async getBalance(chain, address) {
        return 0.5;
    }
    async getTransactions(chain, address) {
        return [];
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        return {
            type: 'ETH_Tx',
            from,
            to,
            value: amount,
            gasPrice: fee || 1e9,
            unsigned: true,
            createdAt: Date.now()
        };
    }
    async broadcastTransaction(chain, signedTx) {
        return `eth-tx-${Date.now()}`;
    }
}
exports.EthereumService = EthereumService;
//# sourceMappingURL=ethereumService.js.map