import { useState, useRef, useEffect } from 'react'
import { parseAndExecuteActions, stripActions, AI_SYSTEM_PROMPT, buildAppContext } from '../utils/actionParser'

const API = '/api'

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [response])

  const handleSend = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setResponse('')
    const userMsg = prompt
    setPrompt('')
    try {
      const gc = await fetch(`${API}/code/graph-context`).then(r => r.json()).catch(() => null)
      const memoryCtx = gc ? Object.entries(gc).filter(([k]) => !['total_nodes', 'total_edges', 'vector_memories'].includes(k)).map(([type, items]) => `${type}: ${items.join(', ')}`).join('\n') : ''
      const vc = await fetch(`${API}/memory/context?q=${encodeURIComponent(userMsg)}`).then(r => r.json()).catch(() => null)
      const appData = buildAppContext()
      const fullCtx = `App Data:\n${appData}\n\nMemory:\n${memoryCtx}\n\n${vc?.context || ''}`
      const r = await fetch(`${API}/llama/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${fullCtx}\n\nUser: ${userMsg}`, system: AI_SYSTEM_PROMPT })
      }).then(r => r.json())
      let reply = r?.response || ''
      if (reply) {
        const actions = await parseAndExecuteActions(reply)
        const clean = stripActions(reply)
        let display = clean
        if (actions.length) display += `\n\n${actions.map(a => a.result).join('\n')}`
        setResponse(display)
      }
    } catch { setResponse('⚠️ Error') }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(p => !p)}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        style={{ background: 'var(--accent)' }}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          {open
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          }
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-4 py-3 text-xs font-bold flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', color: 'var(--fg)' }}>
            <span>AI Assistant</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          </div>
          <div className="p-3" style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {response && (
              <div className="px-3 py-2 rounded-xl text-[10px] leading-relaxed whitespace-pre-wrap" style={{ background: 'var(--input-bg)', color: 'var(--fg)' }}>
                {response}
              </div>
            )}
            {loading && <p className="text-[10px]" style={{ color: 'var(--muted)' }}>Thinking...</p>}
            <div ref={endRef} />
          </div>
          <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
            <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Kya karna hai?"
              className="flex-1 px-3 py-2 rounded-xl text-[10px] outline-none"
              style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
              onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} disabled={loading || !prompt.trim()}
              className="px-3 py-2 rounded-xl text-[10px] font-bold text-white"
              style={{ background: loading ? 'var(--input-bg)' : 'var(--accent)' }}>
              Go
            </button>
          </div>
        </div>
      )}
    </>
  )
}
