import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const KEY = 'st_materials'
const BKEY = 'st_bookmarked_qs'

function load(key) { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } }
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)) }

const MATERIAL_TYPES = ['Textbook', 'PYQ', 'Module/Sheet', 'Reference Book', 'Practice Set', 'Notes']
const SUBJECTS = ['Physics', 'Chemistry', 'Maths', 'Biology']
const DEF_QTYPES = ['MCQ', 'Numerical', 'Assertion-Reason', 'Match-List']
const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ec4899', '#f59e0b', '#38bdf8']

export default function MaterialsAnalyzer() {
  const [items, setItems] = useState(() => load(KEY))
  const [bookmarks, setBookmarks] = useState(() => load(BKEY))
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [expSub, setExpSub] = useState(null)
  const [expEx, setExpEx] = useState(null)
  const [tab, setTab] = useState('list')

  const [newM, setNewM] = useState({ title: '', type: 'Textbook' })
  const [newSubjects, setNewSubjects] = useState([{ name: 'Physics', exercises: [{ name: '', questionTypes: [{ name: 'MCQ', count: 0 }] }] }])

  useEffect(() => { save(KEY, items) }, [items])
  useEffect(() => { save(BKEY, bookmarks) }, [bookmarks])

  const addSubject = () => setNewSubjects(p => [...p, { name: 'Physics', exercises: [{ name: '', questionTypes: [{ name: 'MCQ', count: 0 }] }] }])
  const updSubject = (si, field, val) => setNewSubjects(p => p.map((s, i) => i === si ? { ...s, [field]: val } : s))
  const remSubject = (si) => setNewSubjects(p => p.filter((_, i) => i !== si))

  const addExercise = (si) => setNewSubjects(p => p.map((s, i) => i === si ? { ...s, exercises: [...s.exercises, { name: '', questionTypes: [{ name: 'MCQ', count: 0 }] }] } : s))
  const updExercise = (si, ei, field, val) => setNewSubjects(p => p.map((s, i) => i === si ? { ...s, exercises: s.exercises.map((e, j) => j === ei ? { ...e, [field]: val } : e) } : s))
  const remExercise = (si, ei) => setNewSubjects(p => p.map((s, i) => i === si ? { ...s, exercises: s.exercises.filter((_, j) => j !== ei) } : s))

  const addQType = (si, ei) => setNewSubjects(p => p.map((s, i) => i === si ? { ...s, exercises: s.exercises.map((e, j) => j === ei ? { ...e, questionTypes: [...e.questionTypes, { name: 'MCQ', count: 0 }] } : e) } : s))
  const updQType = (si, ei, qi, field, val) => setNewSubjects(p => p.map((s, i) => i === si ? { ...s, exercises: s.exercises.map((e, j) => j === ei ? { ...e, questionTypes: e.questionTypes.map((q, k) => k === qi ? { ...q, [field]: field === 'count' ? Math.max(0, parseInt(val) || 0) : val } : q) } : e) } : s))
  const remQType = (si, ei, qi) => setNewSubjects(p => p.map((s, i) => i === si ? { ...s, exercises: s.exercises.map((e, j) => j === ei ? { ...e, questionTypes: e.questionTypes.filter((_, k) => k !== qi) } : e) } : s))

  const addItem = () => {
    if (!newM.title.trim()) return
    const subjects = newSubjects
      .filter(s => s.exercises.some(e => e.questionTypes.some(q => q.count > 0)))
      .map(s => ({
        ...s,
        exercises: s.exercises.filter(e => e.questionTypes.some(q => q.count > 0)).map(e => ({
          ...e,
          questionTypes: e.questionTypes.filter(q => q.count > 0).map(q => ({
            ...q,
            questions: Array.from({ length: q.count }, (_, idx) => ({ id: Date.now() + idx, num: idx + 1, done: false, bookmarked: false, note: '' }))
          }))
        }))
      }))
    if (subjects.length === 0) { alert('Add at least one question type with count > 0'); return }
    const total = subjects.reduce((s, sb) => s + sb.exercises.reduce((ss, e) => ss + e.questionTypes.reduce((sss, q) => sss + q.count, 0), 0), 0)
    setItems(p => [...p, { id: Date.now(), title: newM.title.trim(), type: newM.type, subjects, total, done: 0 }])
    setShowAdd(false)
    setNewM({ title: '', type: 'Textbook' })
    setNewSubjects([{ name: 'Physics', exercises: [{ name: '', questionTypes: [{ name: 'MCQ', count: 0 }] }] }])
  }

  const toggleDone = (itemId, si, ei, qi, qiIdx) => {
    setItems(p => p.map(it => {
      if (it.id !== itemId) return it
      const subjects = it.subjects.map((s, i) => i === si ? {
        ...s, exercises: s.exercises.map((e, j) => j === ei ? {
          ...e, questionTypes: e.questionTypes.map((q, k) => k === qi ? {
            ...q, questions: q.questions.map((qs, l) => l === qiIdx ? { ...qs, done: !qs.done } : qs)
          } : q)
        } : e)
      } : s)
      const done = subjects.reduce((s, sb) => s + sb.exercises.reduce((ss, e) => ss + e.questionTypes.reduce((sss, q) => sss + q.questions.filter(qs => qs.done).length, 0), 0), 0)
      return { ...it, subjects, done }
    }))
  }

  const toggleBookmark = (itemId, si, ei, qi, qiIdx) => {
    let qData = null
    setItems(p => p.map(it => {
      if (it.id !== itemId) return it
      const subjects = it.subjects.map((s, i) => i === si ? {
        ...s, exercises: s.exercises.map((e, j) => j === ei ? {
          ...e, questionTypes: e.questionTypes.map((q, k) => k === qi ? {
            ...q, questions: q.questions.map((qs, l) => {
              if (l !== qiIdx) return qs
              const updated = { ...qs, bookmarked: !qs.bookmarked }
              qData = updated
              return updated
            })
          } : q)
        } : e)
      } : s)
      return { ...it, subjects }
    }))
    if (qData) {
      const existing = bookmarks.filter(b => !(b.itemId === itemId && b.si === si && b.ei === ei && b.qi === qi && b.qiIdx === qiIdx))
      if (qData.bookmarked) {
        const item = items.find(i => i.id === itemId)
        existing.push({ ...qData, itemId, si, ei, qi, qiIdx, itemTitle: item?.title, subName: item?.subjects[si]?.name, exName: item?.subjects[si]?.exercises[ei]?.name, qTypeName: item?.subjects[si]?.exercises[ei]?.questionTypes[qi]?.name })
        setBookmarks(existing)
      } else {
        setBookmarks(existing)
      }
    }
  }

  const removeBookmark = (idx) => {
    const b = bookmarks[idx]
    setBookmarks(p => p.filter((_, i) => i !== idx))
    setItems(p => p.map(it => {
      if (it.id !== b.itemId) return it
      return {
        ...it, subjects: it.subjects.map((s, i) => i === b.si ? {
          ...s, exercises: s.exercises.map((e, j) => j === b.ei ? {
            ...e, questionTypes: e.questionTypes.map((q, k) => k === b.qi ? {
              ...q, questions: q.questions.map((qs, l) => l === b.qiIdx ? { ...qs, bookmarked: false } : qs)
            } : q)
          } : e)
        } : s)
      }
    }))
  }

  const delItem = (id) => {
    setItems(p => p.filter(i => i.id !== id))
    setBookmarks(p => p.filter(b => b.itemId !== id))
  }

  const overall = items.length ? Math.round(items.reduce((s, i) => s + (i.total > 0 ? i.done / i.total * 100 : 0), 0) / items.length) : 0
  const totalDone = items.reduce((s, i) => s + i.done, 0)
  const totalTotal = items.reduce((s, i) => s + i.total, 0)

  const bySubject = {}
  items.forEach(i => i.subjects?.forEach(s => {
    if (!bySubject[s.name]) bySubject[s.name] = { done: 0, total: 0 }
    const sd = s.exercises.reduce((ss, e) => ss + e.questionTypes.reduce((sss, q) => sss + q.questions.filter(qs => qs.done).length, 0), 0)
    const st = s.exercises.reduce((ss, e) => ss + e.questionTypes.reduce((sss, q) => sss + q.questions.length, 0), 0)
    bySubject[s.name].done += sd
    bySubject[s.name].total += st
  }))

  const chartData = Object.entries(bySubject).map(([k, v]) => ({ name: k, value: v.done, total: v.total, pct: v.total > 0 ? Math.round(v.done / v.total * 100) : 0 }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Materials Analyzer</h2>
        <div className="flex gap-2">
          <button onClick={() => setTab(tab === 'bookmarks' ? 'list' : 'bookmarks')}
            className="px-3 py-2 rounded-xl text-xs font-bold transition" style={{ background: tab === 'bookmarks' ? 'var(--accent)' : 'var(--input-bg)', color: tab === 'bookmarks' ? '#fff' : 'var(--fg)' }}>
            🔖 Bookmarks ({bookmarks.length})
          </button>
          {tab === 'list' && <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105" style={{ background: 'var(--accent)' }}>+ Add Material</button>}
        </div>
      </div>

      {tab === 'bookmarks' ? (
        <div className="space-y-1.5">
          {bookmarks.length === 0 && <p className="text-xs text-center py-8" style={{ color: 'var(--muted)' }}>No bookmarked questions yet</p>}
          {bookmarks.map((b, idx) => (
            <div key={idx} className="px-4 py-3 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>Q{b.num}. {b.note || `Question ${b.num}`}</p>
                  <div className="flex gap-1.5 mt-1 text-[9px]" style={{ color: 'var(--muted)' }}>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)' }}>{b.itemTitle}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)' }}>{b.subName}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)' }}>{b.exName}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)' }}>{b.qTypeName}</span>
                  </div>
                </div>
                <button onClick={() => removeBookmark(idx)} className="text-[9px] px-2 py-1 rounded-lg shrink-0" style={{ background: '#fee2e2', color: '#ef4444' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Materials', value: items.length },
              { label: 'Overall', value: overall + '%' },
              { label: 'Completed', value: totalDone },
              { label: 'Total Qs', value: totalTotal },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-3 py-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p className="text-base sm:text-lg font-bold" style={{ color: 'var(--accent)' }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>COMPLETION BY SUBJECT</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="done" stroke="none">
                    {chartData.map((e, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 mt-1">
                {chartData.map((d, i) => (
                  <span key={d.name} className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: COLORS[i] }} />
                    {d.name} {d.pct}%
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>SUBJECT PROGRESS</p>
              <div className="space-y-2">
                {chartData.map(d => (
                  <div key={d.name}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span style={{ color: 'var(--fg)' }}>{d.name}</span>
                      <span style={{ color: 'var(--muted)' }}>{d.done}/{d.total}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--input-bg)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${d.pct}%`, background: 'var(--accent)', opacity: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search materials by name..."
              className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={{ background: 'var(--card)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="rounded-xl p-4 space-y-3 animate-fade-up" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <input type="text" value={newM.title} onChange={e => setNewM(p => ({ ...p, title: e.target.value }))} placeholder="Material name"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              <select value={newM.type} onChange={e => setNewM(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
                {MATERIAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>

              {/* Subjects */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>SUBJECTS</p>
                  <button onClick={addSubject} className="text-[9px] px-2 py-1 rounded-lg text-white font-semibold" style={{ background: 'var(--accent)' }}>+ Subject</button>
                </div>
                <div className="space-y-3">
                  {newSubjects.map((sb, si) => (
                    <div key={si} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <select value={sb.name} onChange={e => updSubject(si, 'name', e.target.value)}
                          className="px-2 py-1 rounded text-[10px] font-semibold outline-none" style={{ background: 'var(--card)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
                          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                        {newSubjects.length > 1 && <button onClick={() => remSubject(si)} className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: '#ef4444' }}>✕</button>}
                      </div>
                      {/* Exercises */}
                      {sb.exercises.map((ex, ei) => (
                        <div key={ei} className="ml-2 mb-2 p-2 rounded" style={{ background: 'var(--card)' }}>
                          <div className="flex items-center gap-2 mb-1">
                            <input type="text" value={ex.name} onChange={e => updExercise(si, ei, 'name', e.target.value)} placeholder="Exercise name"
                              className="flex-1 px-2 py-1 rounded text-[10px] outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
                            <button onClick={() => addQType(si, ei)} className="text-[8px] px-1.5 py-0.5 rounded text-white" style={{ background: 'var(--accent)' }}>+ QType</button>
                            {sb.exercises.length > 1 && <button onClick={() => remExercise(si, ei)} className="text-[8px] px-1.5 py-0.5 rounded" style={{ color: '#ef4444' }}>✕</button>}
                          </div>
                          {/* Question types */}
                          <div className="flex flex-wrap gap-1.5">
                            {ex.questionTypes.map((qt, qi) => (
                              <div key={qi} className="flex items-center gap-1 text-[9px] p-1 rounded" style={{ background: 'var(--input-bg)' }}>
                                <select value={qt.name} onChange={e => updQType(si, ei, qi, 'name', e.target.value)}
                                  className="px-1 py-0.5 rounded text-[9px] outline-none" style={{ background: 'var(--card)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
                                  {DEF_QTYPES.map(q => <option key={q}>{q}</option>)}
                                </select>
                                <input type="number" min="0" value={qt.count || ''} onChange={e => updQType(si, ei, qi, 'count', e.target.value)} placeholder="#"
                                  className="w-10 px-1 py-0.5 rounded text-[9px] outline-none" style={{ background: 'var(--card)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
                                {ex.questionTypes.length > 1 && <button onClick={() => remQType(si, ei, qi)} className="px-1" style={{ color: '#ef4444' }}>✕</button>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button onClick={() => addExercise(si)} className="text-[8px] px-2 py-0.5 rounded font-semibold mt-1" style={{ background: 'var(--card)', color: 'var(--accent)' }}>+ Exercise</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={addItem} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Save</button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Material list */}
          {(() => {
            const filtered = items.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
            if (filtered.length === 0) return <p className="text-xs text-center py-8" style={{ color: 'var(--muted)' }}>{search ? 'No materials match your search' : 'No materials tracked yet'}</p>
            return <div className="space-y-1.5">{filtered.map(m => (
              <div key={m.id} className="rounded-xl transition-all" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="px-4 py-3 cursor-pointer" onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{m.title}</p>
                      <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{m.type} · {m.subjects?.length || 0} subjects · {m.done}/{m.total}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs font-bold" style={{ color: m.total > 0 ? (m.done === m.total ? '#22c55e' : 'var(--accent)') : 'var(--muted)' }}>
                        {m.total > 0 ? Math.round(m.done / m.total * 100) : 0}%
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); delItem(m.id) }} className="text-xs hover:scale-110 transition" style={{ color: 'var(--muted)' }}>✕</button>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full" style={{ background: 'var(--input-bg)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${m.total > 0 ? m.done / m.total * 100 : 0}%`, background: m.done === m.total ? '#22c55e' : 'var(--accent)' }} />
                  </div>
                </div>

                {/* Expanded: subjects → exercises → question types → questions */}
                {expandedId === m.id && m.subjects?.map((sb, si) => (
                  <div key={si} className="border-t px-4 py-2" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => setExpSub(expSub === `${m.id}-${si}` ? null : `${m.id}-${si}`)}>
                      <span className="text-[10px] font-semibold" style={{ color: 'var(--fg)' }}>{sb.name}</span>
                      <span className="text-[9px]" style={{ color: 'var(--muted)' }}>({sb.exercises?.reduce((s, e) => s + e.questionTypes?.reduce((ss, q) => ss + q.questions?.filter(qs => qs.done).length, 0), 0) || 0}/{sb.exercises?.reduce((s, e) => s + e.questionTypes?.reduce((ss, q) => ss + q.questions?.length, 0), 0) || 0})</span>
                    </div>
                    {expSub === `${m.id}-${si}` && sb.exercises?.map((ex, ei) => (
                      <div key={ei} className="ml-3 mb-1">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setExpEx(expEx === `${m.id}-${si}-${ei}` ? null : `${m.id}-${si}-${ei}`)}>
                          <span className="text-[9px] font-medium" style={{ color: 'var(--muted)' }}>{ex.name || `Exercise ${ei + 1}`}</span>
                          <span className="text-[8px]" style={{ color: 'var(--muted)' }}>({ex.questionTypes?.reduce((s, q) => s + q.questions?.filter(qs => qs.done).length, 0)}/{ex.questionTypes?.reduce((s, q) => s + q.questions?.length, 0)})</span>
                        </div>
                        {expEx === `${m.id}-${si}-${ei}` && ex.questionTypes?.map((qt, qi) => (
                          <div key={qi} className="ml-4 mt-1">
                            <p className="text-[9px] font-semibold mb-1" style={{ color: 'var(--accent)' }}>{qt.name} ({qt.questions?.filter(q => q.done).length}/{qt.questions?.length})</p>
                            <div className="grid grid-cols-4 gap-1">
                              {qt.questions?.map((qs, qiIdx) => (
                                <div key={qs.id} className="flex items-center gap-1 px-1.5 py-1 rounded text-[9px]" style={{ background: 'var(--input-bg)' }}>
                                  <span style={{ color: qs.done ? '#22c55e' : 'var(--muted)' }}>Q{qs.num}</span>
                                  <input type="checkbox" checked={qs.done} onChange={() => toggleDone(m.id, si, ei, qi, qiIdx)} className="w-2.5 h-2.5" style={{ accentColor: 'var(--accent)' }} />
                                  <button onClick={() => toggleBookmark(m.id, si, ei, qi, qiIdx)}
                                    className={`ml-auto text-[8px] ${qs.bookmarked ? 'text-[#f59e0b]' : ''}`} style={{ color: qs.bookmarked ? '#f59e0b' : 'var(--muted)' }}>
                                    {qs.bookmarked ? '★' : '☆'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}</div>
          })()}
        </>
      )}
    </div>
  )
}
