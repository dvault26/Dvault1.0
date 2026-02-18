import { XRPService } from '../lib/xrpService'
import { XLMService } from '../lib/xlmService'
import { BitcoinService } from '../lib/bitcoinService'
import { EthereumService } from '../lib/ethereumService'
import { SolanaService } from '../lib/solanaService'
import { PolygonService } from '../lib/polygonService'
import { BSCService } from '../lib/bscService'
import { AvalancheService } from '../lib/avalancheService'
import { LitecoinService } from '../lib/litecoinService'
import { CardanoService } from '../lib/cardanoService'
import { GenericService } from '../lib/genericService'

export class BlockchainMock {
  private xrp = new XRPService()
  private xlm = new XLMService()
  private btc = new BitcoinService()
  private eth = new EthereumService()
  private sol = new SolanaService()
  private polygon = new PolygonService()
  private bsc = new BSCService()
  private avax = new AvalancheService()
  private ltc = new LitecoinService()
  private ada = new CardanoService()
  private genericMap: Record<string, GenericService> = {}

  private ensureGeneric(sym: string) {
    const s = sym.toUpperCase()
    if (!this.genericMap[s]) this.genericMap[s] = new GenericService(s)
    return this.genericMap[s]
  }

  private serviceFor(chain: string) {
    const c = (chain || '').toUpperCase()
    switch (c) {
      case 'XRP': return this.xrp
      case 'XLM': return this.xlm
      case 'BTC': return this.btc
      case 'BITCOIN': return this.btc
      case 'ETH': return this.eth
      case 'ETHEREUM': return this.eth
      case 'SOL': return this.sol
      case 'SOLANA': return this.sol
      case 'POLYGON': return this.polygon
      case 'MATIC': return this.polygon
      case 'BSC': return this.bsc
      case 'BEP20': return this.bsc
      case 'AVAX': return this.avax
      case 'LTC': return this.ltc
      case 'LITECOIN': return this.ltc
      case 'ADA': return this.ada
      case 'CARDANO': return this.ada
      default:
        // If user passes a token symbol (e.g., DOGE, SHIB, PEPE, USDT, USDC, etc.), return a generic service
        return this.ensureGeneric(c)
    }
  }

  async getBalance(chain: string, address: string): Promise<number> {
    return this.serviceFor(chain).getBalance(chain, address)
  }

  async getTransactions(chain: string, address: string): Promise<any[]> {
    return this.serviceFor(chain).getTransactions(chain, address)
  }

  async buildTransaction(chain: string, from: string, to: string, amount: number, fee = 0): Promise<any> {
    return this.serviceFor(chain).buildTransaction(chain, from, to, amount, fee)
  }

  async broadcastTransaction(chain: string, signedTx: string): Promise<string> {
    return this.serviceFor(chain).broadcastTransaction(chain, signedTx)
  }
}
