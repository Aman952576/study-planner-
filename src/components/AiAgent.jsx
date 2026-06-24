import { useState, useEffect, useCallback, useRef } from 'react'

const API = '/api'
const STORAGE_KEY = 'ls_messages'
const SESSION_KEY = 'chat_session_id'

function getSessionId() {
  let sid = localStorage.getItem(SESSION_KEY)
  if (!sid) { sid = 'session_' + Date.now(); localStorage.setItem(SESSION_KEY, sid) }
  return sid
}

export default function AiAgent() {
  const [status, setStatus] = useState({ llama_enabled: false, llama_connected: false, groq_available: false, actual_mode: 'ollama', cloud_memory: false })
  const [tasks, setTasks] = useState([])
  const [prioritized, setPrioritized] = useState([])
  const [loading, setLoading] = useState({})
  const [daily, setDaily] = useState('')
  const [weekly, setWeekly] = useState('')
  const [scanData, setScanData] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [weakness, setWeakness] = useState('')
  const [mistake, setMistake] = useState('')
  const [graphNodes, setGraphNodes] = useState([])
  const [llamaEnabled, setLlamaEnabled] = useState(false)
  const [askTimer, setAskTimer] = useState(0)
  const [askError, setAskError] = useState('')
  const timerRef = useRef(null)
  const abortRef = useRef(null)
  const [chatHistory, setChatHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const historyEndRef = useRef(null)
  const [chatLoaded, setChatLoaded] = useState(false)

  const api = useCallback(async (url, opts = {}) => {
    try {
      const res = await fetch(`${API}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...opts
      })
      return await res.json()
    } catch { return null }
  }, [])

  useEffect(() => { loadStatus(); loadTasks(); loadGraph(); loadCloudHistory() }, [])

  useEffect(() => {
    if (showHistory && historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory, showHistory])

  const loadCloudHistory = async () => {
    const sid = getSessionId()
    const msgs = await api(`/chat/history?session_id=${encodeURIComponent(sid)}&limit=100`)
    if (msgs && msgs.length) {
      const formatted = msgs.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.created_at
      }))
      setChatHistory(formatted)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted)) } catch {}
    }
    setChatLoaded(true)
  }

  const saveMessagesToCloud = async (msgs) => {
    const sid = getSessionId()
    await api('/chat/save', {
      method: 'POST',
      body: JSON.stringify({ session_id: sid, messages: msgs })
    })
  }

  const loadStatus = async () => {
    const s = await api('/status')
    if (s) { setStatus(s); setLlamaEnabled(s.llama_enabled) }
  }

  const loadTasks = async () => {
    const t = await api('/tasks?status=active')
    if (t) setTasks(t)
  }

  const loadGraph = async () => {
    const g = await api('/graph')
    if (g) setGraphNodes(g.nodes || [])
  }

  const handleEnable = async () => {
    setLoading(p => ({ ...p, enable: true }))
    const r = await api('/llama/enable', { method: 'POST' })
    if (r) { setLlamaEnabled(true); setStatus(p => ({ ...p, llama_enabled: true, llama_connected: r.connected })) }
    setLoading(p => ({ ...p, enable: false }))
  }

  const handlePrioritize = async () => {
    setLoading(p => ({ ...p, prioritize: true }))
    const r = await api('/llama/prioritize', { method: 'POST' })
    if (r) setPrioritized(r.tasks || [])
    setLoading(p => ({ ...p, prioritize: false }))
  }

  const handleDaily = async () => {
    setLoading(p => ({ ...p, daily: true }))
    const r = await api('/daily')
    if (r) setDaily(r.report || '')
    setLoading(p => ({ ...p, daily: false }))
  }

  const handleWeekly = async () => {
    setLoading(p => ({ ...p, weekly: true }))
    const r = await api('/weekly')
    if (r) setWeekly(r.report || '')
    setLoading(p => ({ ...p, weekly: false }))
  }

  const handleScan = async () => {
    setLoading(p => ({ ...p, scan: true }))
    const r = await api('/scan')
    if (r) setScanData(r)
    setLoading(p => ({ ...p, scan: false }))
  }

  const handleAsk = async () => {
    if (!prompt.trim()) return
    setAskError('')
    setAiResponse('')
    setLoading(p => ({ ...p, ask: true }))
    setAskTimer(0)
    const start = Date.now()
    timerRef.current = setInterval(() => setAskTimer(Math.round((Date.now() - start) / 1000)), 1000)
    abortRef.current = new AbortController()
    try {
      const gc = await api('/code/graph-context')
      const memoryCtx = gc ? 'My Memory about user:\n' + Object.entries(gc).filter(([k]) => !['total_nodes', 'total_edges', 'vector_memories'].includes(k)).map(([type, items]) => `- ${type}: ${items.join(', ')}`).join('\n') : ''
      const vc = await api(`/memory/context?q=${encodeURIComponent(prompt)}`)
      const fullMemCtx = [memoryCtx, vc?.context].filter(Boolean).join('\n\n')
      const res = await fetch(`${API}/llama/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: fullMemCtx }),
        signal: abortRef.current.signal
      })
      const r = await res.json()
      if (r) {
        let reply = r.response || 'No response'
        if (r.memories?.length) reply += `\n\n🧠 ${r.memories.length} thing${r.memories.length > 1 ? 's' : ''} auto-saved to memory`
        setAiResponse(reply)

        const userMsg = { role: 'user', content: prompt, timestamp: new Date().toISOString() }
        const aiMsg = { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
        const updated = [...chatHistory, userMsg, aiMsg]
        setChatHistory(updated)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {}
        saveMessagesToCloud([userMsg, aiMsg])
      }
      setAskError('')
    } catch (err) {
      if (err.name === 'AbortError') {
        setAskError('⏱️ Request timed out. Try a simpler question.')
      } else {
        setAskError('⚠️ AI not responding. Check if Ollama/Groq is running.')
      }
    }
    clearInterval(timerRef.current)
    setLoading(p => ({ ...p, ask: false }))
    setAskTimer(0)
  }

  const handleHistoryClear = async () => {
    const sid = getSessionId()
    setChatHistory([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    await api('/chat/clear', { method: 'POST', body: JSON.stringify({ session_id: sid }) })
  }

  const handleAddWeakness = async () => {
    if (!weakness.trim()) return
    await api('/graph/weakness', {
      method: 'POST',
      body: JSON.stringify({ label: weakness })
    })
    setWeakness('')
    loadGraph()
  }

  const handleAddMistake = async () => {
    if (!mistake.trim()) return
    await api('/graph/mistake', {
      method: 'POST',
      body: JSON.stringify({ label: mistake })
    })
    setMistake('')
    loadGraph()
  }

  const nodesByType = (type) => graphNodes.filter(n => n.type === type)

  const modelDisplay = status.cloud_memory ? (status.groq_available ? (status.llama_connected ? 'Ollama (AI Agent) / Groq (fallback)' : 'Groq (cloud AI)') : 'Ollama') : 'Ollama'
  const activeMode = status.actual_mode || status.llama_mode || 'ollama'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>AI Agent</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Powered by {activeMode === 'groq' ? 'Groq Llama 70B' : 'Ollama'}</p>
        </div>
      </div>

      {status.groq_available && (
        <div className="rounded-xl p-3 text-[10px] leading-relaxed" style={{ background: '#3b82f610', border: '1px solid #3b82f630', color: 'var(--muted)' }}>
          <strong style={{ color: '#3b82f6' }}>Groq Cloud AI</strong> — Free tier: 30 req/min, 6000 req/day. Lambi chat kar sakte ho,
          bas agar limit exceed ho to 1 minute wait karo. Jab laptop on hai to Ollama use hota hai, off hai to Groq apne aap.
        </div>
      )}

      {/* Status */}
      <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>AI Status</h3>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${llamaEnabled ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
            {status.cloud_memory ? 'Cloud ☁️' : (llamaEnabled ? 'Connected' : 'Disconnected')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]" style={{ color: 'var(--muted)' }}>
          <span>AI mode: <strong style={{ color: 'var(--fg)' }}>{activeMode === 'groq' ? 'Groq 70B' : 'Ollama'}</strong></span>
          <span>Memory: <strong style={{ color: 'var(--fg)' }}>{status.cloud_memory ? 'Supabase ☁️' : 'Local'}</strong></span>
          <span>Fallback: <strong style={{ color: status.groq_available ? '#22c55e' : 'var(--muted)' }}>{status.groq_available ? 'Groq ready' : 'none'}</strong></span>
        </div>
        {!llamaEnabled && (
          <button onClick={handleEnable} disabled={loading.enable}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
            style={{ background: loading.enable ? 'var(--input-bg)' : 'var(--accent)', color: loading.enable ? 'var(--muted)' : '#fff' }}>
            {loading.enable ? 'Enabling...' : 'Enable AI'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Prioritize */}
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Prioritize Tasks</h3>
            <button onClick={handlePrioritize} disabled={loading.prioritize}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {loading.prioritize ? '...' : 'Run'}
            </button>
          </div>
          {prioritized.length > 0 ? (
            <div className="space-y-2">
              {prioritized.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white" style={{ background: i === 0 ? '#22c55e' : i === 1 ? '#3b82f6' : i === 2 ? '#f59e0b' : 'var(--muted)' }}>{i + 1}</span>
                  <span className="text-xs flex-1" style={{ color: 'var(--fg)' }}>{t.title}</span>
                  <span className="text-[9px]" style={{ color: 'var(--muted)' }}>P:{t.priority}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Click 'Run' to AI-prioritize your active tasks</p>
          )}
        </div>

        {/* Daily Brief */}
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Daily Brief</h3>
            <button onClick={handleDaily} disabled={loading.daily}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {loading.daily ? '...' : 'Generate'}
            </button>
          </div>
          {daily ? (
            <pre className="text-[10px] whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto" style={{ color: 'var(--muted)' }}>{daily}</pre>
          ) : (
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Generate your daily brief with planned tasks</p>
          )}
        </div>

        {/* Weekly Report */}
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Weekly Report</h3>
            <button onClick={handleWeekly} disabled={loading.weekly}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {loading.weekly ? '...' : 'Generate'}
            </button>
          </div>
          {weekly ? (
            <pre className="text-[10px] whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto" style={{ color: 'var(--muted)' }}>{weekly}</pre>
          ) : (
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Weekly estimation error & bias report</p>
          )}
        </div>

        {/* Backlog Scan */}
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Backlog Guardian</h3>
            <button onClick={handleScan} disabled={loading.scan}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {loading.scan ? '...' : 'Scan'}
            </button>
          </div>
          {scanData ? (
            <div className="space-y-2">
              <div className="flex gap-3 text-xs">
                <span style={{ color: 'var(--muted)' }}>Aging: <strong style={{ color: scanData.total_aging_tasks > 0 ? '#f59e0b' : '#22c55e' }}>{scanData.total_aging_tasks}</strong></span>
                <span style={{ color: 'var(--muted)' }}>Traps: <strong style={{ color: scanData.backlog_traps > 0 ? '#ef4444' : '#22c55e' }}>{scanData.backlog_traps}</strong></span>
              </div>
              {scanData.traps?.map((tr, i) => (
                <div key={i} className="px-3 py-2 rounded-lg text-[10px]" style={{ background: '#ef444410', color: '#ef4444', border: '1px solid #ef444430' }}>
                  {tr.message}
                </div>
              ))}
              {scanData.warnings?.slice(0, 3).map((w, i) => (
                <div key={i} className="flex justify-between text-[10px] px-3 py-1.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <span style={{ color: 'var(--fg)' }}>{w.title}</span>
                  <span style={{ color: w.severity === 'HIGH' ? '#ef4444' : '#f59e0b' }}>{w.days_unresolved}d</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Scan for backlog traps and aging tasks</p>
          )}
        </div>
      </div>

      {/* Ask AI */}
      <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Ask AI</h3>
          <div className="flex gap-2">
            {chatHistory.length > 0 && (
              <button onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                style={{ background: showHistory ? 'var(--accent)' : 'var(--input-bg)', color: showHistory ? '#fff' : 'var(--muted)' }}>
                {showHistory ? 'Close' : `History (${chatHistory.length})`}
              </button>
            )}
            {chatHistory.length > 0 && (
              <button onClick={handleHistoryClear}
                className="px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                style={{ background: '#ef444415', color: '#ef4444' }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {showHistory && (
          <div className="mb-4 max-h-80 overflow-y-auto space-y-2 p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}>
            {chatHistory.length === 0 ? (
              <p className="text-[10px]" style={{ color: 'var(--muted)' }}>No history yet</p>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`px-3 py-2 rounded-lg text-[10px] leading-relaxed ${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}
                  style={{ background: msg.role === 'user' ? '#3b82f610' : 'var(--card)', border: '1px solid var(--border)' }}>
                  <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: msg.role === 'user' ? '#3b82f6' : '#22c55e' }}>
                    {msg.role === 'user' ? 'You' : 'AI'}
                  </span>
                  <p className="mt-1 whitespace-pre-wrap" style={{ color: 'var(--fg)' }}>{msg.content}</p>
                </div>
              ))
            )}
            <div ref={historyEndRef} />
          </div>
        )}

        <div className="flex gap-2">
          <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ask anything about your studies..."
            className="flex-1 px-4 py-2.5 rounded-xl text-xs outline-none"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
            onKeyDown={e => e.key === 'Enter' && handleAsk()} />
          <button onClick={handleAsk} disabled={loading.ask || !prompt.trim()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 flex items-center gap-2"
            style={{ background: loading.ask ? 'var(--input-bg)' : 'var(--accent)' }}>
            {loading.ask ? (
              <><span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />{askTimer}s</>
            ) : 'Ask'}
          </button>
        </div>
        {loading.ask && (
          <div className="mt-3 px-4 py-3 rounded-xl text-[10px]" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>
            {activeMode === 'groq' ? 'Using Groq 70B (cloud)' : 'Using Ollama (local)'}... {askTimer > 10 && '(may take time for complex questions)'}
          </div>
        )}
        {askError && (
          <div className="mt-3 px-4 py-3 rounded-xl text-xs" style={{ background: '#ef444410', color: '#ef4444', border: '1px solid #ef444430' }}>
            {askError}
          </div>
        )}
        {aiResponse && (
          <div className="mt-3 px-4 py-3 rounded-xl text-xs leading-relaxed" style={{ background: 'var(--input-bg)', color: 'var(--fg)' }}>
            {aiResponse}
          </div>
        )}
      </div>

      {/* Knowledge Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--fg)' }}>Weaknesses</h3>
          <div className="flex gap-2 mb-3">
            <input value={weakness} onChange={e => setWeakness(e.target.value)} placeholder="Add weakness..."
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
              onKeyDown={e => e.key === 'Enter' && handleAddWeakness()} />
            <button onClick={handleAddWeakness} className="px-3 py-2 rounded-lg text-[10px] font-bold text-white" style={{ background: 'var(--accent)' }}>+</button>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {nodesByType('weakness').map(n => (
              <div key={n.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px]" style={{ background: '#f59e0b10', border: '1px solid #f59e0b20' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
                <span style={{ color: 'var(--fg)' }}>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--fg)' }}>Mistakes</h3>
          <div className="flex gap-2 mb-3">
            <input value={mistake} onChange={e => setMistake(e.target.value)} placeholder="Add mistake..."
              className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
              onKeyDown={e => e.key === 'Enter' && handleAddMistake()} />
            <button onClick={handleAddMistake} className="px-3 py-2 rounded-lg text-[10px] font-bold text-white" style={{ background: 'var(--accent)' }}>+</button>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {nodesByType('mistake').map(n => (
              <div key={n.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px]" style={{ background: '#ef444410', border: '1px solid #ef444420' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
                <span style={{ color: 'var(--fg)' }}>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--fg)' }}>Knowledge Graph</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...new Set(graphNodes.map(n => n.type))].slice(0, 8).map((type, i) => {
              const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']
              const count = nodesByType(type).length
              return (
              <div key={type} className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
                <p className="text-lg font-bold" style={{ color: colors[i % colors.length] }}>{count}</p>
                <p className="text-[9px] mt-0.5 capitalize" style={{ color: 'var(--muted)' }}>{type.replace('_', ' ')}</p>
              </div>)
          })}
        </div>
      </div>
    </div>
  )
}
