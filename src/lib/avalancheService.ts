import { BlockchainService } from './blockchainService'

export class AvalancheService extends BlockchainService {
  async getBalance(chain: string, address: string): Promise<number> {
    return 5
  }

  async getTransactions(chain: string, address: string): Promise<any[]> {
    return []
  }

  async buildTransaction(chain: string, from: string, to: string, amount: number, fee = 0): Promise<any> {
    return {
      type: 'AVAX_Tx',
      from,
      to,
      value: amount,
      fee: fee || 225000,
      unsigned: true,
      createdAt: Date.now()
    }
  }

  async broadcastTransaction(chain: string, signedTx: string): Promise<string> {
    return `avax-tx-${Date.now()}`
  }
}
