import { useState, useEffect } from 'react'

export default function Users() {
  const [users, setUsers] = useState([])
  const [newName, setNewName] = useState('')
  const [newPass, setNewPass] = useState('')
  const [msg, setMsg] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const api = async (url, opts = {}) => {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...opts
      })
      if (res.status === 403) { setIsAdmin(false); return null }
      return await res.json()
    } catch { return null }
  }

  const load = async () => {
    const d = await api('/api/auth/users')
    if (d && Array.isArray(d)) { setUsers(d); setIsAdmin(true) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!newName.trim() || !newPass.trim()) return
    setMsg('')
    const r = await api('/api/auth/adduser', {
      method: 'POST',
      body: JSON.stringify({ username: newName.trim(), password: newPass.trim() })
    })
    if (r?.ok) {
      setMsg(`✅ "${newName}" added!`)
      setNewName(''); setNewPass('')
      load()
    } else {
      setMsg(`❌ ${r?.error || 'failed'}`)
    }
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Only admin can manage users.</p>
        <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Login with admin password to add/manage users.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Manage Users</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Add friends with their own passwords</p>
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--fg)' }}>Add New User</h3>
        <div className="flex gap-2 mb-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Username (e.g. friend1)"
            className="flex-1 px-4 py-2.5 rounded-xl text-xs outline-none"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
          <input value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Password"
            className="flex-1 px-4 py-2.5 rounded-xl text-xs outline-none"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <button onClick={handleAdd}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
            style={{ background: 'var(--accent)' }}>Add</button>
        </div>
        {msg && <p className="text-xs" style={{ color: msg.startsWith('✅') ? '#22c55e' : '#ef4444' }}>{msg}</p>}
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--fg)' }}>Users ({users.length})</h3>
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.username} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--fg)' }}>{u.username}</span>
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</span>
            </div>
          ))}
          {users.length === 0 && <p className="text-xs" style={{ color: 'var(--muted)' }}>No users yet</p>}
        </div>
      </div>
    </div>
  )
}
