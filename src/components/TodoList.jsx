import { useState, useEffect } from 'react'

const STORAGE_KEY = 'st_todos'
const CATS_KEY = 'st_todo_cats'
const REV_KEY = 'st_revisions'
const DEFAULT_CATS = ['Study', 'Assignment', 'Exam Prep', 'Personal', 'Other']
const PRIORITIES = { low: '🟢 Low', medium: '🟡 Medium', high: '🔴 High', urgent: '⚡ Urgent' }

const QUOTES = [
  'Success is the sum of small efforts repeated day in and day out.',
  'Believe you can and you\'re halfway there.',
  'Your future is created by what you do today, not tomorrow.',
  'The secret of getting ahead is getting started.',
  'Don\'t watch the clock; do what it does. Keep going.',
  'Small steps lead to big achievements.',
  'Consistency is what transforms average into excellence.',
  'The best time to start was yesterday. The next best time is now.',
  'You don\'t have to be great to start, but you have to start to be great.',
  'Every expert was once a beginner.',
  'Discipline is choosing between what you want now and what you want most.',
  'Work hard in silence, let success make the noise.',
  'Progress, not perfection.',
  'It always seems impossible until it\'s done.',
  'Push yourself, because no one else is going to do it for you.',
  'The harder you work, the luckier you get.',
  'Dream big. Start small. Act now.',
  'Your only limit is your mind.',
  'Focus on being productive instead of busy.',
  'One day or day one. You decide.',
  'Great things never come from comfort zones.',
  'You are capable of more than you know.',
  'Strive for progress, not perfection.',
  'Begin anywhere — but begin.',
  'Making progress is the most powerful motivator.',
  'Champions keep playing until they get it right.',
  'Be stronger than your strongest excuse.',
  'Success doesn\'t come from what you do occasionally, but what you do consistently.',
  'The expert in anything was once a beginner.',
  'Wake up with determination. Go to bed with satisfaction.',
  'Do something today that your future self will thank you for.',
  'Little by little, day by day, what is meant for you will find its way.',
  'Action is the foundational key to all success.',
  'The way to get started is to quit talking and begin doing.',
  'It\'s not about having time. It\'s about making time.',
  'Your mindset determines your success.',
  'Focus on the step in front of you, not the whole staircase.',
  'Success begins with the decision to try.',
  'Make today so awesome that yesterday gets jealous.',
  'You don\'t have to see the whole staircase, just take the first step.',
]

function load(key, def) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : def } catch { return def }
}

export default function TodoList() {
  const [todos, setTodos] = useState(() => load(STORAGE_KEY, []))
  const [categories, setCategories] = useState(() => load(CATS_KEY, DEFAULT_CATS))
  const [revisions, setRevisions] = useState(() => load(REV_KEY, []))
  const [newTitle, setNewTitle] = useState('')
  const [newCat, setNewCat] = useState(categories[0])
  const [newPri, setNewPri] = useState('medium')
  const [filter, setFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [showCatInput, setShowCatInput] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [reviseModal, setReviseModal] = useState(null)
  const [reviseInstr, setReviseInstr] = useState('')
  const [reviseDate, setReviseDate] = useState('')
  const [backlogDate, setBacklogDate] = useState('')
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)) }, [todos])
  useEffect(() => { localStorage.setItem(CATS_KEY, JSON.stringify(categories)) }, [categories])
  useEffect(() => { localStorage.setItem(REV_KEY, JSON.stringify(revisions)) }, [revisions])

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(p => (p + 1) % QUOTES.length), 3600000)
    return () => clearInterval(t)
  }, [])

  const addTodo = () => {
    if (!newTitle.trim()) return
    setTodos(p => [...p, { id: Date.now(), title: newTitle.trim(), category: newCat, priority: newPri, done: false, backlog: null, createdAt: new Date().toISOString() }])
    setNewTitle(''); setShowAdd(false)
  }

  const toggleTodo = (id) => setTodos(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const deleteTodo = (id) => setTodos(p => p.filter(t => t.id !== id))

  const toggleBacklog = (id) => {
    setTodos(p => p.map(t => t.id === id ? { ...t, backlog: t.backlog ? null : new Date().toISOString() } : t))
  }

  const addCategory = () => {
    const name = newCatName.trim()
    if (!name || categories.includes(name)) return
    setCategories(p => [...p, name])
    setNewCatName(''); setShowCatInput(false)
  }

  const removeCategory = (name) => {
    if (name === 'All') return
    setCategories(p => p.filter(c => c !== name))
    if (filter === name) setFilter('All')
  }

  const openRevise = (todo) => {
    const now = new Date()
    const defDate = new Date(now.getTime() + 86400000)
    setReviseModal(todo)
    setReviseInstr('')
    setReviseDate(defDate.toISOString().slice(0, 16))
  }

  const saveRevision = () => {
    if (!reviseDate) return
    const rev = {
      id: Date.now(),
      todoId: reviseModal.id,
      todoTitle: reviseModal.title,
      category: reviseModal.category,
      instructions: reviseInstr.trim(),
      scheduledAt: reviseDate,
      done: false,
      rerevise: false,
      parentId: null
    }
    setRevisions(p => [...p, rev])
    setReviseModal(null)
  }

  const completeRevision = (revId) => {
    setRevisions(p => p.map(r => r.id === revId ? { ...r, done: true } : r))
  }

  const openRerevise = (rev) => {
    const now = new Date()
    const defDate = new Date(now.getTime() + 86400000)
    setReviseModal({ ...rev, isRerevise: true })
    setReviseInstr(rev.instructions)
    setReviseDate(defDate.toISOString().slice(0, 16))
  }

  const saveRerevision = () => {
    if (!reviseDate) return
    const rev = {
      id: Date.now(),
      todoId: reviseModal.todoId,
      todoTitle: reviseModal.todoTitle,
      category: reviseModal.category,
      instructions: reviseInstr.trim(),
      scheduledAt: reviseDate,
      done: false,
      rerevise: true,
      parentId: reviseModal.id
    }
    setRevisions(p => [...p, rev])
    setReviseModal(null)
  }

  const scheduleBacklog = () => {
    if (!backlogDate) return
    setTodos(p => p.map(t => t.id === reviseModal.id ? { ...t, backlog: backlogDate } : t))
    setReviseModal(null)
    setBacklogDate('')
  }

  const getTodoRevisions = (todoId) => revisions.filter(r => r.todoId === todoId)
  const hasDueRevision = (todoId) => revisions.some(r => r.todoId === todoId && !r.done && r.scheduledAt.slice(0, 10) <= new Date().toISOString().slice(0, 10))

  const filteredTodos = filter === 'All' ? todos : filter === 'Backlog' ? todos.filter(t => t.backlog) : todos.filter(t => t.category === filter)
  const stats = { total: todos.length, done: todos.filter(t => t.done).length, pending: todos.filter(t => !t.done && !t.backlog).length, backlog: todos.filter(t => t.backlog).length }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>To-Do List</h2>
        <button onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
          style={{ background: 'var(--accent)' }}>+ Add Task</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'Total', value: stats.total, c: 'var(--fg)' },
          { label: 'Done', value: stats.done, c: '#22c55e' },
          { label: 'Pending', value: stats.pending, c: '#f59e0b' },
          { label: 'Backlog', value: stats.backlog, c: '#a78bfa' },
          { label: 'Revisions', value: revisions.filter(r => !r.done).length, c: '#3b82f6' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-2 sm:px-4 py-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-base sm:text-lg font-bold" style={{ color: s.c }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap items-center">
        {['All', ...categories.filter(c => c !== 'All'), 'Backlog'].map(c => (
          <div key={c} className="relative group">
            <button onClick={() => setFilter(c)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                background: filter === c ? 'var(--accent)' : 'var(--input-bg)',
                color: filter === c ? '#fff' : 'var(--muted)',
              }}>{c}</button>
          </div>
        ))}
        <button onClick={() => setShowCatInput(true)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs transition hover:scale-110"
          style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>+</button>
      </div>

      {/* Add category input */}
      {showCatInput && (
        <div className="flex gap-2 animate-fade-up">
          <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name"
            className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} autoFocus
            onKeyDown={e => e.key === 'Enter' && addCategory()} />
          <button onClick={addCategory} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Add</button>
          <button onClick={() => { setShowCatInput(false); setNewCatName('') }} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="rounded-xl p-4 space-y-3 animate-fade-up" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What needs to be done?"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} autoFocus
            onKeyDown={e => e.key === 'Enter' && addTodo()} />
          <div className="flex gap-2">
            <select value={newCat} onChange={e => setNewCat(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
              {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={newPri} onChange={e => setNewPri(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
              {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addTodo} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Revise / Backlog Modal */}
      {reviseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setReviseModal(null)}>
          <div className="rounded-xl p-5 max-w-md w-full space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>
                {reviseModal.isRerevise ? 'Re-revise' : reviseModal._type === 'backlog' ? 'Move to Backlog' : 'Schedule Revision'}
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{reviseModal.todoTitle || reviseModal.title}</p>
            </div>
            {reviseModal._type === 'backlog' ? (
              <>
                <div className="text-xs space-y-1" style={{ color: 'var(--muted)' }}>
                  <p>Move this task to backlog. Set a target date to pick it back up.</p>
                </div>
                <input type="datetime-local" value={backlogDate} onChange={e => setBacklogDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
                <div className="flex gap-2">
                  <button onClick={() => setReviseModal(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
                  <button onClick={scheduleBacklog} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: backlogDate ? 'var(--accent)' : 'var(--input-bg)', color: backlogDate ? '#fff' : 'var(--muted)' }} disabled={!backlogDate}>
                    Move to Backlog
                  </button>
                </div>
              </>
            ) : (
              <>
                <textarea value={reviseInstr} onChange={e => setReviseInstr(e.target.value)} placeholder="Revision instructions / notes..."
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none h-20"
                  style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
                <input type="datetime-local" value={reviseDate} onChange={e => setReviseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
                <div className="flex gap-2">
                  <button onClick={() => setReviseModal(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
                  <button onClick={reviseModal.isRerevise ? saveRerevision : saveRevision} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: reviseDate ? 'var(--accent)' : 'var(--input-bg)', color: reviseDate ? '#fff' : 'var(--muted)' }} disabled={!reviseDate}>
                    {reviseModal.isRerevise ? 'Re-schedule' : 'Schedule'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {filteredTodos.length === 0 && (
          <div className="text-center py-10 text-xs" style={{ color: 'var(--muted)' }}>Nothing here yet</div>
        )}
        {filteredTodos.map(t => {
          const todoRevs = getTodoRevisions(t.id)
          const pendingRev = todoRevs.find(r => !r.done)
          return (
            <div key={t.id} className="flex items-start sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all hover:scale-[1.01] animate-fade-up"
              style={{ background: t.backlog ? 'var(--input-bg)' : 'var(--card)', border: '1px solid var(--border)', animationFillMode: 'both', opacity: t.backlog ? 0.7 : 1 }}>
              <button onClick={() => toggleTodo(t.id)}
                className="w-5 h-5 rounded-md flex items-center justify-center text-xs transition-all shrink-0 mt-0.5 sm:mt-0"
                style={{ background: t.done ? '#22c55e' : 'var(--input-bg)', border: t.done ? 'none' : '1px solid var(--border)', color: t.done ? '#fff' : 'transparent' }}>
                {t.done && '✓'}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-xs sm:text-sm ${t.done ? 'line-through' : ''}`} style={{ color: t.done ? 'var(--muted)' : t.backlog ? 'var(--muted)' : 'var(--fg)' }}>
                    {t.title}
                  </p>
                  {pendingRev && (
                    <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap" style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f650' }}>
                      Revise
                    </span>
                  )}
                  {t.backlog && (
                    <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap" style={{ background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa50' }}>
                      Backlog
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>{t.category}</span>
                  <span className="text-[9px] sm:text-[10px]" style={{ color: 'var(--muted)' }}>{PRIORITIES[t.priority]}</span>
                  {t.backlog && (
                    <span className="text-[9px] sm:text-[10px]" style={{ color: '#a78bfa' }}>📅 {new Date(t.backlog).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 mt-0.5 sm:mt-0">
                <button onClick={() => openRevise(t)}
                  className="px-1.5 sm:px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-medium transition hover:scale-105 whitespace-nowrap"
                  style={{ background: hasDueRevision(t.id) ? '#3b82f620' : 'var(--input-bg)', color: hasDueRevision(t.id) ? '#3b82f6' : 'var(--muted)', border: hasDueRevision(t.id) ? '1px solid #3b82f650' : 'none' }}>
                  Revise
                </button>
                <button onClick={() => { const m = { ...t, _type: 'backlog' }; setReviseModal(m); setBacklogDate('') }}
                  className="px-1.5 sm:px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-medium transition hover:scale-105 whitespace-nowrap"
                  style={{ background: t.backlog ? '#a78bfa20' : 'var(--input-bg)', color: t.backlog ? '#a78bfa' : 'var(--muted)', border: t.backlog ? '1px solid #a78bfa50' : 'none' }}>
                  {t.backlog ? 'Backlogged' : 'Backlog'}
                </button>
                <button onClick={() => deleteTodo(t.id)} className="text-xs hover:scale-110 transition shrink-0 px-1" style={{ color: 'var(--muted)' }}>✕</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dynamic Quote */}
      <div className="rounded-xl px-5 py-4 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-xs italic leading-relaxed" style={{ color: 'var(--muted)' }}>
          "{QUOTES[quoteIdx]}"
        </p>
        <p className="text-[9px] mt-2" style={{ color: 'var(--muted)', opacity: 0.5 }}>
          — stays for the hour —
        </p>
      </div>
    </div>
  )
}
