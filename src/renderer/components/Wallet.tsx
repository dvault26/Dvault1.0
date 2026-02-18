import React from 'react'
import { Link } from 'react-router-dom'

const mockAssets = [
  { symbol: 'XRP', balance: 123.45 },
  { symbol: 'XLM', balance: 987.65 }
]

export default function Wallet(){
  return (
    <div>
      <h2>Wallet</h2>
      <div className="panel">
        <h4>Assets</h4>
        <div className="list">
          {mockAssets.map(a => (
            <Link key={a.symbol} to={`/wallet/${a.symbol}`} className="list-item">
              <div>{a.symbol}</div>
              <div>{a.balance}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
