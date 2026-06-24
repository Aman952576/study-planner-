import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function getItem(key) { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } }

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6', '#a78bfa']

export default function WeeklyReport() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)
  const weekStr = `${weekAgo.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`

  const todos = getItem('st_todos')
  const tests = getItem('st_tests')
  const materials = getItem('st_materials')
  const timelogs = getItem('st_timelogs')
  const pomodoro = getItem('st_pomodoro')

  const weekTodos = todos.filter(t => t.createdAt && t.createdAt.slice(0, 10) >= weekAgo.toISOString().slice(0, 10))
  const weekTests = tests.filter(t => t.date && t.date >= weekAgo.toISOString().slice(0, 10))
  const weekTime = timelogs.filter(l => l.startedAt && l.startedAt.slice(0, 10) >= weekAgo.toISOString().slice(0, 10))
  const weekPom = pomodoro.filter(s => s.doneAt && s.doneAt.slice(0, 10) >= weekAgo.toISOString().slice(0, 10))

  const totalTime = weekTime.reduce((s, l) => s + l.duration, 0)
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    return `${h}h ${m}m`
  }

  const doneTodos = weekTodos.filter(t => t.done).length
  const avgAcc = weekTests.length ? Math.round(weekTests.reduce((s, t) => s + (t.accuracy || 0), 0) / weekTests.length) : 0

  const bySubject = {}
  weekTime.forEach(l => { bySubject[l.subject] = (bySubject[l.subject] || 0) + l.duration })
  const subjectData = Object.entries(bySubject).map(([k, v]) => ({ name: k, time: Math.round(v / 60) }))

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dailyData = dayNames.map((d, i) => {
    const dStr = new Date(now.getTime() - (6 - i) * 86400000).toISOString().slice(0, 10)
    const dayLogs = weekTime.filter(l => l.startedAt?.slice(0, 10) === dStr)
    const mins = Math.round(dayLogs.reduce((s, l) => s + l.duration, 0) / 60)
    return { name: d, mins }
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Weekly Progress</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{weekStr}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tasks Done', value: `${doneTodos}/${weekTodos.length}`, color: '#22c55e' },
          { label: 'Tests Given', value: weekTests.length, color: '#3b82f6' },
          { label: 'Study Time', value: formatTime(totalTime), color: '#f59e0b' },
          { label: 'Pomodoros', value: weekPom.length, color: '#ec4899' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {weekTests.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>TEST AVERAGE</p>
          <p className="text-2xl font-bold" style={{ color: avgAcc >= 70 ? '#22c55e' : avgAcc >= 40 ? '#f59e0b' : '#ef4444' }}>{avgAcc}%</p>
          <p className="text-[10px]" style={{ color: 'var(--muted)' }}>avg accuracy</p>
        </div>
      )}

      {subjectData.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>TIME PER SUBJECT (min)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} />
              <Tooltip />
              <Bar dataKey="time" radius={[6, 6, 0, 0]}>
                {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>DAILY STUDY (min)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dailyData}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} />
            <Tooltip />
            <Bar dataKey="mins" radius={[4, 4, 0, 0]}>
              {dailyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {weekTime.length === 0 && weekTodos.length === 0 && weekTests.length === 0 && (
        <div className="text-center py-12 text-xs" style={{ color: 'var(--muted)' }}>
          <p>No data this week yet</p>
          <p className="mt-1">Start using Pomodoro, Time Logger, To-Do and Tests to see progress here!</p>
        </div>
      )}
    </div>
  )
}
