import { useState, useEffect } from 'react'

const EMOJIS = ['🎯', '🏆', '🔥', '⭐', '💪', '🎓', '👑', '🍅', '📚', '📊', '🃏', '📝', '⚡', '💎', '🌟', '🎖', '🏅', '🥇', '🥈', '🥉', '🏁', '🎸', '🚀', '🌈', '🎨', '🧠', '💡', '🎵', '🎮', '🏀']

const BUILTIN = [
  { id: 'first-task', label: 'First Task', desc: 'Complete your first task', icon: '🎯' },
  { id: 'task-master', label: 'Task Master', desc: 'Complete 50 tasks', icon: '🏆' },
  { id: 'streak-3', label: 'On Fire', desc: '3-day streak', icon: '🔥' },
  { id: 'streak-7', label: 'Week Warrior', desc: '7-day streak', icon: '⭐' },
  { id: 'first-test', label: 'Test Pilot', desc: 'Give your first test', icon: '📝' },
  { id: 'test-10', label: 'Exam Machine', desc: 'Give 10 tests', icon: '📊' },
  { id: 'first-pomo', label: 'Focused', desc: 'Complete 1 pomodoro', icon: '🍅' },
  { id: 'pomo-25', label: 'Pomodoro King', desc: 'Complete 25 pomodoros', icon: '👑' },
  { id: 'time-1h', label: 'Getting Started', desc: 'Log 1 hour of study', icon: '⏱' },
  { id: 'time-10h', label: 'Dedicated', desc: 'Log 10 hours of study', icon: '💪' },
  { id: 'time-50h', label: 'Scholar', desc: 'Log 50 hours of study', icon: '🎓' },
  { id: 'first-flash', label: 'Flash Master', desc: 'Create 5 flashcards', icon: '🃏' },
  { id: 'mat-100', label: 'Material Man', desc: 'Complete 100 questions', icon: '📚' },
  { id: 'accuracy-80', label: 'Sharp Shooter', desc: '80%+ test accuracy', icon: '🎯' },
]

const CUSTOM_KEY = 'st_custom_achievements'
const UNLOCKED_KEY = 'st_unlocked_achievements'

function getItem(key) { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } }

export default function Achievements() {
  const [custom, setCustom] = useState(() => getItem(CUSTOM_KEY))
  const [unlocked, setUnlocked] = useState(() => getItem(UNLOCKED_KEY))
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newEmoji, setNewEmoji] = useState('🎯')

  useEffect(() => { localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom)) }, [custom])
  useEffect(() => { localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked)) }, [unlocked])

  const allBadges = [...BUILTIN, ...custom.map((c, i) => ({ ...c, id: `custom-${i}` }))]

  const toggleUnlock = (id) => {
    setUnlocked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const addCustom = () => {
    if (!newName.trim()) return
    setCustom(prev => [...prev, { label: newName.trim(), desc: newDesc.trim(), icon: newEmoji }])
    setNewName(''); setNewDesc(''); setNewEmoji('🎯'); setShowForm(false)
  }

  const deleteCustom = (idx) => {
    const toRemove = `custom-${idx}`
    setCustom(prev => prev.filter((_, i) => i !== idx))
    setUnlocked(prev => prev.filter(id => id !== toRemove))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Achievements</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{unlocked.length}/{allBadges.length} badges earned</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:scale-105"
          style={{ background: 'var(--accent)' }}>+ Custom Badge</button>
      </div>

      <div className="rounded-xl p-4 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{unlocked.length}/{allBadges.length}</p>
        <div className="mt-2 h-2 rounded-full" style={{ background: 'var(--input-bg)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${allBadges.length > 0 ? unlocked.length / allBadges.length * 100 : 0}%`, background: 'var(--accent)' }} />
        </div>
      </div>

      {/* Unlocked */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allBadges.filter(b => unlocked.includes(b.id)).map(b => (
          <div key={b.id} className="rounded-xl p-4 text-center transition-all hover:scale-[1.02] group" style={{ background: 'var(--card)', border: '1px solid var(--accent)' }}>
            <span className="text-2xl">{b.icon}</span>
            <p className="text-xs font-bold mt-1" style={{ color: 'var(--fg)' }}>{b.label}</p>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--muted)' }}>{b.desc}</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: '#22c55e20', color: '#22c55e' }}>Unlocked ✓</span>
            <button onClick={() => toggleUnlock(b.id)} className="block mx-auto mt-1 text-[8px] opacity-0 group-hover:opacity-100 transition" style={{ color: '#ef4444' }}>Lock it</button>
          </div>
        ))}
      </div>

      {/* Locked */}
      {allBadges.filter(b => !unlocked.includes(b.id)).length > 0 && (
        <>
          <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Locked</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allBadges.filter(b => !unlocked.includes(b.id)).map((b, i) => {
              const isCustom = b.id.startsWith('custom-')
              const cIdx = isCustom ? parseInt(b.id.split('-')[1]) : -1
              return (
                <div key={b.id} className="rounded-xl p-4 text-center opacity-50 group relative" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <span className="text-2xl grayscale">{b.icon}</span>
                  <p className="text-xs font-bold mt-1" style={{ color: 'var(--muted)' }}>{b.label}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--muted)' }}>{b.desc}</p>
                  <div className="mt-1 space-y-1">
                    <button onClick={() => toggleUnlock(b.id)}
                      className="text-[9px] px-2 py-0.5 rounded font-semibold block mx-auto"
                      style={{ background: 'var(--accent)', color: '#fff' }}>Unlock</button>
                    {isCustom && (
                      <button onClick={() => deleteCustom(cIdx)}
                        className="text-[8px] block mx-auto" style={{ color: '#ef4444' }}>Delete</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Add custom badge form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowForm(false)}>
          <div className="rounded-xl p-5 max-w-sm w-full space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Create Custom Badge</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Badge Name</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Physics Pro"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Description</label>
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="e.g. Complete all Physics chapters"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Choose Emoji</label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg max-h-[120px] overflow-y-auto" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                  {EMOJIS.map(e => (
                    <button key={e} type="button" onClick={() => setNewEmoji(e)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${newEmoji === e ? 'ring-2 ring-offset-1' : 'opacity-60 hover:opacity-100'}`}
                      style={{ background: newEmoji === e ? 'var(--accent)' : 'transparent', ringColor: 'var(--accent)' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
              <button onClick={addCustom} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Create Badge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
