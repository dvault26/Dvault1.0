import { BlockchainService } from './blockchainService'

export class PolygonService extends BlockchainService {
  async getBalance(chain: string, address: string): Promise<number> {
    return 10
  }

  async getTransactions(chain: string, address: string): Promise<any[]> {
    return []
  }

  async buildTransaction(chain: string, from: string, to: string, amount: number, fee = 0): Promise<any> {
    return {
      type: 'POLYGON_Tx',
      from,
      to,
      value: amount,
      gasPrice: fee || 1e9,
      unsigned: true,
      createdAt: Date.now()
    }
  }

  async broadcastTransaction(chain: string, signedTx: string): Promise<string> {
    return `polygon-tx-${Date.now()}`
  }
}
