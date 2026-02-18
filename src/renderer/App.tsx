import React, { useEffect, useState } from 'react'
import { I18nProvider } from './i18n/i18n'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Splash from './components/Splash'
import Unlock from './components/Unlock'
import Registration from './components/Registration'
import AuthorizationConfirmation from './components/AuthorizationConfirmation'
import Sidebar from './components/Sidebar'
import PreTransferForm from './components/PreTransferForm'
import PreTransferConfirm from './components/PreTransferConfirm'
import TransactionInfoForm from './components/TransactionInfoForm'
import Dashboard from './components/Dashboard'
import Wallet from './components/Wallet'
import AssetDetail from './components/AssetDetail'
import SendFlow from './components/SendFlow'
import VaultDocuments from './components/VaultDocuments'
import BankInfo from './components/BankInfo'
import Settings from './components/Settings'
import './styles.css'

export default function App() {
  const [activated, setActivated] = useState<boolean | null>(null)

  useEffect(()=>{
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    
    // Create a timeout promise that rejects after 3 seconds
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Settings load timeout')), 3000)
    })
    
    Promise.race([window.dvault.settings.get(), timeoutPromise])
      .then((s:any)=>{ if(mounted) setActivated(!!s.activated) })
      .catch(()=>{ if(mounted) setActivated(false) })
      .finally(() => { if(timeoutId) clearTimeout(timeoutId) })
    
    return ()=>{ mounted = false; if(timeoutId) clearTimeout(timeoutId) }
  },[])

  if (activated === null) return (
    <I18nProvider>
      <div className="app-root"><main className="app-main"><Splash/></main></div>
    </I18nProvider>
  )

  // If not activated, only expose registration routes
  if (!activated) {
    return (
      <I18nProvider>
      <BrowserRouter>
        <div className="app-root">
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Registration/>} />
              <Route path="/register" element={<Registration/>} />
              <Route path="/confirm" element={<AuthorizationConfirmation/>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      </I18nProvider>
    )
  }

  return (
    <I18nProvider>
    <BrowserRouter>
      <div className="app-root">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/unlock" element={<Unlock />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/confirm" element={<AuthorizationConfirmation />} />
            <Route path="/pretransfer" element={<PreTransferForm />} />
            <Route path="/pretransfer/confirm/:id" element={<PreTransferConfirm />} />
            <Route path="/transaction-info" element={<TransactionInfoForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/wallet/:asset" element={<AssetDetail />} />
            <Route path="/send" element={<SendFlow />} />
            <Route path="/vault/docs" element={<VaultDocuments />} />
            <Route path="/vault/bank" element={<BankInfo />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    </I18nProvider>
  )
}
