import { useState, useEffect } from 'react'

const KEY = 'st_quicknotes'

export default function QuickNotes() {
  const [notes, setNotes] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } })
  const [text, setText] = useState('')

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(notes)) }, [notes])

  const addNote = () => {
    if (!text.trim()) return
    setNotes(p => [{ id: Date.now(), text: text.trim(), createdAt: new Date().toISOString() }, ...p])
    setText('')
  }

  const deleteNote = (id) => setNotes(p => p.filter(n => n.id !== id))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Quick Notes</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Jot down ideas before they disappear</p>
      </div>
      <div className="flex gap-2">
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Write a quick note..."
          className="flex-1 px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
          onKeyDown={e => e.key === 'Enter' && addNote()} />
        <button onClick={addNote}
          className="px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:scale-105"
          style={{ background: 'var(--accent)' }}>Add</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {notes.length === 0 && (
          <div className="col-span-full text-center py-10 text-xs" style={{ color: 'var(--muted)' }}>No notes yet</div>
        )}
        {notes.map(n => (
          <div key={n.id} className="rounded-xl p-4 group relative" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--fg)' }}>{n.text}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[9px]" style={{ color: 'var(--muted)' }}>{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              <button onClick={() => deleteNote(n.id)} className="opacity-0 group-hover:opacity-100 text-[9px] px-2 py-1 rounded transition" style={{ background: '#ef444415', color: '#ef4444' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
