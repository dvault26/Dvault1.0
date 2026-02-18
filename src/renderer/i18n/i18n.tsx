import React, { createContext, useContext, useMemo, useState } from 'react'
import en from './en.json'
import es from './es.json'

const catalog: Record<string, any> = { en, es }

type TFn = (key: string, vars?: Record<string, any>) => string

const I18nContext = createContext<{ lang: string; t: TFn; setLang: (l: string) => void }>({ lang: 'en', t: (k) => k, setLang: () => {} })

export const I18nProvider: React.FC<{ defaultLang?: string, children?: any }> = ({ defaultLang = 'en', children }) => {
  const [lang, setLang] = useState(defaultLang)
  const t: TFn = (key: string, vars?: Record<string, any>) => {
    const parts = key.split('.')
    let cur: any = catalog[lang] || catalog['en']
    for (const p of parts) { cur = cur && cur[p] }
    let str = cur || key
    if (vars) {
      for (const k of Object.keys(vars)) str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(vars[k]))
    }
    return str
  }
  const val = useMemo(() => ({ lang, t, setLang }), [lang])
  return <I18nContext.Provider value={val}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
