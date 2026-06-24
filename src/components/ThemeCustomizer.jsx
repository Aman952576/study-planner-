import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeCustomizer({ onClose }) {
  const { mode, preset, radius, blur, fontScale, custom, modes, PRESETS, changeMode, changePreset, changeRadius, changeBlur, changeFont, changeCustom } = useTheme()
  const [tab, setTab] = useState('presets')
  const [customAccent, setCustomAccent] = useState(custom.accent || '')
  const [customHover, setCustomHover] = useState(custom.accentHover || '')

  const applyCustom = () => {
    if (customAccent) changeCustom({ accent: customAccent, accentHover: customHover || customAccent })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-fade-up"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Theme Studio</h2>
          <button onClick={onClose} className="text-sm hover:scale-110 transition" style={{ color: 'var(--muted)' }}>✕</button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-4 gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {[
            { id: 'presets', label: 'Presets' },
            { id: 'custom', label: 'Custom' },
            { id: 'display', label: 'Display' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-3 py-2 text-xs font-semibold rounded-t-lg transition-all"
              style={{
                color: tab === t.id ? 'var(--accent)' : 'var(--muted)',
                borderBottom: tab === t.id ? `2px solid var(--accent)` : '2px solid transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
          {tab === 'presets' && (
            <>
              {/* Mode */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>DISPLAY MODE</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {modes.map(m => (
                    <button key={m} onClick={() => changeMode(m)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all text-[10px] capitalize"
                      style={{
                        background: mode === m ? 'var(--accent)' : 'var(--input-bg)',
                        color: mode === m ? '#fff' : 'var(--muted)',
                        border: mode === m ? 'none' : '1px solid var(--border)',
                      }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[12px]">
                        {m === 'light' ? '☀️' : m === 'dark' ? '🌙' : m === 'dim' ? '🌓' : m === 'sepia' ? '📜'
                          : m === 'ocean' ? '🌊' : m === 'dracula' ? '🧛' : m === 'nord' ? '❄️'
                          : m === 'tokyo' ? '🌃' : m === 'catppuccin' ? '🫶' : m === 'gruvbox' ? '🎸'
                          : m === 'monokai' ? '🎨' : m === 'rosepine' ? '🌹' : m === 'moonlight' ? '🌙'
                          : m === 'solarized' ? '🔬' : '🎯'}
                      </span>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset themes */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>COLOR PRESETS</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {Object.entries(PRESETS).map(([k, v]) => (
                    <button key={k} onClick={() => changePreset(k)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all text-[10px] capitalize"
                      style={{
                        background: preset === k ? v.accent + '22' : 'var(--input-bg)',
                        color: preset === k ? v.accent : 'var(--muted)',
                        border: preset === k ? `1px solid ${v.accent}` : '1px solid var(--border)',
                      }}>
                      <span className="w-5 h-5 rounded-full" style={{ background: v.accent }} />
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'custom' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>CUSTOM ACCENT COLORS</p>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Accent Color</label>
                <div className="flex gap-2">
                  <input type="color" value={customAccent || PRESETS[preset].accent} onChange={e => setCustomAccent(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none" />
                  <input type="text" value={customAccent} onChange={e => setCustomAccent(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} placeholder="#7c5cbf" />
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Hover Color</label>
                <div className="flex gap-2">
                  <input type="color" value={customHover || PRESETS[preset].accentHover} onChange={e => setCustomHover(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none" />
                  <input type="text" value={customHover} onChange={e => setCustomHover(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }} placeholder="#6a4dab" />
                </div>
              </div>
              <button onClick={applyCustom}
                className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'var(--accent)' }}>
                Apply Custom Colors
              </button>
            </div>
          )}

          {tab === 'display' && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold mb-2 flex justify-between" style={{ color: 'var(--muted)' }}>
                  <span>Border Radius</span>
                  <span>{radius}px</span>
                </p>
                <input type="range" min="0" max="24" value={radius} onChange={e => changeRadius(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent)]" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 flex justify-between" style={{ color: 'var(--muted)' }}>
                  <span>Blur Intensity</span>
                  <span>{blur}px</span>
                </p>
                <input type="range" min="0" max="40" value={blur} onChange={e => changeBlur(parseInt(e.target.value))}
                  className="w-full accent-[var(--accent)]" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-2 flex justify-between" style={{ color: 'var(--muted)' }}>
                  <span>Font Size</span>
                  <span>{Math.round(fontScale * 100)}%</span>
                </p>
                <input type="range" min="0.8" max="1.3" step="0.05" value={fontScale} onChange={e => changeFont(parseFloat(e.target.value))}
                  className="w-full accent-[var(--accent)]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
