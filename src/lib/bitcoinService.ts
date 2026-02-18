import { BlockchainService } from './blockchainService'

export class BitcoinService extends BlockchainService {
  async getBalance(chain: string, address: string): Promise<number> {
    return 0.12345678
  }

  async getTransactions(chain: string, address: string): Promise<any[]> {
    return []
  }

  async buildTransaction(chain: string, from: string, to: string, amount: number, fee = 0): Promise<any> {
    return {
      type: 'BTC_Tx',
      inputs: [{ from }],
      outputs: [{ to, amount }],
      fee: fee || 0.0001,
      unsigned: true,
      createdAt: Date.now()
    }
  }

  async broadcastTransaction(chain: string, signedTx: string): Promise<string> {
    return `btc-tx-${Date.now()}`
  }
}
