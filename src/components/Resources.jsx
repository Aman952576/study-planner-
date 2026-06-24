import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'st_resources'

function loadResources() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024

export default function Resources() {
  const [resources, setResources] = useState(loadResources)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', link: '' })
  const [editingId, setEditingId] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(resources)) }, [resources])

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoError('Only images allowed')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setPhotoError('Image too large (max 2MB)')
      return
    }
    setPhotoError('')
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const clearPhoto = () => {
    setPhotoPreview(null)
    setPhotoFile(null)
    setPhotoError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const saved = resources
    const photo = photoPreview || ''
    if (editingId) {
      setResources(prev => prev.map(r => r.id === editingId ? { ...r, ...form, photo } : r))
    } else {
      setResources(prev => [...prev, { id: Date.now(), ...form, photo }])
    }
    setForm({ title: '', description: '', link: '' })
    setEditingId(null)
    setPhotoPreview(null)
    setPhotoFile(null)
    setPhotoError('')
    setShowForm(false)
  }

  const handleEdit = (res) => {
    setForm({ title: res.title, description: res.description, link: res.link })
    setEditingId(res.id)
    setPhotoPreview(res.photo || null)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setResources(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Resources</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Save your study links, photos, and notes</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: '', description: '', link: '' }); setPhotoPreview(null); setPhotoFile(null); setPhotoError('') }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--accent)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Resource
        </button>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm">No resources yet</p>
          <p className="text-xs mt-1">Click "Add Resource" to save your first link</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(res => (
            <div key={res.id} className="rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {res.photo && (
                <div className="w-full h-40 overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                  <img src={res.photo} alt={res.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold truncate" style={{ color: 'var(--fg)' }}>{res.title}</h3>
                {res.description && (
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--muted)' }}>{res.description}</p>
                )}
                {res.link && (
                  <a href={res.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: 'var(--accent)', color: '#fff' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Link
                  </a>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => handleEdit(res)}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
                    style={{ background: 'var(--input-bg)', color: 'var(--accent)' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(res.id)}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
                    style={{ background: '#ef444415', color: '#ef4444' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => { setShowForm(false); setEditingId(null); setPhotoPreview(null); setPhotoFile(null); setPhotoError('') }}>
          <div className="rounded-xl p-5 max-w-md w-full space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>{editingId ? 'Edit Resource' : 'Add Resource'}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); setPhotoPreview(null); setPhotoFile(null); setPhotoError('') }} className="text-xs" style={{ color: 'var(--muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Resource title" required
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..."
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none h-16"
                  style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Link URL</label>
                <input type="url" value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://example.com"
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Photo</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: 'var(--input-bg)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                    {photoPreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {photoPreview && (
                    <button type="button" onClick={clearPhoto} className="text-[10px]" style={{ color: '#ef4444' }}>Remove</button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                {photoError && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{photoError}</p>}
                {photoPreview && (
                  <div className="mt-2 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <img src={photoPreview} alt="Preview" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setPhotoPreview(null); setPhotoFile(null); setPhotoError('') }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--accent)' }}>
                  {editingId ? 'Save Changes' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
