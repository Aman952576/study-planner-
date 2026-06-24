import { useState, useEffect } from 'react'

const KEY = 'st_daily_goals'
const STREAK_KEY = 'st_streak'

function load(key, def) { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : def } catch { return def } }

export default function DailyGoals() {
  const today = new Date().toISOString().slice(0, 10)
  const [goals, setGoals] = useState(() => load(KEY, {}))
  const [input, setInput] = useState('')
  const [streak, setStreak] = useState(() => load(STREAK_KEY, { count: 0, lastDate: null, history: [] }))

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(goals)) }, [goals])
  useEffect(() => { localStorage.setItem(STREAK_KEY, JSON.stringify(streak)) }, [streak])

  const todayGoals = goals[today] || []

  const addGoal = () => {
    if (!input.trim()) return
    setGoals(p => ({ ...p, [today]: [...(p[today] || []), { id: Date.now(), text: input.trim(), done: false }] }))
    setInput('')
  }

  const toggleGoal = (id) => {
    const updated = todayGoals.map(g => g.id === id ? { ...g, done: !g.done } : g)
    setGoals(p => ({ ...p, [today]: updated }))
    const allDone = updated.every(g => g.done) && updated.length > 0
    if (allDone && streak.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1
      setStreak(p => ({ count: newCount, lastDate: today, history: [...(p.history || []), today] }))
    }
  }

  const deleteGoal = (id) => {
    setGoals(p => ({ ...p, [today]: todayGoals.filter(g => g.id !== id) }))
  }

  const doneCount = todayGoals.filter(g => g.done).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Daily Goals</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{today}</p>
        </div>
        <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Streak</p>
          <p className="text-xl font-bold" style={{ color: streak.count > 0 ? '#f59e0b' : 'var(--muted)' }}>🔥 {streak.count}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="What's your goal today?"
          className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          onKeyDown={e => e.key === 'Enter' && addGoal()} />
        <button onClick={addGoal}
          className="px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:scale-105"
          style={{ background: 'var(--accent)' }}>Add</button>
      </div>

      <div className="space-y-1.5">
        {todayGoals.length === 0 && (
          <div className="text-center py-10 text-xs" style={{ color: 'var(--muted)' }}>No goals set for today</div>
        )}
        {todayGoals.map(g => (
          <div key={g.id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', opacity: g.done ? 0.6 : 1 }}>
            <button onClick={() => toggleGoal(g.id)}
              className="w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0"
              style={{ background: g.done ? '#22c55e' : 'var(--input-bg)', border: g.done ? 'none' : '1px solid var(--border)', color: g.done ? '#fff' : 'transparent' }}>
              {g.done && '✓'}
            </button>
            <p className={`flex-1 text-xs sm:text-sm ${g.done ? 'line-through' : ''}`} style={{ color: g.done ? 'var(--muted)' : 'var(--fg)' }}>{g.text}</p>
            <button onClick={() => deleteGoal(g.id)} className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>✕</button>
          </div>
        ))}
      </div>

      {todayGoals.length > 0 && (
        <div className="rounded-xl p-4 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{doneCount}/{todayGoals.length} goals done</p>
          <div className="mt-2 h-2 rounded-full" style={{ background: 'var(--input-bg)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${todayGoals.length > 0 ? doneCount / todayGoals.length * 100 : 0}%`, background: doneCount === todayGoals.length ? '#22c55e' : 'var(--accent)' }} />
          </div>
        </div>
      )}
    </div>
  )
}
