import { useState, useRef } from 'react'

const STORAGE_PREFIX = 'st_'

export default function BackupModal({ onClose }) {
  const [step, setStep] = useState('menu')
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)

  const collectData = () => {
    const data = { __version: 1, __exportedAt: new Date().toISOString() }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try { data[key] = localStorage.getItem(key) } catch {}
      }
    }
    return data
  }

  const handleExport = () => {
    const data = collectData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `planner-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setMsg('Backup downloaded successfully!')
    setTimeout(() => onClose(), 1500)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        let count = 0
        for (const key of Object.keys(data)) {
          if (key.startsWith(STORAGE_PREFIX) && data[key] !== undefined) {
            localStorage.setItem(key, data[key])
            count++
          }
        }
        setMsg(`Restored ${count} items! Refreshing...`)
        setTimeout(() => window.location.reload(), 1200)
      } catch {
        setMsg('Invalid backup file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="rounded-2xl p-6 max-w-sm w-full space-y-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>
            {step === 'menu' ? 'Backup & Restore' : step === 'download-info' ? 'Download Backup' : 'Restore Backup'}
          </h2>
          <button onClick={onClose} className="text-xs" style={{ color: 'var(--muted)' }}>✕</button>
        </div>

        {step === 'menu' && (
          <>
            <div className="text-xs space-y-2" style={{ color: 'var(--muted)' }}>
              <p>Download your data as a backup file so you never lose it. Reinstall the app? Just restore from the same file and everything comes back.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => setStep('download-info')}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--accent)' }}>
                Download Backup
              </button>
              <div className="relative">
                <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                <button onClick={() => fileRef.current?.click()}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
                  Restore from Backup
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'download-info' && (
          <>
            <div className="text-xs space-y-3" style={{ color: 'var(--muted)' }}>
              <p>A <strong style={{ color: 'var(--fg)' }}>.json backup file</strong> will be downloaded to your device containing:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Your To-Do list and categories</li>
                <li>Exam tracker data</li>
                <li>Tests & analysis</li>
                <li>Study materials</li>
                <li>Syllabus progress</li>
                <li>Calendar events</li>
                <li>Study planner sessions</li>
                <li>Theme settings & preferences</li>
              </ul>
              <p className="pt-1">Keep this file safe. Use <strong style={{ color: 'var(--fg)' }}>Restore from Backup</strong> anytime to get your data back.</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleExport}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--accent)' }}>
                Continue Download
              </button>
              <button onClick={() => setStep('menu')}
                className="w-full py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                style={{ color: 'var(--muted)', background: 'var(--input-bg)' }}>
                ← Back
              </button>
            </div>
          </>
        )}

        {msg && (
          <div className={`text-xs text-center py-2 px-3 rounded-lg ${msg.includes('Invalid') ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}
