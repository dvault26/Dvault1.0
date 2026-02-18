import { BlockchainService } from './blockchainService'

export class SolanaService extends BlockchainService {
  async getBalance(chain: string, address: string): Promise<number> {
    return 12.34
  }

  async getTransactions(chain: string, address: string): Promise<any[]> {
    return []
  }

  async buildTransaction(chain: string, from: string, to: string, amount: number, fee = 0): Promise<any> {
    return {
      type: 'SOL_Transfer',
      from,
      to,
      lamports: amount,
      fee: fee || 5000,
      unsigned: true,
      createdAt: Date.now()
    }
  }

  async broadcastTransaction(chain: string, signedTx: string): Promise<string> {
    return `sol-tx-${Date.now()}`
  }
}
