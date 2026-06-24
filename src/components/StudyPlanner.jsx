import { useState, useEffect } from 'react'

const KEY = 'st_planner'
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 10 }, (_, i) => i + 7)
const SUBJECTS = ['Physics', 'Chemistry', 'Maths', 'Biology']

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

export default function StudyPlanner() {
  const [slots, setSlots] = useState(load)
  const [showAdd, setShowAdd] = useState(false)
  const [newSlot, setNewSlot] = useState({ day: 'Mon', hour: 7, subject: 'Physics', note: '' })

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(slots)) }, [slots])

  const addSlot = () => {
    setSlots(p => [...p, { id: Date.now(), ...newSlot }])
    setShowAdd(false)
  }

  const deleteSlot = (id) => setSlots(p => p.filter(s => s.id !== id))

  const getSlot = (day, hour) => slots.find(s => s.day === day && s.hour === hour)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Study Planner</h2>
        <button onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
          style={{ background: 'var(--accent)' }}>+ Add Slot</button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-4 space-y-3 animate-fade-up" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-2 gap-2">
            <select value={newSlot.day} onChange={e => setNewSlot(p => ({ ...p, day: e.target.value }))}
              className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={newSlot.hour} onChange={e => setNewSlot(p => ({ ...p, hour: parseInt(e.target.value) }))}
              className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
              {HOURS.map(h => <option key={h} value={h}>{h}:00 - {h + 1}:00</option>)}
            </select>
            <select value={newSlot.subject} onChange={e => setNewSlot(p => ({ ...p, subject: e.target.value }))}
              className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <input type="text" value={newSlot.note} onChange={e => setNewSlot(p => ({ ...p, note: e.target.value }))} placeholder="Topic..."
              className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
          </div>
          <div className="flex gap-2">
            <button onClick={addSlot} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Save</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Weekly grid */}
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="p-2 text-left font-semibold sticky left-0 z-10" style={{ color: 'var(--muted)', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>Time</th>
              {DAYS.map(d => (
                <th key={d} className="p-2 text-center font-semibold" style={{ color: 'var(--muted)', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(h => (
              <tr key={h}>
                <td className="p-2 text-[10px] font-medium sticky left-0 z-10" style={{ color: 'var(--muted)', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>{h}:00</td>
                {DAYS.map(d => {
                  const slot = getSlot(d, h)
                  return (
                    <td key={d} className="p-1 text-center align-top" style={{ borderBottom: '1px solid var(--border)' }}>
                      {slot && (
                        <div className="rounded-lg p-1.5 cursor-pointer group relative"
                          style={{ background: 'var(--accent)', opacity: 0.85 }}>
                          <p className="text-[10px] font-bold text-white leading-tight">{slot.subject}</p>
                          {slot.note && <p className="text-[8px] text-white/70 truncate">{slot.note}</p>}
                          <button onClick={() => deleteSlot(slot.id)}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subject legend */}
      <div className="flex gap-3">
        {SUBJECTS.map(s => (
          <span key={s} className="text-[10px]" style={{ color: 'var(--muted)' }}>◆ {s}</span>
        ))}
      </div>
    </div>
  )
}
