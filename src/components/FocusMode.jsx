import { useState, useEffect, useRef } from 'react'

const SETTINGS_KEY = 'st_focus_settings'

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { focus: 25, break: 5 } } catch { return { focus: 25, break: 5 } }
}

export default function FocusMode() {
  const [settings, setSettings] = useState(loadSettings)
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState('focus')
  const [fullscreen, setFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [focusMins, setFocusMins] = useState(settings.focus)
  const [breakMins, setBreakMins] = useState(settings.break)
  const intervalRef = useRef(null)

  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) }, [settings])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (phase === 'focus') { setPhase('break'); setTimeLeft(settings.break * 60) }
            else { setPhase('focus'); setTimeLeft(settings.focus * 60) }
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {})
    }
  }

  useEffect(() => {
    const onFSChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFSChange)
    return () => document.removeEventListener('fullscreenchange', onFSChange)
  }, [])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const pct = phase === 'focus' ? (timeLeft / (settings.focus * 60)) * 100 : (timeLeft / (settings.break * 60)) * 100

  return (
    <div className={`flex flex-col items-center justify-center ${fullscreen ? 'fixed inset-0 z-[999]' : ''}`}
      style={{ background: fullscreen ? 'var(--bg)' : 'transparent' }}>
      <div className={`space-y-6 text-center ${fullscreen ? 'w-full h-full flex flex-col items-center justify-center p-8' : ''}`}>
        {!fullscreen && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Focus Mode</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Distraction-free studying</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowSettings(true); setFocusMins(settings.focus); setBreakMins(settings.break) }}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition hover:scale-105"
                style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>
                ⚙ Settings
              </button>
              <button onClick={toggleFullscreen}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition hover:scale-105"
                style={{ background: 'var(--input-bg)', color: 'var(--fg)' }}>
                ⛶ Full Screen
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 mb-2">
          <span className="text-[10px] px-2 py-1 rounded font-semibold" style={{ background: 'var(--input-bg)', color: phase === 'focus' ? '#22c55e' : 'var(--muted)' }}>Focus {settings.focus}m</span>
          <span className="text-[10px] px-2 py-1 rounded font-semibold" style={{ background: 'var(--input-bg)', color: phase === 'break' ? '#f59e0b' : 'var(--muted)' }}>Break {settings.break}m</span>
        </div>

        <div className="relative" style={{ width: fullscreen ? 300 : 260, height: fullscreen ? 300 : 260, margin: '0 auto' }}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={phase === 'focus' ? '#22c55e' : '#f59e0b'} strokeWidth="6" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`font-mono font-bold tracking-widest ${fullscreen ? 'text-6xl sm:text-7xl' : 'text-4xl sm:text-5xl'}`} style={{ color: 'var(--fg)' }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </p>
            <p className={`mt-2 font-semibold uppercase tracking-wider ${fullscreen ? 'text-sm' : 'text-[10px]'}`} style={{ color: phase === 'focus' ? '#22c55e' : '#f59e0b' }}>
              {phase === 'focus' ? 'Focus' : 'Break'}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={toggle}
            className={`${fullscreen ? 'px-10 py-3 text-sm' : 'px-8 py-2.5 text-xs'} rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95`}
            style={{ background: running ? '#ef4444' : '#22c55e' }}>
            {running ? 'Pause' : 'Start'}
          </button>
          <button onClick={reset}
            className={`${fullscreen ? 'px-6 py-3 text-sm' : 'px-5 py-2.5 text-xs'} rounded-xl font-semibold transition hover:scale-105`}
            style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>
            Reset
          </button>
          {fullscreen && (
            <button onClick={toggleFullscreen}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition hover:scale-105"
              style={{ background: 'var(--input-bg)', color: 'var(--fg)' }}>
              Exit Fullscreen
            </button>
          )}
        </div>

        {fullscreen && (
          <>
            {showSettings && (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowSettings(false)}>
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
                    <button onClick={() => setShowSettings(false)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
                    <button onClick={saveSettings} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Save</button>
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Press Esc or click Exit Fullscreen to leave focus mode</p>
          </>
        )}
      </div>

      {showSettings && !fullscreen && (
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
              <button onClick={() => setShowSettings(false)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
              <button onClick={saveSettings} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
