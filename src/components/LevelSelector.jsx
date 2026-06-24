import { useState } from 'react'
import { useLevelContext } from '../context/LevelContext'

export default function LevelSelector({ topic, onClose, onLevelSelect }) {
  const { createLevel, assignLevelToTopic, getAllLevels, getTopicLevels } = useLevelContext()
  const [newLevelName, setNewLevelName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const allLevels = getAllLevels()
  const selectedLevels = getTopicLevels(topic)
  const selectedLevelIds = selectedLevels.map(l => l.id)

  const handleCreateLevel = () => {
    if (!newLevelName.trim()) return
    const level = createLevel(newLevelName.trim())
    assignLevelToTopic(topic, level.id)
    setNewLevelName('')
    setIsCreating(false)
    onLevelSelect(level)
  }

  const handleSelectLevel = (levelId) => {
    const level = allLevels.find(l => l.id === levelId)
    if (level) {
      assignLevelToTopic(topic, levelId)
      onLevelSelect(level)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>Manage Levels for "{topic}"</h3>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:scale-110 transition-all" style={{ background: 'var(--input-bg)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--muted)" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Existing Levels */}
          <div className="space-y-2">
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>SELECT EXISTING LEVEL</p>
            {allLevels.length === 0 ? (
              <p className="text-xs py-3 text-center" style={{ color: 'var(--muted)' }}>No levels created yet</p>
            ) : (
              <div className="space-y-2">
                {allLevels.map(level => (
                  <label key={level.id} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.01]" style={{ background: 'var(--input-bg)' }}>
                    <input
                      type="checkbox"
                      checked={selectedLevelIds.includes(level.id)}
                      onChange={() => handleSelectLevel(level.id)}
                      style={{ accentColor: 'var(--accent)' }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-xs flex-1" style={{ color: 'var(--fg)' }}>{level.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          {allLevels.length > 0 && <div style={{ height: '1px', background: 'var(--border)' }} />}

          {/* Create New Level */}
          <div className="space-y-2">
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>CREATE NEW LEVEL</p>
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg transition-all hover:scale-[1.02]"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                + Add New Level
              </button>
            ) : (
              <div className="space-y-2 p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <input
                  type="text"
                  placeholder="Enter level name (e.g., Revision, Practice, Mock)..."
                  value={newLevelName}
                  onChange={e => setNewLevelName(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 text-xs rounded outline-none"
                  style={{ background: 'var(--bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
                  onKeyDown={e => e.key === 'Enter' && handleCreateLevel()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateLevel}
                    className="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all hover:scale-[1.02]"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setIsCreating(false); setNewLevelName('') }}
                    className="flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all hover:scale-[1.02]"
                    style={{ background: 'var(--input-bg)', color: 'var(--fg)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg transition-all hover:scale-105"
            style={{ background: 'var(--input-bg)', color: 'var(--fg)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
