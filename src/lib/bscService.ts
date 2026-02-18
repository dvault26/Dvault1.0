import { BlockchainService } from './blockchainService'

export class BSCService extends BlockchainService {
  async getBalance(chain: string, address: string): Promise<number> {
    return 20
  }

  async getTransactions(chain: string, address: string): Promise<any[]> {
    return []
  }

  async buildTransaction(chain: string, from: string, to: string, amount: number, fee = 0): Promise<any> {
    return {
      type: 'BSC_Tx',
      from,
      to,
      value: amount,
      gasPrice: fee || 1e9,
      unsigned: true,
      createdAt: Date.now()
    }
  }

  async broadcastTransaction(chain: string, signedTx: string): Promise<string> {
    return `bsc-tx-${Date.now()}`
  }
}
