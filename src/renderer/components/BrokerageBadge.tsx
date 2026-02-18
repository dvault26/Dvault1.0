import React from 'react'

type Props = {
  name?: string
  confidence?: number
  amount?: number
  currency?: string
}

export const BrokerageBadge: React.FC<Props> = ({ name, confidence = 0, amount, currency }) => {
  const conf = Math.round(confidence * 100)
  const color = confidence >= 0.9 ? '#0f9d58' : confidence >= 0.7 ? '#f6c343' : '#888'
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: '#111', color: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
      <div style={{ width: 10, height: 10, borderRadius: 5, background: color }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 600 }}>{name || 'Unknown'}</div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>{conf}% match{amount ? ` • ${amount} ${currency || ''}` : ''}</div>
      </div>
    </div>
  )
}

export default BrokerageBadge
