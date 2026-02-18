import { BlockchainService } from './blockchainService'

export class XLMService extends BlockchainService {
  async getBalance(chain: string, address: string): Promise<number> {
    return 987.65
  }

  async getTransactions(chain: string, address: string): Promise<any[]> {
    return []
  }

  async buildTransaction(chain: string, from: string, to: string, amount: number, fee = 0): Promise<any> {
    // Simple XLM unsigned payment representation (mock)
    return {
      type: 'XLM_Payment',
      source: from,
      destination: to,
      amount: amount,
      fee: fee || 0.00001,
      unsigned: true,
      createdAt: Date.now()
    }
  }

  async broadcastTransaction(chain: string, signedTx: string): Promise<string> {
    return `xlm-tx-${Date.now()}`
  }
}
