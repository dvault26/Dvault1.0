import { BlockchainService } from './blockchainService'

export class CardanoService extends BlockchainService {
  async getBalance(chain: string, address: string): Promise<number> {
    return 42
  }

  async getTransactions(chain: string, address: string): Promise<any[]> {
    return []
  }

  async buildTransaction(chain: string, from: string, to: string, amount: number, fee = 0): Promise<any> {
    return {
      type: 'ADA_Tx',
      from,
      to,
      amount,
      fee: fee || 0.17,
      unsigned: true,
      createdAt: Date.now()
    }
  }

  async broadcastTransaction(chain: string, signedTx: string): Promise<string> {
    return `ada-tx-${Date.now()}`
  }
}
