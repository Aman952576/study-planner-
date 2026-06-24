import { useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { LevelProvider } from './context/LevelContext'
import VideoIntro from './components/VideoIntro'
import Dashboard from './components/Dashboard'
import Drawer from './components/Drawer'
import ThemeCustomizer from './components/ThemeCustomizer'

function AppContent() {
  const { showIntro, setShowIntro, skipIntro } = useTheme()
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [themeOpen, setThemeOpen] = useState(false)
  const [authed, setAuthed] = useState(null)
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState('')

  useEffect(() => {
    fetch('/api/auth/check').then(r => r.json()).then(d => setAuthed(d.authed)).catch(() => setAuthed(true))
  }, [])

  const handleLogin = async () => {
    setLoginErr('')
    const r = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: loginPass })
    })
    if (r.ok) {
      const d = await r.json()
      setAuthed(true)
      localStorage.setItem('st_user', d?.user || '')
      if (d?.user === 'admin') localStorage.setItem('st_adm', 'yes')
    } else {
      setLoginErr('Wrong password')
    }
  }

  if (authed === null) return null

  if (authed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm p-8 rounded-2xl text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--fg)' }}>Study Planner</h1>
          <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>Enter password to continue</p>
          <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: 'var(--accent)' }}>Continue</button>
          {loginErr && <p className="text-xs mt-3" style={{ color: '#ef4444' }}>{loginErr}</p>}
        </div>
      </div>
    )
  }

  if (showIntro) {
    return <VideoIntro onDone={skipIntro} />
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <div className={`fixed lg:relative z-50 h-screen transition-all duration-300 ${drawerOpen ? 'w-56' : 'w-0 lg:w-16'} overflow-hidden`}
        style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}>
        <div className={`${drawerOpen ? 'opacity-100' : 'lg:opacity-0'} transition-opacity min-w-56 h-full`}>
          <Drawer active={activeSection} onChange={setActiveSection} onThemeClick={() => setThemeOpen(true)} />
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 backdrop-blur-xl border-b" style={{ background: 'var(--header)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setDrawerOpen(p => !p)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'var(--input-bg)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--fg)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={drawerOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
              <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                {activeSection === 'dashboard' ? 'Overview' : activeSection === 'todo' ? 'To-Do List' : activeSection === 'exams' ? 'Exam Tracker' : activeSection === 'calendar' ? 'Calendar' : activeSection === 'tests' ? 'Tests' : activeSection === 'planner' ? 'Study Planner' : activeSection === 'roadmap' ? 'Roadmap' : activeSection === 'pomodoro' ? 'Pomodoro' : activeSection === 'focus' ? 'Focus Mode' : activeSection === 'goals' ? 'Daily Goals' : activeSection === 'notes' ? 'Quick Notes' : activeSection === 'time' ? 'Time Logger' : activeSection === 'flashcards' ? 'Flashcards' : activeSection === 'weekly' ? 'Weekly Report' : activeSection === 'achievements' ? 'Achievements' : activeSection === 'resources' ? 'Resources' : activeSection === 'aiagent' ? 'AI Agent' : 'Materials'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setThemeOpen(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'var(--input-bg)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--fg)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M17 7h.01" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-5xl mx-auto">
            <Dashboard activeSection={activeSection} onNavigate={setActiveSection} />
          </div>
        </main>
      </div>

      {themeOpen && <ThemeCustomizer onClose={() => setThemeOpen(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LevelProvider>
        <AppContent />
      </LevelProvider>
    </ThemeProvider>
  )
}
