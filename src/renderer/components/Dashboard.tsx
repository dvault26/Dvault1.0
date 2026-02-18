import React from 'react'

export default function Dashboard(){
  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{display:'flex',gap:12}}>
        <div style={{flex:1}} className="panel">
          <h4>Total Balance</h4>
          <div style={{fontSize:28,fontWeight:700}}>—</div>
          <div className="muted">Portfolio summary and recent activity</div>
        </div>
        <div style={{width:320}} className="panel">
          <h4>Device Status</h4>
          <div className="muted">No device connected (mock)</div>
        </div>
      </div>
      <div style={{marginTop:16}} className="panel">
        <h4>Recent Transactions</h4>
        <div className="muted">None</div>
      </div>
    </div>
  )
}
