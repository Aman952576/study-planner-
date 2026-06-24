import { useState, useEffect } from 'react'
import { EXAM_DATA } from './ExamTracker'

const ROADMAP_KEY = 'st_roadmaps'

const DEFAULT_PHASES = (examKey) => {
  const exam = EXAM_DATA[examKey]
  if (!exam) return []
  const now = new Date()
  const ms = (days) => days * 86400000
  return [
    {
      id: 'phase-1',
      name: 'Basics & Foundation',
      desc: 'Build strong fundamentals with NCERT and standard textbooks',
      startDate: new Date(now.getTime() - ms(120)).toISOString().slice(0, 10),
      endDate: new Date(now.getTime() + ms(60)).toISOString().slice(0, 10),
    },
    {
      id: 'phase-2',
      name: 'Advanced Concepts',
      desc: 'Deep dive into advanced topics and problem-solving techniques',
      startDate: new Date(now.getTime() + ms(60)).toISOString().slice(0, 10),
      endDate: new Date(now.getTime() + ms(120)).toISOString().slice(0, 10),
    },
    {
      id: 'phase-3',
      name: 'Problem Solving & PYQs',
      desc: 'Solve previous year questions and practice problems extensively',
      startDate: new Date(now.getTime() + ms(120)).toISOString().slice(0, 10),
      endDate: new Date(now.getTime() + ms(165)).toISOString().slice(0, 10),
    },
    {
      id: 'phase-4',
      name: 'Mock Tests & Revision',
      desc: 'Full-length mock tests, revise weak areas, final preparation',
      startDate: new Date(now.getTime() + ms(165)).toISOString().slice(0, 10),
      endDate: new Date(now.getTime() + ms(210)).toISOString().slice(0, 10),
    },
  ]
}

function distributeTopics(examKey, phaseCount) {
  const exam = EXAM_DATA[examKey]
  if (!exam) return []
  const subjects = exam.subjects
  const allTopics = []
  Object.entries(subjects).forEach(([sk, sv]) => {
    sv.chapters.forEach(ch => {
      ch.topics.forEach(t => {
        allTopics.push({ subject: sv.name, subjectKey: sk, chapter: ch.name, topic: t, done: false })
      })
    })
  })
  const perPhase = Math.ceil(allTopics.length / phaseCount)
  const phases = []
  for (let i = 0; i < phaseCount; i++) {
    phases.push(allTopics.slice(i * perPhase, (i + 1) * perPhase))
  }
  return phases
}

export default function Roadmap() {
  const [selectedExam, setSelectedExam] = useState('jee-mains')
  const [roadmaps, setRoadmaps] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ROADMAP_KEY)) || {} } catch { return {} }
  })
  const [editingPhase, setEditingPhase] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', desc: '', startDate: '', endDate: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState(null)

  useEffect(() => { localStorage.setItem(ROADMAP_KEY, JSON.stringify(roadmaps)) }, [roadmaps])

  const current = roadmaps[selectedExam]
  const phases = current?.phases || DEFAULT_PHASES(selectedExam)

  const getPhaseTopics = (phaseIdx) => {
    const exam = EXAM_DATA[selectedExam]
    if (!exam) return {}
    if (current?.topicAssignments?.[phaseIdx]) return current.topicAssignments[phaseIdx]
    const all = distributeTopics(selectedExam, phases.length)
    return all[phaseIdx] || []
  }

  const saveRoadmap = (newPhases, newAssignments) => {
    setRoadmaps(prev => ({
      ...prev,
      [selectedExam]: {
        phases: newPhases || prev[selectedExam]?.phases || phases,
        topicAssignments: newAssignments || prev[selectedExam]?.topicAssignments || {},
      }
    }))
  }

  const initRoadmap = () => {
    const defPhases = DEFAULT_PHASES(selectedExam)
    const assignments = {}
    const all = distributeTopics(selectedExam, defPhases.length)
    defPhases.forEach((_, i) => { assignments[i] = all[i] || [] })
    setRoadmaps(prev => ({ ...prev, [selectedExam]: { phases: defPhases, topicAssignments: assignments } }))
  }

  const handleEdit = (idx) => {
    const p = phases[idx]
    setEditingPhase(idx)
    setEditForm({ name: p.name, desc: p.desc, startDate: p.startDate, endDate: p.endDate })
  }

  const saveEdit = () => {
    if (!editForm.name.trim() || !editForm.startDate || !editForm.endDate) return
    const updated = phases.map((p, i) => i === editingPhase ? { ...p, name: editForm.name.trim(), desc: editForm.desc.trim(), startDate: editForm.startDate, endDate: editForm.endDate } : p)
    saveRoadmap(updated)
    setEditingPhase(null)
  }

  const addPhase = () => {
    const now = new Date()
    const lastDate = phases.length > 0 ? new Date(phases[phases.length - 1].endDate) : now
    const newP = {
      id: `phase-${Date.now()}`,
      name: `Phase ${phases.length + 1}`,
      desc: 'Custom phase',
      startDate: new Date(lastDate.getTime() + 86400000).toISOString().slice(0, 10),
      endDate: new Date(lastDate.getTime() + 45 * 86400000).toISOString().slice(0, 10),
    }
    const updated = [...phases, newP]
    const assignments = { ...(current?.topicAssignments || {}) }
    assignments[updated.length - 1] = []
    saveRoadmap(updated, assignments)
    setShowAdd(false)
  }

  const deletePhase = (idx) => {
    const updated = phases.filter((_, i) => i !== idx)
    const assignments = { ...(current?.topicAssignments || {}) }
    delete assignments[idx]
    const reindexed = {}
    Object.entries(assignments).forEach(([k, v]) => {
      const ki = parseInt(k)
      reindexed[ki > idx ? ki - 1 : ki] = v
    })
    saveRoadmap(updated, reindexed)
  }

  const toggleTopic = (phaseIdx, topicIdx) => {
    const assignments = { ...(current?.topicAssignments || {}) }
    const list = [...(assignments[phaseIdx] || [])]
    if (list[topicIdx]) {
      list[topicIdx] = { ...list[topicIdx], done: !list[topicIdx].done }
    }
    assignments[phaseIdx] = list
    saveRoadmap(phases, assignments)
  }

  const [addTaskPhase, setAddTaskPhase] = useState(null)
  const [newTaskText, setNewTaskText] = useState('')

  const addTaskToPhase = (phaseIdx) => {
    if (!newTaskText.trim()) return
    const assignments = { ...(current?.topicAssignments || {}) }
    const list = [...(assignments[phaseIdx] || [])]
    list.push({ topic: newTaskText.trim(), done: false, custom: true })
    assignments[phaseIdx] = list
    saveRoadmap(phases, assignments)
    setNewTaskText('')
    setAddTaskPhase(null)
  }

  const deleteTask = (phaseIdx, taskIdx) => {
    const assignments = { ...(current?.topicAssignments || {}) }
    const list = [...(assignments[phaseIdx] || [])]
    list.splice(taskIdx, 1)
    assignments[phaseIdx] = list
    saveRoadmap(phases, assignments)
  }

  const movePhase = (from, to) => {
    if (to < 0 || to >= phases.length) return
    const updated = [...phases]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    const assignments = { ...(current?.topicAssignments || {}) }
    const newAssign = {}
    const allKeys = Object.keys(assignments)
    const movedItem = assignments[from]
    const remaining = allKeys.filter(k => parseInt(k) !== from).sort((a, b) => parseInt(a) - parseInt(b))
    remaining.splice(to, 0, from.toString())
    remaining.forEach((k, i) => { newAssign[i] = assignments[parseInt(k)] || [] })
    if (movedItem !== undefined) newAssign[to] = movedItem
    saveRoadmap(updated, newAssign)
    setDraggedIdx(null)
  }

  const overallDone = (() => {
    let total = 0, done = 0
    phases.forEach((_, i) => {
      const tops = getPhaseTopics(i)
      if (tops) { tops.forEach(t => { total++; if (t.done) done++ }) }
    })
    return total > 0 ? Math.round(done / total * 100) : 0
  })()

  const overallTotal = phases.reduce((s, _, i) => s + (getPhaseTopics(i)?.length || 0), 0)
  const overallCompleted = phases.reduce((s, _, i) => s + (getPhaseTopics(i)?.filter(t => t.done).length || 0), 0)

  const examNames = Object.entries(EXAM_DATA).map(([k, v]) => ({ key: k, name: v.name }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Exam Roadmap</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Phased study plan with tracking</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
            {examNames.map(e => <option key={e.key} value={e.key}>{e.name}</option>)}
          </select>
          {!current && (
            <button onClick={initRoadmap}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:scale-105"
              style={{ background: 'var(--accent)' }}>Create Roadmap</button>
          )}
          {current && (
            <button onClick={addPhase}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white transition hover:scale-105"
              style={{ background: 'var(--accent)' }}>+ Phase</button>
          )}
        </div>
      </div>

      {/* Overall progress */}
      {current && (
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>Overall Progress</span>
            <span className="text-xs font-bold" style={{ color: overallDone === 100 ? '#22c55e' : 'var(--accent)' }}>{overallDone}%</span>
          </div>
          <div className="h-2.5 rounded-full" style={{ background: 'var(--input-bg)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${overallDone}%`, background: overallDone === 100 ? '#22c55e' : 'var(--accent)' }} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{overallCompleted}/{overallTotal} topics completed</p>
        </div>
      )}

      {/* Phases */}
      {!current ? (
        <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No roadmap yet for {EXAM_DATA[selectedExam]?.name}</p>
          <p className="text-xs mt-1">Click "Create Roadmap" to generate a 4-phase plan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {phases.map((phase, idx) => {
            const topics = getPhaseTopics(idx)
            const done = topics?.filter(t => t.done).length || 0
            const total = topics?.length || 0
            const pct = total > 0 ? Math.round(done / total * 100) : 0
            const now = new Date()
            const start = new Date(phase.startDate)
            const end = new Date(phase.endDate)
            const isActive = now >= start && now <= end
            const isPast = now > end

            return (
              <div key={phase.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                draggable
                onDragStart={() => setDraggedIdx(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (draggedIdx !== null && draggedIdx !== idx) movePhase(draggedIdx, idx) }}>
                {/* Phase header */}
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: isActive ? 'var(--accent)10' : isPast ? 'var(--input-bg)' : 'transparent' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: isPast ? 'var(--muted)' : 'var(--fg)' }}>{phase.name}</span>
                      {isActive && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-white" style={{ background: '#22c55e' }}>Active</span>}
                      {isPast && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Done</span>}
                    </div>
                    <p className="text-[9px] mt-0.5" style={{ color: 'var(--muted)' }}>{phase.desc}</p>
                    <div className="flex gap-2 mt-1 text-[9px]" style={{ color: 'var(--muted)' }}>
                      <span>📅 {phase.startDate} → {phase.endDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-xs font-bold" style={{ color: pct === 100 ? '#22c55e' : 'var(--accent)' }}>{pct}%</span>
                    <button onClick={() => handleEdit(idx)} className="text-[9px] px-1.5 py-1 rounded" style={{ color: 'var(--muted)' }}>✎</button>
                    <button onClick={() => deletePhase(idx)} className="text-[9px] px-1.5 py-1 rounded" style={{ color: '#ef4444' }}>✕</button>
                  </div>
                </div>

                {/* Topics */}
                <div className="px-4 py-2 max-h-[200px] overflow-y-auto space-y-0.5">
                  {topics.map((t, ti) => (
                    <div key={ti} className="flex items-center gap-2 py-1 group">
                      <input type="checkbox" checked={t.done} onChange={() => toggleTopic(idx, ti)}
                        className="w-3.5 h-3.5 shrink-0" style={{ accentColor: 'var(--accent)' }} />
                      <span className={`text-[10px] flex-1 ${t.done ? 'line-through' : ''}`}
                        style={{ color: t.done ? 'var(--muted)' : 'var(--fg)' }}>
                        {t.subject && <span className="font-medium">{t.subject}: </span>}
                        {t.topic}
                      </span>
                      {t.custom && (
                        <button onClick={() => deleteTask(idx, ti)}
                          className="text-[9px] opacity-0 group-hover:opacity-100 transition shrink-0" style={{ color: '#ef4444' }}>✕</button>
                      )}
                    </div>
                  ))}
                  {/* Add task */}
                  <div className="pt-1">
                    {addTaskPhase === idx ? (
                      <div className="flex gap-1">
                        <input type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} autoFocus
                          placeholder="Task name..."
                          className="flex-1 px-2 py-1 rounded text-[10px] outline-none"
                          style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
                          onKeyDown={e => { if (e.key === 'Enter') addTaskToPhase(idx) }} />
                        <button onClick={() => addTaskToPhase(idx)}
                          className="px-2 py-1 rounded text-[10px] font-bold text-white"
                          style={{ background: 'var(--accent)' }}>Add</button>
                        <button onClick={() => { setAddTaskPhase(null); setNewTaskText('') }}
                          className="px-2 py-1 rounded text-[10px]" style={{ color: 'var(--muted)' }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setAddTaskPhase(idx); setNewTaskText('') }}
                        className="text-[10px] flex items-center gap-1 hover:opacity-70 transition"
                        style={{ color: 'var(--muted)' }}>
                        <span>+</span> Add Task
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit phase modal */}
      {editingPhase !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setEditingPhase(null)}>
          <div className="rounded-xl p-5 max-w-md w-full space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Edit Phase</h3>
              <button onClick={() => setEditingPhase(null)} className="text-xs" style={{ color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Phase Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Description</label>
                <input type="text" value={editForm.desc} onChange={e => setEditForm(p => ({ ...p, desc: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Start Date</label>
                  <input type="date" value={editForm.startDate} onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>End Date</label>
                  <input type="date" value={editForm.endDate} onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingPhase(null)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
              <button onClick={saveEdit} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
