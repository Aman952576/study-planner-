import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import TodoList from './TodoList'
import ExamTracker, { EXAM_DATA } from './ExamTracker'
import CalendarView from './CalendarView'
import Tests from './Tests'
import MaterialsAnalyzer from './MaterialsAnalyzer'
import LiveClock from './LiveClock'
import ExamCountdown from './ExamCountdown'
import StudyPlanner from './StudyPlanner'
import Roadmap from './Roadmap'
import Pomodoro from './Pomodoro'
import FocusMode from './FocusMode'
import DailyGoals from './DailyGoals'
import QuickNotes from './QuickNotes'
import TimeLogger from './TimeLogger'
import Flashcards from './Flashcards'
import WeeklyReport from './WeeklyReport'
import Achievements from './Achievements'
import Resources from './Resources'
import AiAgent from './AiAgent'
import CodeAgent from './CodeAgent'
import Mnc from './MNC'
import Users from './Users'
import FloatingAssistant from './FloatingAssistant'

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
  'Progress, not perfection.',
  'It always seems impossible until it\'s done.',
  'Push yourself, because no one else is going to do it for you.',
  'The harder you work, the luckier you get.',
  'Dream big. Start small. Act now.',
  'Your only limit is your mind.',
  'Great things never come from comfort zones.',
  'You are capable of more than you know.',
  'Begin anywhere — but begin.',
  'Champions keep playing until they get it right.',
  'Be stronger than your strongest excuse.',
  'Success doesn\'t come from what you do occasionally, but what you do consistently.',
  'Wake up with determination. Go to bed with satisfaction.',
  'Do something today that your future self will thank you for.',
  'Little by little, day by day, what is meant for you will find its way.',
  'Action is the foundational key to all success.',
  'The way to get started is to quit talking and begin doing.',
  'It\'s not about having time. It\'s about making time.',
  'Your mindset determines your success.',
  'Make today so awesome that yesterday gets jealous.',
  'You don\'t have to see the whole staircase, just take the first step.',
]


const sections = {
  dashboard: { component: null, label: 'Dashboard' },
  todo: { component: TodoList, label: 'To-Do List' },
  exams: { component: ExamTracker, label: 'Exam Tracker' },
  calendar: { component: CalendarView, label: 'Calendar' },
  tests: { component: Tests, label: 'Tests' },
  materials: { component: MaterialsAnalyzer, label: 'Materials Analyzer' },
  planner: { component: StudyPlanner, label: 'Study Planner' },
  roadmap: { component: Roadmap, label: 'Roadmap' },
  pomodoro: { component: Pomodoro, label: 'Pomodoro Timer' },
  focus: { component: FocusMode, label: 'Focus Mode' },
  goals: { component: DailyGoals, label: 'Daily Goals' },
  notes: { component: QuickNotes, label: 'Quick Notes' },
  time: { component: TimeLogger, label: 'Time Logger' },
  flashcards: { component: Flashcards, label: 'Flashcards' },
  weekly: { component: WeeklyReport, label: 'Weekly Report' },
  achievements: { component: Achievements, label: 'Achievements' },
  resources: { component: Resources, label: 'Resources' },
  aiagent: { component: AiAgent, label: 'AI Agent' },
  codeagent: { component: CodeAgent, label: 'Code Agent' },
  mnc: { component: Mnc, label: 'MNC Dashboard' },
  users: { component: Users, label: 'Users' },
}

function getItem(key) {
  try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] }
}

const REV_KEY = 'st_revisions'
function loadRevisions() {
  try { const d = localStorage.getItem(REV_KEY); return d ? JSON.parse(d) : [] } catch { return [] }
}

export default function Dashboard({ activeSection, onNavigate }) {
  const [stats, setStats] = useState({ todos: 0, done: 0, backlog: 0, tests: 0, avg: 0, matPct: 0, matTotal: 0 })
  const [revisions, setRevisions] = useState(loadRevisions)
  const [reviseModal, setReviseModal] = useState(null)
  const [reviseInstr, setReviseInstr] = useState('')
  const [reviseDate, setReviseDate] = useState('')
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))

  useEffect(() => { setRevisions(loadRevisions()) }, [activeSection])

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(p => (p + 1) % QUOTES.length), 3600000)
    return () => clearInterval(t)
  }, [])

  const completeRevision = (revId) => {
    const updated = revisions.map(r => r.id === revId ? { ...r, done: true } : r)
    setRevisions(updated)
    localStorage.setItem(REV_KEY, JSON.stringify(updated))
  }

  const openRerevise = (rev) => {
    const defDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16)
    setReviseModal(rev)
    setReviseInstr(rev.instructions)
    setReviseDate(defDate)
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
    const updated = [...revisions, rev]
    setRevisions(updated)
    localStorage.setItem(REV_KEY, JSON.stringify(updated))
    setReviseModal(null)
  }

  const today = new Date().toISOString().slice(0, 10)
  const now = new Date()
  const calTests = getItem('st_calendar_tests')
  const allAnalysis = getItem('st_tests')
  const upcomingTests = Array.isArray(calTests)
    ? calTests.filter(t => t.date && t.date >= now.toISOString()).sort((a, b) => a.date.localeCompare(b.date))
    : []
  const nextTest = upcomingTests[0] || null
  const liveTests = Array.isArray(calTests)
    ? calTests.filter(t => t.date && t.date.slice(0, 10) === today && !t.title?.includes('(Reattempt)'))
    : []
  const liveReattempts = Array.isArray(calTests)
    ? calTests.filter(t => t.title?.includes('(Reattempt)') && t.date && t.date.slice(0, 10) === today)
    : []

  const todayRevisions = Array.isArray(revisions)
    ? revisions.filter(r => !r.done && r.scheduledAt && r.scheduledAt.slice(0, 10) <= today)
      .sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || ''))
    : []

  const reattemptsToday = Array.isArray(allAnalysis)
    ? allAnalysis.filter(a => a.reattempt && a.reattempt.date && a.reattempt.date.slice(0, 10) <= today && !a.reattempt.completed)
    : []

  const analysisStats = Array.isArray(allAnalysis) && allAnalysis.length > 0 ? {
    totalTests: allAnalysis.length,
    avgScore: Math.round(allAnalysis.reduce((s, a) => s + a.totalScore, 0) / allAnalysis.length),
    avgAccuracy: Math.round(allAnalysis.reduce((s, a) => s + a.accuracy, 0) / allAnalysis.length),
    totalCorrect: allAnalysis.reduce((s, a) => s + a.correct, 0),
    totalIncorrect: allAnalysis.reduce((s, a) => s + a.incorrect, 0),
    totalSilly: allAnalysis.reduce((s, a) => s + a.subjects.reduce((ss, sb) => ss + (sb.sillyMistakes || 0), 0), 0),
    totalFormula: allAnalysis.reduce((s, a) => s + a.subjects.reduce((ss, sb) => ss + (sb.formulaMistakes || 0), 0), 0),
    totalConcept: allAnalysis.reduce((s, a) => s + a.subjects.reduce((ss, sb) => ss + (sb.conceptMistakes || 0), 0), 0),
  } : null

  useEffect(() => {
    const todos = getItem('st_todos')
    const tests = getItem('st_tests')
    const mats = getItem('st_materials')
    const todoDone = todos.filter(t => t.done).length
    const todoBacklog = todos.filter(t => t.backlog).length
    const testAvg = tests.length ? Math.round(tests.reduce((s, t) => s + ((t.totalScore || t.score || 0) / (t.totalMarks || t.total || 1) * 100), 0) / tests.length) : 0
    const matPct = mats.length ? Math.round(mats.reduce((s, m) => s + (m.done / m.total * 100), 0) / mats.length) : 0
    const matTotal = mats.reduce((s, m) => s + m.total, 0)
    setStats({ todos: todos.length, done: todoDone, backlog: todoBacklog, tests: tests.length, avg: testAvg, matPct, matTotal })
  }, [activeSection])

  const Section = sections[activeSection]?.component

  if (Section) return <Section />

  // Dashboard overview
  const chartData = [
    { name: 'Completed', value: stats.done, color: '#22c55e' },
    { name: 'Pending', value: stats.todos - stats.done, color: '#94a3b8' },
  ].filter(d => d.value > 0)

  const quickCards = [
    { label: 'Tasks Done', value: `${stats.done}/${stats.todos}`, sub: `${stats.todos - stats.done} remaining`, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { label: 'Backlog', value: `${stats.backlog}`, sub: 'moved to backlog', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Tests Avg', value: `${stats.avg}%`, sub: `${stats.tests} tests`, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Materials', value: `${stats.matPct}%`, sub: `${stats.matTotal} items`, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Dashboard Overview</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Your learning ecosystem at a glance</p>
      </div>

      {/* Clocks */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <LiveClock />
        <ExamCountdown examKey="jee-mains" examName="JEE Mains" accentColor="#3b82f6" />
        <ExamCountdown examKey="jee-advanced" examName="JEE Advanced" accentColor="#8b5cf6" />
        <ExamCountdown examKey="neet" examName="NEET" accentColor="#22c55e" />
        <ExamCountdown examKey="iat" examName="IAT" accentColor="#f59e0b" />
        <ExamCountdown examKey="nest" examName="NEST" accentColor="#ec4899" />
        <ExamCountdown examKey="isi-cmi" examName="ISI & CMI" accentColor="#06b6d4" />
      </div>

      {/* Quick cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickCards.map(c => (
          <div key={c.label} className="rounded-xl p-4 transition-all hover:scale-[1.02]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{c.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--accent)' }}>{c.value}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{c.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent)' + '15' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Syllabus Overview */}
      {(() => {
        const trackerData = (() => { try { return JSON.parse(localStorage.getItem('st_exam_tracker')) || {} } catch { return {} } })()
        const chapters = trackerData.chapters || {}
        const examProgress = Object.entries(EXAM_DATA).map(([key, exam]) => {
          let totalTopics = 0, completedTopics = 0
          Object.values(exam.subjects).forEach(subject => {
            subject.chapters.forEach(ch => {
              const chData = chapters[ch.id] || { topicStatus: {} }
              totalTopics += ch.topics.length
              ch.topics.forEach((_, idx) => { if (chData.topicStatus[idx]) completedTopics++ })
            })
          })
          const pct = totalTopics > 0 ? Math.round(completedTopics / totalTopics * 100) : 0
          return { key, name: exam.name, pct, completedTopics, totalTopics }
        }).filter(e => e.totalTopics > 0)
        if (examProgress.length === 0) return null
        return (
          <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--fg)' }}>Syllabus Progress</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {examProgress.map(exam => (
                <div key={exam.key} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>{exam.name}</span>
                    <span className="text-xs font-bold" style={{ color: exam.pct === 100 ? '#22c55e' : 'var(--accent)' }}>{exam.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${exam.pct}%`, background: exam.pct === 100 ? '#22c55e' : 'var(--accent)' }} />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{exam.completedTopics}/{exam.totalTopics} topics</p>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Backlog Items */}
      {(() => {
        const allTodos = getItem('st_todos')
        const backlogItems = allTodos.filter(t => t.backlog).slice(0, 5)
        if (backlogItems.length === 0) return null
        return (
          <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--card), #a78bfa10)', border: '1px solid var(--border)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5" style={{ background: '#a78bfa', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>📦 Backlog Items</h3>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                  {stats.backlog} item{stats.backlog !== 1 ? 's' : ''} in backlog
                </p>
              </div>
              <button onClick={() => onNavigate?.('todo')} className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ background: 'var(--input-bg)', color: 'var(--accent)' }}>View All →</button>
            </div>
            <div className="space-y-2">
              {backlogItems.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0" style={{ background: '#a78bfa20', color: '#a78bfa' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'var(--fg)' }}>{t.title}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: 'var(--muted)' }}>
                      {t.backlog ? `Target: ${new Date(t.backlog).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                    </p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: '#a78bfa15', color: '#a78bfa' }}>{t.category}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Things to Revise Today */}
      {/* Things to Revise Today */}
      <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--card), #3b82f610)', border: '1px solid var(--border)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5" style={{ background: 'var(--accent)', transform: 'translate(30%, -30%)' }} />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Things to Revise Today</h3>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
              {todayRevisions.length} revision{todayRevisions.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold animate-fade-up" style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f650' }}>
            {today}
          </span>
        </div>
        {todayRevisions.length === 0 ? (
          <div className="text-center py-8 text-xs" style={{ color: 'var(--muted)' }}>
            <svg className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p>No revisions scheduled for today</p>
            <p className="mt-1">Go to To-Do List → add a task → click Revise to schedule</p>
            <button onClick={() => onNavigate?.('planner')} className="mt-3 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition hover:scale-105" style={{ background: 'var(--accent)', color: '#fff' }}>
              Plan study sessions →
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {todayRevisions.map(rev => (
              <div key={rev.id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0" style={{ background: rev.rerevise ? '#f59e0b20' : '#3b82f620', color: rev.rerevise ? '#f59e0b' : '#3b82f6' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>{rev.todoTitle}</p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>{rev.category || 'General'}</span>
                    <span className="text-[9px]" style={{ color: rev.scheduledAt && rev.scheduledAt.slice(0, 10) < today ? '#ef4444' : 'var(--muted)' }}>
                      {rev.scheduledAt && rev.scheduledAt.slice(0, 10) < today ? 'Overdue' : rev.scheduledAt ? rev.scheduledAt.slice(11, 16) : ''}
                    </span>
                  </div>
                  {rev.instructions && (
                    <p className="text-[9px] mt-1 italic" style={{ color: 'var(--muted)' }}>{rev.instructions}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => completeRevision(rev.id)}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition hover:scale-105 text-white"
                    style={{ background: '#22c55e' }}>
                    Done
                  </button>
                  <button onClick={() => openRerevise(rev)}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition hover:scale-105"
                    style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>
                    Re-revise
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 text-center">
          <button onClick={() => onNavigate?.('planner')} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition hover:scale-105" style={{ background: 'var(--input-bg)', color: 'var(--accent)' }}>
            Plan study sessions →
          </button>
        </div>
      </div>

      {/* Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nextTest && (
          <div className="rounded-xl p-5 relative overflow-hidden transition-all hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg, var(--card), #f59e0b10)', border: '1px solid var(--border)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5" style={{ background: '#f59e0b', transform: 'translate(30%, -30%)' }} />
            <p className="text-[10px] font-semibold mb-2" style={{ color: '#f59e0b' }}>NEXT TEST</p>
            <p className="text-sm font-bold" style={{ color: 'var(--fg)' }}>{nextTest.title}</p>
            <div className="flex gap-3 mt-2 text-[10px]" style={{ color: 'var(--muted)' }}>
              <span>{nextTest.subject}</span>
              <span>📅 {new Date(nextTest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              <span>⏰ {nextTest.date.slice(11, 16)}</span>
            </div>
          </div>
        )}
        {liveTests.length > 0 && (
          <div className="rounded-xl p-5 relative overflow-hidden transition-all hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg, var(--card), #22c55e10)', border: '1px solid var(--border)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5" style={{ background: '#22c55e', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-fade-up" />
              <p className="text-[10px] font-semibold" style={{ color: '#22c55e' }}>LIVE / TODAY</p>
            </div>
            <div className="space-y-1.5">
              {liveTests.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <p className="text-xs font-medium" style={{ color: 'var(--fg)' }}>{t.title}</p>
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{t.subject} · {t.date.slice(11, 16)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!nextTest && liveTests.length === 0 && (
          <div className="rounded-xl p-5 text-center col-span-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>No upcoming tests</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Go to Calendar → Add Test to schedule one</p>
          </div>
        )}
      </div>

      {/* Test Analysis Overview */}
      {analysisStats && (
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>📊 Test Analysis Overview</h3>
            <button onClick={() => onNavigate?.('tests')} className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ background: 'var(--input-bg)', color: 'var(--accent)' }}>View All →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {[
              { label: 'Tests', value: analysisStats.totalTests, color: 'var(--accent)' },
              { label: 'Avg Score', value: analysisStats.avgScore, color: '#22c55e' },
              { label: 'Avg Accuracy', value: analysisStats.avgAccuracy + '%', color: '#3b82f6' },
              { label: 'Total Qs', value: analysisStats.totalCorrect + analysisStats.totalIncorrect, color: '#f59e0b', sub: `${analysisStats.totalCorrect}C / ${analysisStats.totalIncorrect}W` },
            ].map(c => (
              <div key={c.label} className="rounded-lg px-3 py-2.5 text-center" style={{ background: 'var(--input-bg)' }}>
                <p className="text-[9px]" style={{ color: 'var(--muted)' }}>{c.label}</p>
                <p className="text-lg font-bold" style={{ color: c.color }}>{c.value}</p>
                {c.sub && <p className="text-[8px]" style={{ color: 'var(--muted)' }}>{c.sub}</p>}
              </div>
            ))}
          </div>
          {analysisStats.totalSilly + analysisStats.totalFormula + analysisStats.totalConcept > 0 && (
            <div className="flex gap-4 text-[10px]">
              {[
                { label: '😅 Silly', value: analysisStats.totalSilly, color: '#f59e0b' },
                { label: '📝 Formula', value: analysisStats.totalFormula, color: '#3b82f6' },
                { label: '🧠 Concept', value: analysisStats.totalConcept, color: '#ef4444' },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-1">
                  <span style={{ color: 'var(--muted)' }}>{m.label}:</span>
                  <span className="font-bold" style={{ color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reattempts Today */}
      {(reattemptsToday.length > 0 || liveReattempts.length > 0) && (
        <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--card), #f59e0b10)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-semibold mb-2" style={{ color: '#f59e0b' }}>🔄 REATTEMPTS</p>
          <div className="space-y-2">
            {liveReattempts.map(t => (
              <div key={t.id} className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--fg)' }}>{t.title}</span>
                <span className="text-[9px]" style={{ color: 'var(--muted)' }}>⏰ {t.date.slice(11, 16)}</span>
              </div>
            ))}
            {reattemptsToday.map(a => (
              <div key={a.id} className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--fg)' }}>{a.title} (Reattempt)</span>
                <span className="text-[9px]" style={{ color: a.reattempt.date.slice(0, 10) < today ? '#ef4444' : 'var(--muted)' }}>
                  {a.reattempt.date.slice(0, 10) < today ? 'Overdue' : a.reattempt.date.slice(11, 16)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Materials */}
      {(() => {
        const mats = getItem('st_materials')
        if (mats.length === 0) return null
        const recent = mats.slice(-5).reverse()
        return (
          <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>📚 Recent Materials</h3>
              <button onClick={() => onNavigate?.('materials')} className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ background: 'var(--input-bg)', color: 'var(--accent)' }}>View All →</button>
            </div>
            <div className="space-y-2">
              {recent.map(m => {
                const pct = m.total > 0 ? Math.round(m.done / m.total * 100) : 0
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 text-white" style={{ background: pct === 100 ? '#22c55e' : pct > 50 ? '#f59e0b' : 'var(--accent)' }}>{pct}%</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--fg)' }}>{m.title}</p>
                      <p className="text-[9px]" style={{ color: 'var(--muted)' }}>{m.type} · {m.done}/{m.total}</p>
                    </div>
                    <div className="w-20 h-1.5 rounded-full" style={{ background: 'var(--input-bg)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : 'var(--accent)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Revise Modal */}
      {reviseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setReviseModal(null)}>
          <div className="rounded-xl p-5 max-w-md w-full space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Re-revise</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{reviseModal.todoTitle}</p>
            </div>
            <textarea value={reviseInstr} onChange={e => setReviseInstr(e.target.value)} placeholder="Revision instructions..."
              className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none h-20"
              style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
            <input type="datetime-local" value={reviseDate} onChange={e => setReviseDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
            <div className="flex gap-2">
              <button onClick={() => setReviseModal(null)} className="flex-1 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
              <button onClick={saveRerevision} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: reviseDate ? 'var(--accent)' : 'var(--input-bg)', color: reviseDate ? '#fff' : 'var(--muted)' }}>Re-schedule</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task completion chart */}
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>TASK COMPLETION</p>
          <div className="flex items-center gap-6">
            <div className="relative" style={{ width: '112px', height: '112px' }}>
              <ResponsiveContainer width="100%" height={112}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={32} outerRadius={48} dataKey="value" stroke="none">
                    {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{stats.todos ? Math.round(stats.done / stats.todos * 100) : 0}%</span>
              </div>
            </div>
            <div className="space-y-2">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded" style={{ background: d.color }} />
                  <span style={{ color: 'var(--muted)' }}>{d.name}</span>
                  <span className="font-semibold" style={{ color: 'var(--fg)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>QUICK ACTIONS</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Add Task', section: 'todo', icon: 'M12 4v16m8-8H4' },
              { label: 'Plan Study', section: 'planner', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { label: 'Record Test', section: 'tests', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { label: 'Schedule', section: 'calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },

            ].map(a => (
              <div key={a.label} onClick={() => onNavigate?.(a.section)}
                className="flex items-center gap-2 px-3 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer hover:scale-[1.02]"
                style={{ background: 'var(--input-bg)' }}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
                </svg>
                {a.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Motivation */}
      <div className="rounded-xl p-5 text-center" style={{ background: 'linear-gradient(135deg, var(--accent), transparent)', border: '1px solid var(--border)' }}>
        <p className="text-sm font-medium italic leading-relaxed" style={{ color: 'var(--fg)' }}>
          &ldquo;{QUOTES[quoteIdx]}&rdquo;
        </p>
        <p className="text-[9px] mt-2" style={{ color: 'var(--muted)', opacity: 0.4 }}>— refreshes every hour —</p>
      </div>

      <FloatingAssistant />
    </div>
  )
}
