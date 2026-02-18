"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericService = void 0;
const blockchainService_1 = require("./blockchainService");
class GenericService extends blockchainService_1.BlockchainService {
    constructor(symbol) {
        super();
        this.symbol = symbol;
    }
    async getBalance(chain, address) {
        // Return a deterministic mock based on symbol hash
        let h = 0;
        for (let i = 0; i < this.symbol.length; i++)
            h = (h * 31 + this.symbol.charCodeAt(i)) | 0;
        const v = Math.abs(h % 10000) / 100;
        return v;
    }
    async getTransactions(chain, address) {
        return [];
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        return {
            type: `${this.symbol}_Transfer`,
            from,
            to,
            amount,
            fee,
            unsigned: true,
            createdAt: Date.now()
        };
    }
    async broadcastTransaction(chain, signedTx) {
        return `${this.symbol.toLowerCase()}-tx-${Date.now()}`;
    }
}
exports.GenericService = GenericService;
//# sourceMappingURL=genericService.js.map