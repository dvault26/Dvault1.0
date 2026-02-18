"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XLMService = void 0;
const blockchainService_1 = require("./blockchainService");
class XLMService extends blockchainService_1.BlockchainService {
    async getBalance(chain, address) {
        return 987.65;
    }
    async getTransactions(chain, address) {
        return [];
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        // Simple XLM unsigned payment representation (mock)
        return {
            type: 'XLM_Payment',
            source: from,
            destination: to,
            amount: amount,
            fee: fee || 0.00001,
            unsigned: true,
            createdAt: Date.now()
        };
    }
    async broadcastTransaction(chain, signedTx) {
        return `xlm-tx-${Date.now()}`;
    }
}
exports.XLMService = XLMService;
//# sourceMappingURL=xlmService.js.map