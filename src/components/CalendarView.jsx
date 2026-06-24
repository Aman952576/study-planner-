import { useState, useEffect } from 'react'

const EV_KEY = 'st_calendar_events'
const TEST_KEY = 'st_calendar_tests'
const TODO_KEY = 'st_todos'
const REV_KEY = 'st_revisions'
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function load(key, def) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : def } catch { return def }
}

export default function CalendarView() {
  const [events, setEvents] = useState(() => load(EV_KEY, []))
  const [tests, setTests] = useState(() => load(TEST_KEY, []))
  const [todos, setTodos] = useState([])
  const [revisions, setRevisions] = useState([])
  const [date, setDate] = useState(new Date())
  const [showAddEv, setShowAddEv] = useState(false)
  const [showAddTest, setShowAddTest] = useState(false)
  const [newEv, setNewEv] = useState({ date: '', title: '', type: 'study' })
  const [newTest, setNewTest] = useState({ date: '', title: '', subject: 'Physics' })

  useEffect(() => { localStorage.setItem(EV_KEY, JSON.stringify(events)) }, [events])
  useEffect(() => { localStorage.setItem(TEST_KEY, JSON.stringify(tests)) }, [tests])
  useEffect(() => { setTodos(load(TODO_KEY, [])) }, [])
  useEffect(() => { setRevisions(load(REV_KEY, [])) }, [])

  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const prevMonth = () => setDate(new Date(year, month - 1))
  const nextMonth = () => setDate(new Date(year, month + 1))

  const addEvent = () => {
    if (!newEv.date || !newEv.title.trim()) return
    setEvents(p => [...p, { id: Date.now(), ...newEv }])
    setShowAddEv(false); setNewEv({ date: '', title: '', type: 'study' })
  }

  const addTestItem = () => {
    if (!newTest.date || !newTest.title.trim()) return
    setTests(p => [...p, { id: Date.now(), ...newTest }])
    setShowAddTest(false); setNewTest({ date: '', title: '', subject: 'Physics' })
  }

  const delEvent = (id) => setEvents(p => p.filter(e => e.id !== id))
  const delTest = (id) => setTests(p => p.filter(t => t.id !== id))

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  const dayStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const getEvents = (d) => events.filter(e => e.date === dayStr(d))
  const getTests = (d) => tests.filter(t => t.date.slice(0, 10) === dayStr(d))
  const getBacklogItems = (d) => todos.filter(t => t.backlog && t.backlog.slice(0, 10) === dayStr(d))
  const getRevisionItems = (d) => revisions.filter(r => !r.done && r.scheduledAt && r.scheduledAt.slice(0, 10) === dayStr(d))

  const allItems = [
    ...events.map(e => ({ ...e, _type: 'event', _color: 'var(--accent)' })),
    ...tests.map(t => ({ ...t, _type: 'test', dateLabel: t.date.slice(0, 10), _color: '#f59e0b' })),
    ...todos.filter(t => t.backlog).map(t => ({ ...t, _type: 'backlog', date: t.backlog, _color: '#a78bfa' })),
    ...revisions.filter(r => !r.done && r.scheduledAt).map(r => ({ ...r, _type: 'revision', title: r.todoTitle, date: r.scheduledAt, _color: '#3b82f6' })),
  ].sort((a, b) => (a.date || a.dateLabel || '').localeCompare(b.date || b.dateLabel || ''))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Calendar</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowAddTest(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: '#f59e0b', color: '#fff' }}>+ Add Test</button>
          <button onClick={() => setShowAddEv(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
            style={{ background: 'var(--accent)' }}>+ Add Event</button>
        </div>
      </div>

      {/* Add Event Form */}
      {showAddEv && (
        <div className="rounded-xl p-4 space-y-3 animate-fade-up" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <input type="date" value={newEv.date} onChange={e => setNewEv(p => ({ ...p, date: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
          <input type="text" value={newEv.title} onChange={e => setNewEv(p => ({ ...p, title: e.target.value }))} placeholder="Event title"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
          <select value={newEv.type} onChange={e => setNewEv(p => ({ ...p, type: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
            <option value="study">📚 Study</option>
            <option value="test">📝 Test</option>
            <option value="exam">🎯 Exam</option>
            <option value="personal">💫 Personal</option>
          </select>
          <div className="flex gap-2">
            <button onClick={addEvent} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Save</button>
            <button onClick={() => setShowAddEv(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Add Test Form */}
      {showAddTest && (
        <div className="rounded-xl p-4 space-y-3 animate-fade-up" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <input type="datetime-local" value={newTest.date} onChange={e => setNewTest(p => ({ ...p, date: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
          <input type="text" value={newTest.title} onChange={e => setNewTest(p => ({ ...p, title: e.target.value }))} placeholder="Test name"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
          <select value={newTest.subject} onChange={e => setNewTest(p => ({ ...p, subject: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
            <option>Physics</option><option>Chemistry</option><option>Maths</option><option>Biology</option>
          </select>
          <div className="flex gap-2">
            <button onClick={addTestItem} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: '#f59e0b' }}>Save Test</button>
            <button onClick={() => setShowAddTest(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Calendar header */}
      <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <button onClick={prevMonth} className="text-sm hover:scale-110 transition" style={{ color: 'var(--accent)' }}>←</button>
        <span className="text-sm font-bold" style={{ color: 'var(--fg)' }}>{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="text-sm hover:scale-110 transition" style={{ color: 'var(--accent)' }}>→</button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-7">
          {DAY_NAMES.map(d => (
            <div key={d} className="p-2 text-center text-[10px] font-semibold" style={{ color: 'var(--muted)', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const evs = d ? getEvents(d) : []
            const ts = d ? getTests(d) : []
            const bls = d ? getBacklogItems(d) : []
            const revs = d ? getRevisionItems(d) : []
            const totalExtra = evs.length + ts.length + bls.length + revs.length
            return (
              <div key={i} className="min-h-[70px] p-1.5 transition-all"
                style={{
                  background: d ? (isToday(d) ? 'var(--accent)' + '15' : 'transparent') : 'var(--input-bg)',
                  borderBottom: '1px solid var(--border)',
                  borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid var(--border)',
                }}>
                {d && (
                  <>
                    <span className={`text-xs font-semibold ${isToday(d) ? 'px-1.5 py-0.5 rounded-full text-white' : ''}`}
                      style={isToday(d) ? { background: 'var(--accent)' } : { color: 'var(--fg)' }}>
                      {d}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {evs.slice(0, 1).map(e => (
                        <div key={e.id} className="group relative">
                          <span className="block text-[8px] px-1 py-0.5 rounded truncate cursor-pointer"
                            style={{ background: 'var(--accent)', color: '#fff', opacity: 0.85 }}>
                            {e.title}
                          </span>
                          <button onClick={() => delEvent(e.id)}
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-white text-[6px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                        </div>
                      ))}
                      {ts.slice(0, 1).map(t => (
                        <div key={t.id} className="group relative">
                          <span className="block text-[8px] px-1 py-0.5 rounded truncate cursor-pointer"
                            style={{ background: '#f59e0b', color: '#fff', opacity: 0.9 }}>
                            📝 {t.title}
                          </span>
                          <button onClick={() => delTest(t.id)}
                            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-white text-[6px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                        </div>
                      ))}
                      {bls.slice(0, 1).map(t => (
                        <div key={t.id} className="group relative">
                          <span className="block text-[8px] px-1 py-0.5 rounded truncate cursor-pointer"
                            style={{ background: '#a78bfa', color: '#fff', opacity: 0.85 }}>
                            📦 {t.title}
                          </span>
                        </div>
                      ))}
                      {revs.slice(0, 1).map(r => (
                        <div key={r.id} className="group relative">
                          <span className="block text-[8px] px-1 py-0.5 rounded truncate cursor-pointer"
                            style={{ background: '#3b82f6', color: '#fff', opacity: 0.85 }}>
                            🔄 {r.todoTitle}
                          </span>
                        </div>
                      ))}
                      {totalExtra > 2 && (
                        <span className="text-[8px]" style={{ color: 'var(--muted)' }}>+{totalExtra - 2} more</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming */}
      <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>UPCOMING</h3>
        {allItems.length === 0 && <p className="text-xs" style={{ color: 'var(--muted)' }}>No items scheduled</p>}
        {allItems.slice(0, 8).map(item => (
          <div key={item.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--fg)' }}>{item.title}</p>
              <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{item._type === 'test' ? item.date.slice(11, 16) + ' · ' + item.date.slice(0, 10) : item.date?.slice(0, 10) || item.dateLabel}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>
              {item._type === 'test' ? '📝' : item._type === 'event' ? (item.type === 'study' ? '📚' : item.type === 'exam' ? '🎯' : '💫') : item._type === 'backlog' ? '📦' : '🔄'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
