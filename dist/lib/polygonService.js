"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolygonService = void 0;
const blockchainService_1 = require("./blockchainService");
class PolygonService extends blockchainService_1.BlockchainService {
    async getBalance(chain, address) {
        return 10;
    }
    async getTransactions(chain, address) {
        return [];
    }
    async buildTransaction(chain, from, to, amount, fee = 0) {
        return {
            type: 'POLYGON_Tx',
            from,
            to,
            value: amount,
            gasPrice: fee || 1e9,
            unsigned: true,
            createdAt: Date.now()
        };
    }
    async broadcastTransaction(chain, signedTx) {
        return `polygon-tx-${Date.now()}`;
    }
}
exports.PolygonService = PolygonService;
//# sourceMappingURL=polygonService.js.map