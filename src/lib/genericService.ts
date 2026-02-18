import { BlockchainService } from './blockchainService'

export class GenericService extends BlockchainService {
  private symbol: string
  constructor(symbol: string) {
    super()
    this.symbol = symbol
  }

  async getBalance(chain: string, address: string): Promise<number> {
    // Return a deterministic mock based on symbol hash
    let h = 0
    for (let i = 0; i < this.symbol.length; i++) h = (h * 31 + this.symbol.charCodeAt(i)) | 0
    const v = Math.abs(h % 10000) / 100
    return v
  }

  async getTransactions(chain: string, address: string): Promise<any[]> {
    return []
  }

  async buildTransaction(chain: string, from: string, to: string, amount: number, fee = 0): Promise<any> {
    return {
      type: `${this.symbol}_Transfer`,
      from,
      to,
      amount,
      fee,
      unsigned: true,
      createdAt: Date.now()
    }
  }

  async broadcastTransaction(chain: string, signedTx: string): Promise<string> {
    return `${this.symbol.toLowerCase()}-tx-${Date.now()}`
  }
}
