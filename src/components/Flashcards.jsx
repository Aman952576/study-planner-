import { useState, useEffect } from 'react'

const KEY = 'st_flashcards'

export default function Flashcards() {
  const [cards, setCards] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } })
  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [flippedId, setFlippedId] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(cards)) }, [cards])

  const addCard = () => {
    if (!question.trim() || !answer.trim()) return
    setCards(p => [...p, { id: Date.now(), question: question.trim(), answer: answer.trim(), level: 0, reviewedAt: null }])
    setQuestion(''); setAnswer(''); setShowForm(false)
  }

  const deleteCard = (id) => setCards(p => p.filter(c => c.id !== id))

  const rateCard = (id, level) => {
    setCards(p => p.map(c => c.id === id ? { ...c, level, reviewedAt: new Date().toISOString() } : c))
    setFlippedId(null)
  }

  const filtered = filter === 'all' ? cards : filter === 'hard' ? cards.filter(c => c.level <= 1) : cards.filter(c => c.level >= 2)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Flashcards</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Study smarter with Q&A cards</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:scale-105"
          style={{ background: 'var(--accent)' }}>+ Add Card</button>
      </div>

      <div className="flex gap-1.5">
        {[
          { id: 'all', label: `All (${cards.length})` },
          { id: 'hard', label: `Hard (${cards.filter(c => c.level <= 1).length})` },
          { id: 'easy', label: `Easy (${cards.filter(c => c.level >= 2).length})` },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition"
            style={{ background: filter === f.id ? 'var(--accent)' : 'var(--input-bg)', color: filter === f.id ? '#fff' : 'var(--muted)' }}>{f.label}</button>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Answer"
            className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none h-20"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
          <div className="flex gap-2">
            <button onClick={addCard} className="flex-1 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'var(--accent)' }}>Save</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-xs" style={{ color: 'var(--muted)' }}>No cards yet</div>
        )}
        {filtered.map(c => (
          <div key={c.id}
            onClick={() => setFlippedId(flippedId === c.id ? null : c.id)}
            className="rounded-xl p-5 min-h-[140px] cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', perspective: '1000px' }}>
            <div style={{ transform: flippedId === c.id ? 'rotateY(180deg)' : 'none', transition: 'transform 0.4s', transformStyle: 'preserve-3d' }}>
              <div style={{ backfaceVisibility: 'hidden' }}>
                <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--muted)' }}>QUESTION</p>
                <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{c.question}</p>
                <p className="text-[9px] mt-3" style={{ color: 'var(--muted)' }}>Tap to reveal answer</p>
              </div>
              <div style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                <p className="text-[10px] font-semibold mb-2" style={{ color: '#22c55e' }}>ANSWER</p>
                <p className="text-sm" style={{ color: 'var(--fg)' }}>{c.answer}</p>
                {flippedId === c.id && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={(e) => { e.stopPropagation(); rateCard(c.id, 0) }}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold" style={{ background: '#ef444420', color: '#ef4444' }}>Hard</button>
                    <button onClick={(e) => { e.stopPropagation(); rateCard(c.id, 1) }}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold" style={{ background: '#f59e0b20', color: '#f59e0b' }}>Okay</button>
                    <button onClick={(e) => { e.stopPropagation(); rateCard(c.id, 2) }}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold" style={{ background: '#22c55e20', color: '#22c55e' }}>Easy</button>
                  </div>
                )}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); deleteCard(c.id) }}
              className="absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition" style={{ color: 'var(--muted)' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
