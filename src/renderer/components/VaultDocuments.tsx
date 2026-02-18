import React, { useState } from 'react'

export default function VaultDocuments(){
  const [files, setFiles] = useState<string[]>([])

  async function refreshList(){
    // @ts-ignore
    const res = await window.dvault.vault.listBlobs()
    setFiles(res.files || [])
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]
    if(!f) return
    const buf = await f.arrayBuffer()
    // @ts-ignore
    const encBuf: Uint8Array = await window.dvault.signer.encryptBlob(new Uint8Array(buf))
    const b64 = Buffer.from(encBuf).toString('base64')
    // store via main process
    // @ts-ignore
    await window.dvault.vault.storeBlob(f.name, b64)
    await refreshList()
  }

  async function handleDownload(name: string){
    // get encrypted blob from main
    // @ts-ignore
    const res = await window.dvault.vault.getBlob(name)
    if(!res || !res.data) return
    const enc = Buffer.from(res.data, 'base64')
    // @ts-ignore
    const dec: Uint8Array = await window.dvault.signer.decryptBlob(new Uint8Array(enc))
    const blob = new Blob([Buffer.from(dec)])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name.replace(/ \(encrypted\)$/, '')
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  React.useEffect(()=>{ refreshList() }, [])

  return (
    <div>
      <h2>Vault — Documents</h2>
      <div className="panel">
        <input type="file" onChange={handleUpload} />
        <div style={{marginTop:12}} className="list">
          {files.map((f,i)=>(
            <div key={i} className="list-item">
              <div>{f}</div>
              <div>
                <button className="button" onClick={()=>handleDownload(f)}>Download</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
