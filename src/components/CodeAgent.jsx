import { useState, useEffect, useRef } from 'react'
import { parseAndExecuteCodeActions, stripActions, CODE_SYSTEM_PROMPT } from '../utils/actionParser'

const API = '/api'
const MSG_KEY = 'ca_messages'

export default function CodeAgent() {
  const [files, setFiles] = useState([])
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(MSG_KEY)) || [] } catch { return [] }
  })
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [fileTreeOpen, setFileTreeOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [graphData, setGraphData] = useState(null)
  const [memoryInput, setMemoryInput] = useState('')
  const [memoryType, setMemoryType] = useState('note')
  const chatEnd = useRef(null)

  useEffect(() => { localStorage.setItem(MSG_KEY, JSON.stringify(messages)) }, [messages])

  useEffect(() => { loadFiles(); loadGraph() }, [])

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const api = async (url, opts = {}) => {
    try {
      const res = await fetch(`${API}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...opts
      })
      return await res.json()
    } catch { return null }
  }

  const loadFiles = async () => {
    const f = await api('/code/tree')
    if (f) setFiles(f)
  }

  const loadGraph = async () => {
    const g = await api('/code/graph-context')
    if (g) setGraphData(g)
  }

  const addMemory = async () => {
    if (!memoryInput.trim()) return
    await api('/graph/add', {
      method: 'POST',
      body: JSON.stringify({ type: memoryType, label: memoryInput.trim() })
    })
    setMemoryInput('')
    loadGraph()
    setMessages(prev => [...prev, { role: 'system', text: `✅ Added "${memoryInput.trim()}" as ${memoryType}` }])
  }

  const readFile = async (path) => {
    setSelectedFile(path)
    setFileContent('')
    const r = await api('/code/read', { method: 'POST', body: JSON.stringify({ path }) })
    if (r?.content) {
      setFileContent(r.content)
      setMessages(prev => [...prev, { role: 'assistant', text: `📄 **${path}**\n\`\`\`\n${r.content.slice(0, 1500)}${r.content.length > 1500 ? '\n... (truncated)' : ''}\n\`\`\`` }])
    }
  }

  const handleSend = async () => {
    if (!prompt.trim() || loading) return
    const userMsg = { role: 'user', text: prompt }
    setMessages(prev => [...prev, userMsg])
    setPrompt('')
    setLoading(true)
    setTimer(0)

    const start = Date.now()
    const interval = setInterval(() => setTimer(Math.round((Date.now() - start) / 1000)), 1000)

    const graphCtx = graphData ? 'My Memory about user:\n' + Object.entries(graphData).filter(([k]) => !['total_nodes', 'total_edges', 'vector_memories'].includes(k)).map(([type, items]) => `- ${type}: ${items.join(', ')}`).join('\n') : ''
    const vctx = await api(`/memory/context?q=${encodeURIComponent(prompt)}`)
    const fullCtx = [graphCtx, vctx?.context].filter(Boolean).join('\n\n')
    const ctx = `Project files:\n${files.join('\n')}\n${fullCtx}`
    const r = await api('/llama/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt: prompt, system: CODE_SYSTEM_PROMPT, context: ctx })
    })

    clearInterval(interval)
    setLoading(false)
    setTimer(0)

    if (r?.response) {
      let reply = r.response
      const codeActions = await parseAndExecuteCodeActions(reply)
      const cleanReply = stripActions(reply)
      let display = cleanReply

      const readResults = codeActions.filter(a => a.type === 'read')
      const otherResults = codeActions.filter(a => a.type !== 'read')

      if (readResults.length) {
        const fileBlocks = readResults.map(a => {
          if (typeof a.result === 'object' && a.result.content) {
            return `📄 **${a.result.path}**\n\`\`\`\n${a.result.content.slice(0, 1500)}${a.result.content.length > 1500 ? '\n... (truncated)' : ''}\n\`\`\``
          }
          return typeof a.result === 'string' ? a.result : ''
        }).filter(Boolean).join('\n\n')
        if (fileBlocks) display += `\n\n${fileBlocks}`
      }
      if (otherResults.length) {
        display += `\n\n${otherResults.map(a => a.result).join('\n')}`
        loadFiles()
        loadGraph()
      }

      setMessages(prev => [...prev, { role: 'assistant', text: display }])
      if (r.memories?.length) {
        loadGraph()
        setMessages(prev => [...prev, { role: 'system', text: `🧠 ${r.memories.length} thing${r.memories.length > 1 ? 's' : ''} saved to memory` }])
      }
    } else {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Not able to reach Llama. Make sure Ollama is running.' }])
    }
  }

  return (
    <div className="flex flex-col" style={{ color: 'var(--fg)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Code Agent</h2>
        <div className="flex gap-2">
          <button onClick={() => setFileTreeOpen(!fileTreeOpen)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
            style={{ background: fileTreeOpen ? 'var(--accent)' : 'var(--input-bg)', color: fileTreeOpen ? '#fff' : 'var(--muted)' }}>
            {fileTreeOpen ? 'Hide Files' : 'Browse Files'}
          </button>
        </div>
      </div>

      <div className="flex gap-3" style={{ minHeight: '400px' }}>
        {fileTreeOpen && (
          <div className="w-56 flex flex-col rounded-xl shrink-0" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="p-2 text-[10px] font-bold" style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
              {files.length} files
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5" style={{ maxHeight: '350px' }}>
              {files.map(f => {
                const ext = f.split('.').pop()
                const colors = { jsx: '#61dafb', js: '#f7df1e', py: '#3572A5', css: '#563d7c', html: '#e34f26', json: '#292929', md: '#083fa1' }
                return (
                  <button key={f} onClick={() => readFile(f)}
                    className="w-full text-left px-2 py-1 rounded text-[10px] truncate hover:opacity-80"
                    style={{ background: selectedFile === f ? 'var(--accent)' : 'transparent', color: selectedFile === f ? '#fff' : 'var(--fg)' }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: colors[ext] || '#888' }} />
                    {f}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: '350px' }}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Kuch bhi pucho — code change, feature add, ya memory mein kuch save karna ho.<br />
                  Jaise: <button onClick={() => setPrompt('Dashboard mein ek naya section add karo')} className="underline" style={{ color: 'var(--accent)' }}>"Yeh wali file dikhao"</button>
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-xl text-xs leading-relaxed ${m.role === 'user' ? 'text-white' : ''}`}
                  style={{
                    background: m.role === 'user' ? 'var(--accent)' : m.role === 'system' ? 'var(--input-bg)' : 'var(--input-bg)',
                    color: m.role === 'user' ? '#fff' : 'var(--fg)',
                    border: m.role === 'system' ? '1px solid #22c55e40' : 'none'
                  }}>
                  <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-xl text-xs" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>
                  <span className="inline-block w-2 h-2 rounded-full bg-current animate-pulse mr-2" />
                  Thinking... {timer}s
                </div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>
          <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
            <input value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="Kya karna hai? Batao..."
              className="flex-1 px-4 py-2.5 rounded-xl text-xs outline-none"
              style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSend()} />
            <button onClick={handleSend} disabled={loading || !prompt.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 flex items-center gap-2"
              style={{ background: loading ? 'var(--input-bg)' : 'var(--accent)' }}>
              {loading ? `${timer}s` : 'Bhejo'}
            </button>
          </div>
        </div>
      </div>

      {/* Add to Memory */}
      <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--fg)' }}>Add to Memory</h3>
        <div className="flex gap-2">
          <select value={memoryType} onChange={e => setMemoryType(e.target.value)}
            className="px-2 py-2 rounded-lg text-[10px] outline-none"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
            <option value="note">Note</option>
            <option value="weakness">Weakness</option>
            <option value="mistake">Mistake</option>
            <option value="topic">Topic</option>
            <option value="research_idea">Idea</option>
            <option value="achievement">Achievement</option>
            <option value="goal">Goal</option>
            <option value="resource">Resource</option>
          </select>
          <input value={memoryInput} onChange={e => setMemoryInput(e.target.value)}
            placeholder="Kuch bhi likho jo yaad rakhna hai..."
            className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
            onKeyDown={e => e.key === 'Enter' && addMemory()} />
          <button onClick={addMemory} disabled={!memoryInput.trim()}
            className="px-4 py-2 rounded-lg text-[10px] font-bold text-white"
            style={{ background: 'var(--accent)' }}>Save</button>
        </div>
      </div>

      {/* Graph Summary */}
      {graphData && (
        <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold" style={{ color: 'var(--fg)' }}>Knowledge Graph (Memory)</h3>
            <span className="text-[9px]" style={{ color: 'var(--muted)' }}>{graphData.total_nodes} nodes · {graphData.total_edges} edges</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {graphData.vector_memories > 0 && (
              <div className="rounded-lg p-2" style={{ background: 'var(--input-bg)' }}>
                <p className="text-base font-bold" style={{ color: '#a78bfa' }}>{graphData.vector_memories}</p>
                <p className="text-[9px] capitalize" style={{ color: 'var(--muted)' }}>semantic memories</p>
              </div>
            )}
            {Object.entries(graphData).filter(([k]) => !['total_nodes', 'total_edges', 'vector_memories'].includes(k)).slice(0, 7).map(([type, items], i) => {
              const colors = ['#3b82f6', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']
              return (
                <div key={type} className="rounded-lg p-2" style={{ background: 'var(--input-bg)' }}>
                  <p className="text-base font-bold" style={{ color: colors[i % colors.length] }}>{(items || []).length}</p>
                  <p className="text-[9px] capitalize" style={{ color: 'var(--muted)' }}>{type.replace('_', ' ')}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
