import { useState, useEffect, useRef } from 'react'

const KEY = 'st_timelogs'
const SUBJECTS = ['Physics', 'Chemistry', 'Maths', 'Biology']

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

export default function TimeLogger() {
  const [logs, setLogs] = useState(load)
  const [running, setRunning] = useState(null)
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [note, setNote] = useState('')
  const startTime = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(logs)) }, [logs])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setLogs(prev => prev.map(l => l.id === running.id ? { ...l, duration: Math.floor((Date.now() - startTime.current) / 1000) } : l))
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const startTimer = () => {
    const id = Date.now()
    const entry = { id, subject, note: note.trim(), duration: 0, startedAt: new Date().toISOString() }
    setLogs(prev => [entry, ...prev])
    setRunning(entry)
    startTime.current = Date.now()
    setNote('')
  }

  const stopTimer = () => {
    if (running) {
      setLogs(prev => prev.map(l => l.id === running.id ? { ...l, duration: Math.floor((Date.now() - startTime.current) / 1000), stoppedAt: new Date().toISOString() } : l))
      setRunning(null)
      startTime.current = null
    }
  }

  const deleteLog = (id) => setLogs(prev => prev.filter(l => l.id !== id))

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const today = new Date().toISOString().slice(0, 10)
  const todayLogs = logs.filter(l => l.startedAt?.slice(0, 10) === today)
  const totalToday = todayLogs.reduce((s, l) => s + l.duration, 0)
  const bySubject = {}
  todayLogs.forEach(l => { bySubject[l.subject] = (bySubject[l.subject] || 0) + l.duration })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Time Logger</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Track study time per subject</p>
      </div>

      {running ? (
        <div className="rounded-xl p-6 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#22c55e' }}>LOGGING: {running.subject}</p>
          <p className="text-3xl sm:text-4xl font-mono font-bold tracking-wider" style={{ color: 'var(--fg)' }}>{formatTime(running.duration)}</p>
          {running.note && <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>{running.note}</p>}
          <button onClick={stopTimer}
            className="mt-4 px-8 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: '#ef4444' }}>Stop Timer</button>
        </div>
      ) : (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex gap-2">
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={startTimer}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white transition hover:scale-105"
              style={{ background: '#22c55e' }}>Start</button>
          </div>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="What are you studying? (optional)"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{formatTime(totalToday)}</p>
          <p className="text-[10px]" style={{ color: 'var(--muted)' }}>Today Total</p>
        </div>
        {SUBJECTS.map(s => (
          <div key={s} className="rounded-xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-lg font-bold" style={{ color: bySubject[s] ? 'var(--accent)' : 'var(--muted)' }}>{formatTime(bySubject[s] || 0)}</p>
            <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{s}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {logs.length === 0 && <p className="text-xs text-center py-8" style={{ color: 'var(--muted)' }}>No logs yet</p>}
        {logs.map(l => (
          <div key={l.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 text-white" style={{ background: l.subject === 'Physics' ? '#6366f1' : l.subject === 'Chemistry' ? '#22c55e' : l.subject === 'Maths' ? '#f59e0b' : '#ec4899' }}>
              {l.subject.slice(0, 3)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>{formatTime(l.duration)}</span>
                <span className="text-[9px]" style={{ color: 'var(--muted)' }}>{l.subject}</span>
              </div>
              {l.note && <p className="text-[9px] truncate" style={{ color: 'var(--muted)' }}>{l.note}</p>}
              <p className="text-[8px]" style={{ color: 'var(--muted)' }}>{new Date(l.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            </div>
            {l.id !== running?.id && (
              <button onClick={() => deleteLog(l.id)} className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>✕</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
