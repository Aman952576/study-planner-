import { useEffect, useState, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function VideoIntro({ onDone }) {
  const { mode } = useTheme()
  const [phase, setPhase] = useState('enter')
  const [progress, setProgress] = useState(0)
  const [greetingDone, setGreetingDone] = useState(false)

  const particles = useMemo(() =>
    [...Array(30)].map(() => ({
      size: Math.random() * 8 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      dur: 4 + Math.random() * 6,
      delay: Math.random() * 4,
      drift: Math.random() * 4 - 2,
      opacity: 0.1 + Math.random() * 0.3,
    })), []
  )

  useEffect(() => {
    const dur = 4500
    const interval = 30
    const steps = dur / interval
    let step = 0
    const t = setInterval(() => {
      step++
      setProgress(Math.min(step / steps, 1))
      if (step >= steps) {
        clearInterval(t)
        setPhase('exit')
        setTimeout(() => onDone(), 700)
      }
    }, interval)
    return () => clearInterval(t)
  }, [onDone])

  useEffect(() => {
    setTimeout(() => setPhase('greeting'), 300)
    setTimeout(() => setGreetingDone(true), 1800)
    setTimeout(() => setPhase('logo'), 2000)
  }, [])

  const isDark = mode === 'dark' || mode === 'dim' || mode === 'ocean'

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${phase === 'exit' ? 'opacity-0 scale-110 blur-sm' : 'opacity-100'}`}
      style={{ background: 'var(--bg)' }}>
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full" style={{
          background: 'var(--glow)', opacity: 0.12,
          left: '50%', top: '40%', transform: 'translate(-50%, -50%)',
          filter: 'blur(100px)',
          animation: 'pulseOrb 4s ease-in-out infinite',
        }} />
        <div className="absolute w-[300px] h-[300px] rounded-full" style={{
          background: 'var(--accent)', opacity: 0.06,
          left: '20%', top: '60%', filter: 'blur(80px)',
          animation: 'driftOrb 6s ease-in-out infinite',
        }} />
        <div className="absolute w-[250px] h-[250px] rounded-full" style={{
          background: 'var(--accent)', opacity: 0.05,
          right: '15%', top: '30%', filter: 'blur(70px)',
          animation: 'driftOrb2 5s ease-in-out infinite',
        }} />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: p.size, height: p.size,
              background: 'var(--accent)',
              opacity: phase === 'enter' ? 0 : p.opacity,
              left: `${p.x}%`,
              top: `${p.y}%`,
              animation: phase !== 'enter'
                ? `floatParticle ${p.dur}s ease-in-out ${p.delay}s infinite, driftX ${p.dur * 1.5}s ease-in-out ${p.delay}s infinite alternate`
                : 'none',
              transition: 'opacity 1s ease',
            }} />
        ))}
      </div>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div key={`star-${i}`} className="absolute w-0.5 h-0.5 rounded-full"
            style={{
              background: 'var(--accent)',
              opacity: phase === 'enter' ? 0 : 0.3 + Math.random() * 0.5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: phase !== 'enter' ? `twinkle ${1.5 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite alternate` : 'none',
              transition: 'opacity 1.5s ease',
            }} />
        ))}
      </div>

      {/* Greeting — Hello Aspirant */}
      <div className={`transition-all duration-1000 ${phase === 'greeting' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: phase === 'greeting' ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0.95)',
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
        <div className="text-center">
          <p className="text-sm font-medium tracking-[0.3em] uppercase" style={{ color: 'var(--accent)', opacity: greetingDone ? 0.5 : 0.7 }}>
            Welcome
          </p>
          <h2 className="text-3xl font-bold mt-3" style={{
            color: 'var(--fg)',
            opacity: greetingDone ? 0 : 1,
            transition: 'opacity 0.5s ease',
          }}>
            Hello, <span style={{ color: 'var(--accent)' }}>Aspirant</span>
          </h2>
        </div>
      </div>

      {/* Central logo */}
      <div className={`transition-all duration-1000 ${phase === 'logo' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          transitionDelay: '200ms',
        }}>
        {/* Outer ring glow */}
        <div className="relative flex items-center justify-center">
          {/* Rotating ring 1 */}
          <div className="absolute rounded-full border" style={{
            width: 170, height: 170,
            borderColor: 'var(--accent)',
            opacity: 0.2,
            animation: 'spin 8s linear infinite',
          }} />
          {/* Rotating ring 2 */}
          <div className="absolute rounded-full border-dashed border" style={{
            width: 140, height: 140,
            borderColor: 'var(--accent)',
            opacity: 0.15,
            animation: 'spinReverse 6s linear infinite',
          }} />
          {/* Glow behind logo */}
          <div className="absolute rounded-full" style={{
            width: 110, height: 110,
            background: 'var(--glow)',
            filter: 'blur(35px)',
            transform: 'scale(1.2)',
            animation: 'pulseGlow 3s ease-in-out infinite',
          }} />
          {/* Logo circle */}
          <div className="relative w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: 'var(--card)',
              border: '2px solid var(--border)',
              boxShadow: '0 0 60px var(--glow)',
              animation: 'float 4s ease-in-out infinite',
            }}>
            {/* P icon */}
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="var(--accent)" strokeWidth="1.5" opacity="0.25" />
              <path d="M16 14h8a6 6 0 0 1 0 12h-8V14z" fill="var(--accent)" opacity="0.7" />
              <path d="M16 26h6a6 6 0 0 1 0 12h-6V26z" fill="var(--accent)" opacity="0.35" />
              <circle cx="24" cy="24" r="3" fill="var(--accent)" opacity="0.15" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className={`mt-10 text-center transition-all duration-1000 ${phase === 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', transitionDelay: '400ms' }}>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--fg)', textShadow: '0 0 40px var(--glow)' }}>
          Planner
        </h1>
        <p className="mt-2 text-sm tracking-wide" style={{ color: 'var(--muted)' }}>
          Your Personal Planner
        </p>
      </div>

      {/* Progress bar */}
      <div className={`mt-10 w-56 h-[3px] rounded-full overflow-hidden transition-all duration-700 ${phase === 'logo' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'var(--border)', transitionDelay: '600ms' }}>
        <div className="h-full rounded-full transition-all duration-75 ease-linear"
          style={{ width: `${progress * 100}%`, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
      </div>

      {/* Loading dots */}
      <div className={`flex gap-2 mt-5 transition-all duration-500 ${phase === 'logo' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ transitionDelay: '700ms' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{
              background: 'var(--accent)',
              opacity: 0.3,
              animation: `loadingDot 1s ease-in-out ${i * 0.2}s infinite alternate`,
            }} />
        ))}
      </div>

      {/* Bottom skip button */}
      <button onClick={onDone}
        className="absolute bottom-10 px-6 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 hover:scale-105 hover:bg-white/5 active:scale-95"
        style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}>
        Skip Intro →
      </button>

      {/* Keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes spinReverse { to { transform: rotate(-360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.6; transform: scale(1.2); } 50% { opacity: 1; transform: scale(1.4); } }
        @keyframes pulseOrb { 0%, 100% { opacity: 0.08; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.15; transform: translate(-50%, -50%) scale(1.2); } }
        @keyframes driftOrb { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -20px); } }
        @keyframes driftOrb2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-20px, 30px); } }
        @keyframes floatParticle { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.2); } }
        @keyframes driftX { 0% { margin-left: 0; } 100% { margin-left: 40px; } }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.8; } }
        @keyframes loadingDot { 0% { opacity: 0.2; transform: scale(1); } 100% { opacity: 1; transform: scale(1.3); } }
      `}</style>
    </div>
  )
}
