export abstract class BlockchainService {
  abstract getBalance(chain: string, address: string): Promise<number>
  abstract getTransactions(chain: string, address: string): Promise<any[]>
  abstract buildTransaction(chain: string, from: string, to: string, amount: number, fee?: number): Promise<any>
  abstract broadcastTransaction(chain: string, signedTx: string): Promise<string>
}
