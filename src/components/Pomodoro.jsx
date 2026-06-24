import { useState, useEffect, useRef } from 'react'

const SETTINGS_KEY = 'st_pomodoro_settings'

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { focus: 25, break: 5 } } catch { return { focus: 25, break: 5 } }
}

export default function Pomodoro() {
  const [settings, setSettings] = useState(loadSettings)
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState('focus')
  const [sessions, setSessions] = useState(() => { try { return JSON.parse(localStorage.getItem('st_pomodoro')) || [] } catch { return [] } })
  const [showSettings, setShowSettings] = useState(false)
  const [focusMins, setFocusMins] = useState(settings.focus)
  const [breakMins, setBreakMins] = useState(settings.break)
  const intervalRef = useRef(null)

  useEffect(() => { localStorage.setItem('st_pomodoro', JSON.stringify(sessions)) }, [sessions])
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) }, [settings])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (phase === 'focus') {
              setSessions(p => [...p, { id: Date.now(), doneAt: new Date().toISOString() }])
              setPhase('break')
              setTimeLeft(settings.break * 60)
            } else {
              setPhase('focus')
              setTimeLeft(settings.focus * 60)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, phase, settings])

  const saveSettings = () => {
    const f = Math.max(1, parseInt(focusMins) || 25)
    const b = Math.max(1, parseInt(breakMins) || 5)
    setSettings({ focus: f, break: b })
    setTimeLeft(f * 60)
    setPhase('focus')
    setRunning(false)
    setShowSettings(false)
  }

  const toggle = () => setRunning(p => !p)
  const reset = () => { setRunning(false); setTimeLeft(settings.focus * 60); setPhase('focus') }
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const todaySessions = sessions.filter(s => s.doneAt?.slice(0, 10) === new Date().toISOString().slice(0, 10))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Pomodoro Timer</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Focus · Break · Repeat</p>
        </div>
        <button onClick={() => { setShowSettings(true); setFocusMins(settings.focus); setBreakMins(settings.break) }}
          className="px-3 py-2 rounded-xl text-xs font-semibold transition hover:scale-105"
          style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>
          ⚙ Settings
        </button>
      </div>

      <div className="rounded-xl p-6 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex justify-center gap-4 mb-3">
          <span className="text-[10px] px-2 py-1 rounded font-semibold" style={{ background: 'var(--input-bg)', color: phase === 'focus' ? '#22c55e' : 'var(--muted)' }}>Focus {settings.focus}m</span>
          <span className="text-[10px] px-2 py-1 rounded font-semibold" style={{ background: 'var(--input-bg)', color: phase === 'break' ? '#f59e0b' : 'var(--muted)' }}>Break {settings.break}m</span>
        </div>
        <p className="text-[10px] font-semibold mb-3 uppercase tracking-wider" style={{ color: phase === 'focus' ? '#22c55e' : '#f59e0b' }}>{phase === 'focus' ? 'Focus Time' : 'Break Time'}</p>
        <p className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold tracking-widest" style={{ color: 'var(--fg)' }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
        <div className="flex justify-center gap-3 mt-5">
          <button onClick={toggle}
            className="px-8 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: running ? '#ef4444' : 'var(--accent)' }}>
            {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={reset}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold transition hover:scale-105"
            style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>
            Reset
          </button>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Today's Focus Sessions</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{todaySessions.length}</p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Total: {sessions.length} sessions</p>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowSettings(false)}>
          <div className="rounded-xl p-5 max-w-sm w-full space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Timer Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-xs" style={{ color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Focus (min)</label>
                <input type="number" min="1" max="120" value={focusMins} onChange={e => setFocusMins(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Break (min)</label>
                <input type="number" min="1" max="30" value={breakMins} onChange={e => setBreakMins(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowSettings(false)}
                className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
              <button onClick={saveSettings}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
