import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const SUBJECTS = ['Physics', 'Chemistry', 'Maths', 'Biology']

const EMPTY_SUBJECT = { name: 'Physics', questions: 0, correct: 0, incorrect: 0, unattempted: 0, sillyMistakes: 0, formulaMistakes: 0, conceptMistakes: 0, timeSpent: 0 }

function load(key) { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } }
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)) }

function calcOverall(subjects) {
  const totalScore = subjects.reduce((s, sb) => s + sb.correct, 0) * 4 - subjects.reduce((s, sb) => s + sb.incorrect, 0)
  const totalMarks = subjects.reduce((s, sb) => s + sb.questions * 4, 0)
  const totalTime = subjects.reduce((s, sb) => s + (sb.timeSpent || 0), 0)
  const totalQ = subjects.reduce((s, sb) => s + sb.questions, 0)
  const correct = subjects.reduce((s, sb) => s + sb.correct, 0)
  const incorrect = subjects.reduce((s, sb) => s + sb.incorrect, 0)
  const unattempted = subjects.reduce((s, sb) => s + sb.unattempted, 0)
  const attempted = correct + incorrect
  const accuracy = attempted > 0 ? Math.round(correct / attempted * 100) : 0
  const negativeMarks = subjects.reduce((s, sb) => s + sb.incorrect, 0)
  return { totalScore: Math.max(totalScore, 0), totalMarks, totalTime, accuracy, negativeMarks, totalQ, correct, incorrect, unattempted }
}

export default function Tests() {
  const [calTests, setCalTests] = useState(() => load('st_calendar_tests'))
  const [analysis, setAnalysis] = useState(() => load('st_tests'))
  const [selectedTest, setSelectedTest] = useState(null)
  const [formSubjects, setFormSubjects] = useState([{ ...EMPTY_SUBJECT }])
  const [formNotes, setFormNotes] = useState('')
  const [reattemptDate, setReattemptDate] = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => { setCalTests(load('st_calendar_tests')) }, [])
  useEffect(() => { setAnalysis(load('st_tests')) }, [])

  const allTests = [...calTests].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  const getAnalysis = (testId) => {
    const origId = calTests.find(t => t.id === testId)?.originalId
    return analysis.find(a => a.id === (origId || testId))
  }

  const openAnalysis = (test) => {
    const origId = test.originalId || test.id
    const existing = getAnalysis(test.id)
    setSelectedTest(test)
    if (existing) {
      setFormSubjects(existing.subjects.length > 0 ? existing.subjects.map(s => ({ ...s })) : [{ ...EMPTY_SUBJECT }])
      setFormNotes(existing.notes || '')
      setReattemptDate(existing.reattempt ? existing.reattempt.date : '')
    } else {
      setFormSubjects([{ ...EMPTY_SUBJECT }])
      setFormNotes('')
      setReattemptDate('')
    }
  }

  const addSubject = () => setFormSubjects(p => [...p, { ...EMPTY_SUBJECT }])
  const removeSubject = (idx) => setFormSubjects(p => p.filter((_, i) => i !== idx))
  const updateSubject = (idx, field, value) => {
    setFormSubjects(p => p.map((s, i) => i === idx ? { ...s, [field]: field === 'name' ? value : Math.max(0, parseInt(value) || 0) } : s))
  }

  const saveAnalysis = () => {
    if (!selectedTest) return
    const origId = selectedTest.originalId || selectedTest.id
    const subjects = formSubjects.filter(s => s.questions > 0)
    if (subjects.length === 0) { alert('Add at least one subject with questions'); return }
    const overall = calcOverall(subjects)
    const existing = analysis.find(a => a.id === origId)
    const reattempt = reattemptDate ? { date: reattemptDate, id: Date.now() + 1, completed: false } : null

    const cleanTitle = selectedTest.title.replace(/\s*\(Reattempt\)/g, '').trim()
    const entry = {
      id: origId,
      title: cleanTitle,
      date: selectedTest.date ? selectedTest.date.slice(0, 10) : '',
      subjects,
      ...overall,
      notes: formNotes.trim(),
      reattempt
    }

    const updated = existing ? analysis.map(a => a.id === origId ? entry : a) : [...analysis, entry]
    setAnalysis(updated)
    save('st_tests', updated)

    // Schedule reattempt in calendar
    const cal = load('st_calendar_tests')
    if (reattempt) {
      const withoutOld = cal.filter(t => !(t.title?.includes('(Reattempt)') && t.title?.includes(cleanTitle)))
      withoutOld.push({ id: reattempt.id, date: reattempt.date, title: cleanTitle + ' (Reattempt)', subject: 'General', originalId: origId })
      save('st_calendar_tests', withoutOld)
    } else {
      const baseTitle = selectedTest.title.replace(/\s*\(Reattempt\)/g, '').trim()
      const filtered = cal.filter(t => !(t.title?.includes('(Reattempt)') && t.title?.includes(baseTitle)))
      save('st_calendar_tests', filtered)
    }

    setSelectedTest(null)
  }

  const deleteAnalysis = () => {
    if (!selectedTest) return
    const origId = selectedTest.originalId || selectedTest.id
    const updated = analysis.filter(a => a.id !== origId)
    setAnalysis(updated)
    save('st_tests', updated)
    // Remove reattempt from calendar
    const cal = load('st_calendar_tests')
    const baseTitle = selectedTest.title.replace(/\s*\(Reattempt\)/g, '').trim()
    const filteredCal = cal.filter(t => !(t.title?.includes('(Reattempt)') && t.title?.includes(baseTitle)))
    save('st_calendar_tests', filteredCal)
    setSelectedTest(null)
  }

  // Overall stats
  const stats = analysis.length > 0 ? {
    totalTests: analysis.length,
    avgScore: Math.round(analysis.reduce((s, a) => s + a.totalScore, 0) / analysis.length),
    avgAccuracy: Math.round(analysis.reduce((s, a) => s + a.accuracy, 0) / analysis.length),
    totalTime: analysis.reduce((s, a) => s + a.totalTime, 0),
    totalSilly: analysis.reduce((s, a) => s + a.subjects.reduce((ss, sb) => ss + (sb.sillyMistakes || 0), 0), 0),
    totalFormula: analysis.reduce((s, a) => s + a.subjects.reduce((ss, sb) => ss + (sb.formulaMistakes || 0), 0), 0),
    totalConcept: analysis.reduce((s, a) => s + a.subjects.reduce((ss, sb) => ss + (sb.conceptMistakes || 0), 0), 0),
    totalCorrect: analysis.reduce((s, a) => s + a.correct, 0),
    totalIncorrect: analysis.reduce((s, a) => s + a.incorrect, 0),
    totalUnattempted: analysis.reduce((s, a) => s + a.unattempted, 0),
  } : null

  const mistakeColors = { silly: '#f59e0b', formula: '#3b82f6', concept: '#ef4444' }
  const statusColors = { correct: '#22c55e', incorrect: '#ef4444', unattempted: '#94a3b8' }

  return (
    <div className="h-full flex flex-col" style={{ height: 'calc(100vh - 60px)' }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Overall Stats */}
        {stats && (
          <div className="rounded-xl p-4 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>📊 Overall Test Analysis</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Tests', value: stats.totalTests, color: 'var(--accent)' },
                { label: 'Avg Score', value: stats.avgScore, color: '#22c55e', sub: `/ ${Math.round(analysis.reduce((s, a) => s + a.totalMarks, 0) / analysis.length)}` },
                { label: 'Avg Accuracy', value: stats.avgAccuracy + '%', color: '#3b82f6' },
                { label: 'Total Time', value: `${Math.floor(stats.totalTime / 60)}h ${stats.totalTime % 60}m`, color: '#f59e0b' },
              ].map(c => (
                <div key={c.label} className="rounded-lg px-3 py-2 text-center" style={{ background: 'var(--input-bg)' }}>
                  <p className="text-[9px]" style={{ color: 'var(--muted)' }}>{c.label}</p>
                  <p className="text-base sm:text-lg font-bold" style={{ color: c.color }}>{c.value}</p>
                  {c.sub && <p className="text-[9px]" style={{ color: 'var(--muted)' }}>{c.sub}</p>}
                </div>
              ))}
            </div>
            {/* Mistake distribution */}
            {stats.totalSilly + stats.totalFormula + stats.totalConcept > 0 && (
              <div>
                <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--muted)' }}>MISTAKES BREAKDOWN</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[
                    { label: 'Silly', value: stats.totalSilly, color: mistakeColors.silly },
                    { label: 'Formula', value: stats.totalFormula, color: mistakeColors.formula },
                    { label: 'Concept', value: stats.totalConcept, color: mistakeColors.concept },
                  ].map(m => (
                    <div key={m.label} className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full" style={{ background: m.color }} />
                      <span style={{ color: 'var(--muted)' }}>{m.label}:</span>
                      <span className="font-bold" style={{ color: 'var(--fg)' }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Question status pie */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20">
                <ResponsiveContainer width="100%" height={80}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Correct', value: stats.totalCorrect, color: statusColors.correct },
                      { name: 'Incorrect', value: stats.totalIncorrect, color: statusColors.incorrect },
                      { name: 'Unattempted', value: stats.totalUnattempted, color: statusColors.unattempted },
                    ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={20} outerRadius={36} dataKey="value" stroke="none">
                      {['correct', 'incorrect', 'unattempted'].map((k, i) => <Cell key={k} fill={statusColors[k]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1">
                {Object.entries(statusColors).map(([k, c]) => (
                  <div key={k} className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                    <span style={{ color: 'var(--muted)' }}>{k}:</span>
                    <span className="font-semibold" style={{ color: 'var(--fg)' }}>{stats[`total${k.charAt(0).toUpperCase() + k.slice(1)}`]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Tests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>📋 All Tests</h2>
          </div>
          {allTests.length === 0 ? (
            <div className="text-center py-8 text-xs" style={{ color: 'var(--muted)' }}>
              No tests yet. Go to Calendar → Add Test to schedule one.
            </div>
          ) : (
            <div className="space-y-1.5">
              {(showAll ? allTests : allTests.slice(0, 10)).map(t => {
                const a = getAnalysis(t.id)
                const isReattempt = t.title?.includes('(Reattempt)')
                return (
                  <div key={t.id} onClick={() => openAnalysis(t)}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 text-white ${a ? (a.accuracy >= 70 ? 'bg-[#22c55e]' : a.accuracy >= 40 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]') : 'bg-[#94a3b8]'}`}>
                      {a ? `${a.accuracy}%` : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <p className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: 'var(--fg)' }}>{t.title}</p>
                        {isReattempt && <span className="text-[7px] sm:text-[8px] px-1 py-0.5 rounded bg-[#f59e0b20] text-[#f59e0b] whitespace-nowrap">Reattempt</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-0.5 text-[8px] sm:text-[9px]" style={{ color: 'var(--muted)' }}>
                        <span>{t.subject || 'General'}</span>
                        <span>📅 {t.date ? t.date.slice(0, 10) : '-'}</span>
                        {a && <span>🎯 {a.totalScore}/{a.totalMarks}</span>}
                        {!a && <span className="text-[#f59e0b]">⚠️ Pending analysis</span>}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); openAnalysis(t) }} className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-1 rounded-lg transition whitespace-nowrap" style={{ background: 'var(--input-bg)', color: 'var(--accent)' }}>
                      {a ? 'Edit' : 'Analyze'}
                    </button>
                  </div>
                )
              })}
              {allTests.length > 10 && !showAll && (
                <button onClick={() => setShowAll(true)} className="w-full py-2 text-[10px] font-semibold rounded-xl transition" style={{ background: 'var(--input-bg)', color: 'var(--accent)' }}>
                  Show all {allTests.length} tests
                </button>
              )}
            </div>
          )}
        </div>

        {/* Score Trend */}
        {analysis.length >= 2 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted)' }}>📈 SCORE TREND</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={analysis.slice().reverse().map((a, i) => ({ name: `#${i + 1}`, score: a.totalScore, acc: a.accuracy }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                <YAxis yAxisId="l" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                <YAxis yAxisId="r" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                <Tooltip />
                <Line yAxisId="l" type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} name="Score" />
                <Line yAxisId="r" type="monotone" dataKey="acc" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Subject-wise cumulative */}
        {analysis.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted)' }}>📚 SUBJECT-WISE CUMULATIVE</p>
            <div className="space-y-2">
              {['Physics', 'Chemistry', 'Maths', 'Biology'].map(sub => {
                const subData = analysis.flatMap(a => a.subjects.filter(s => s.name === sub))
                if (subData.length === 0) return null
                const corr = subData.reduce((s, d) => s + d.correct, 0)
                const qs = subData.reduce((s, d) => s + d.questions, 0)
                const acc = qs > 0 ? Math.round(corr / qs * 100) : 0
                return (
                  <div key={sub}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span style={{ color: 'var(--fg)' }}>{sub}</span>
                      <span style={{ color: 'var(--muted)' }}>{acc}% · {corr}/{qs} correct</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--input-bg)' }}>
                      <div className="h-full rounded-full" style={{ width: `${acc}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedTest(null)}>
          <div className="rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>{selectedTest.title}</h3>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{selectedTest.subject || 'General'} · 📅 {selectedTest.date ? selectedTest.date.slice(0, 10) : '-'}</p>
              </div>
              <button onClick={() => setSelectedTest(null)} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>✕</button>
            </div>

            {/* Subjects */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>SUBJECTS</p>
                <button onClick={addSubject} className="text-[9px] px-2 py-1 rounded-lg font-semibold text-white" style={{ background: 'var(--accent)' }}>+ Add Subject</button>
              </div>
              <div className="space-y-3">
                {formSubjects.map((sb, idx) => (
                  <div key={idx} className="rounded-lg p-3 space-y-2" style={{ background: 'var(--input-bg)' }}>
                    <div className="flex items-center justify-between">
                      <select value={sb.name} onChange={e => updateSubject(idx, 'name', e.target.value)}
                        className="px-2 py-1 rounded text-[10px] font-semibold outline-none" style={{ background: 'var(--card)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
                        {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                      {formSubjects.length > 1 && (
                        <button onClick={() => removeSubject(idx)} className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: '#ef4444' }}>✕</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px]">
                      {[
                        { label: 'Qs', field: 'questions' },
                        { label: 'Correct', field: 'correct' },
                        { label: 'Incorrect', field: 'incorrect' },
                        { label: 'Unattempted', field: 'unattempted' },
                      ].map(f => (
                        <div key={f.field}>
                          <p className="mb-0.5" style={{ color: 'var(--muted)' }}>{f.label}</p>
                          <input type="number" min="0" value={sb[f.field]} onChange={e => updateSubject(idx, f.field, e.target.value)}
                            className="w-full px-1.5 py-1 rounded text-[10px] outline-none" style={{ background: 'var(--card)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px]">
                      {[
                        { label: '😅 Silly', field: 'sillyMistakes' },
                        { label: '📝 Formula', field: 'formulaMistakes' },
                        { label: '🧠 Concept', field: 'conceptMistakes' },
                        { label: '⏱️ Time (min)', field: 'timeSpent' },
                      ].map(f => (
                        <div key={f.field}>
                          <p className="mb-0.5" style={{ color: 'var(--muted)' }}>{f.label}</p>
                          <input type="number" min="0" value={sb[f.field]} onChange={e => updateSubject(idx, f.field, e.target.value)}
                            className="w-full px-1.5 py-1 rounded text-[10px] outline-none" style={{ background: 'var(--card)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
                        </div>
                      ))}
                    </div>
                    {/* Subject total */}
                    {sb.questions > 0 && (
                      <p className="text-[9px]" style={{ color: 'var(--muted)' }}>
                        Score: {sb.correct * 4 - sb.incorrect}/{sb.questions * 4} · Accuracy: {sb.correct + sb.incorrect > 0 ? Math.round(sb.correct / (sb.correct + sb.incorrect) * 100) : 0}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {/* Overall calculation */}
              {(() => {
                const valid = formSubjects.filter(s => s.questions > 0)
                if (valid.length === 0) return null
                const o = calcOverall(valid)
                return (
                  <div className="mt-2 p-2 rounded-lg text-[10px] space-y-0.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <p className="font-bold" style={{ color: 'var(--fg)' }}>
                      Overall: {o.totalScore}/{o.totalMarks} · Accuracy: {o.accuracy}% · Time: {Math.floor(o.totalTime / 60)}h {o.totalTime % 60}m
                    </p>
                    <p style={{ color: 'var(--muted)' }}>
                      {o.correct}C · {o.incorrect}W · {o.unattempted}U · Negative: -{o.negativeMarks}
                    </p>
                  </div>
                )
              })()}
            </div>

            {/* Notes */}
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--muted)' }}>📝 NOTES</p>
              <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="What went wrong? What to improve?"
                className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none h-16"
                style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
            </div>

            {/* Reattempt */}
            <div>
              <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--muted)' }}>🔄 SCHEDULE REATTEMPT</p>
              <input type="datetime-local" value={reattemptDate} onChange={e => setReattemptDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              {reattemptDate && <p className="text-[9px] mt-1" style={{ color: '#f59e0b' }}>⏰ Reattempt scheduled for {new Date(reattemptDate).toLocaleString('en-IN')}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setSelectedTest(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
              {getAnalysis(selectedTest.id) && (
                <button onClick={deleteAnalysis} className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: '#ef4444' }}>Delete</button>
              )}
              <button onClick={saveAnalysis} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>💾 Save Analysis</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
