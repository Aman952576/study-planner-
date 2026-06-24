import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const MODES = {
  light: {
    bg: '#f8f6f3', fg: '#1a1a2e', card: '#ffffff', cardHover: '#f0eeeb',
    border: '#e2ddd5', muted: '#8a8a9e', accent: '#7c5cbf', accentHover: '#6a4dab',
    glow: 'rgba(124,92,191,0.15)', header: '#ffffff', sidebar: '#ffffff',
    inputBg: '#f0eeeb', shadow: 'rgba(0,0,0,0.06)',
  },
  dark: {
    bg: '#0d0d1a', fg: '#e8e8ed', card: '#1a1a2e', cardHover: '#222238',
    border: '#2a2a40', muted: '#6b6b80',     accent: '#9b7bdf', accentHover: '#b08ee8',
    glow: 'rgba(155,123,223,0.2)', header: '#12121f', sidebar: '#12121f',
    inputBg: '#222238', shadow: 'rgba(0,0,0,0.3)',
  },
  dim: {
    bg: '#1a1a2e', fg: '#c8c8d0', card: '#24243e', cardHover: '#2e2e4a',
    border: '#3a3a55', muted: '#7a7a90', accent: '#7c5cbf', accentHover: '#9b7bdf',
    glow: 'rgba(124,92,191,0.15)', header: '#1e1e35', sidebar: '#1e1e35',
    inputBg: '#2e2e4a', shadow: 'rgba(0,0,0,0.25)',
  },
  sepia: {
    bg: '#f5ecd7', fg: '#3d3228', card: '#faf3e3', cardHover: '#f0e8d5',
    border: '#d9cdb5', muted: '#8a7a66', accent: '#b8860b', accentHover: '#d4a017',
    glow: 'rgba(184,134,11,0.15)', header: '#f5ecd7', sidebar: '#faf3e3',
    inputBg: '#f0e8d5', shadow: 'rgba(61,50,40,0.08)',
  },
  ocean: {
    bg: '#0a1628', fg: '#d0dce8', card: '#112240', cardHover: '#1a2d4a',
    border: '#1a3a5a', muted: '#5a7a9a', accent: '#64b5f6', accentHover: '#82c4f8',
    glow: 'rgba(100,181,246,0.2)', header: '#0d1f3a', sidebar: '#0d1f3a',
    inputBg: '#1a2d4a', shadow: 'rgba(0,0,0,0.3)',
  },
  dracula: {
    bg: '#1e1e2e', fg: '#e0def4', card: '#282840', cardHover: '#2f2f4a',
    border: '#3b3b5a', muted: '#78789e', accent: '#bd93f9', accentHover: '#d0acfe',
    glow: 'rgba(189,147,249,0.2)', header: '#1a1a2e', sidebar: '#1a1a2e',
    inputBg: '#2f2f4a', shadow: 'rgba(0,0,0,0.35)',
  },
  nord: {
    bg: '#2e3440', fg: '#d8dee9', card: '#3b4252', cardHover: '#434c5e',
    border: '#4c566a', muted: '#7b88a1', accent: '#88c0d0', accentHover: '#a3d6e0',
    glow: 'rgba(136,192,208,0.2)', header: '#2a303e', sidebar: '#2a303e',
    inputBg: '#434c5e', shadow: 'rgba(0,0,0,0.3)',
  },
  tokyo: {
    bg: '#0f0f1a', fg: '#c0caf5', card: '#1a1b2e', cardHover: '#232540',
    border: '#2f3450', muted: '#6a7099', accent: '#7aa2f7', accentHover: '#9ab8fa',
    glow: 'rgba(122,162,247,0.2)', header: '#0d0d1a', sidebar: '#0d0d1a',
    inputBg: '#232540', shadow: 'rgba(0,0,0,0.35)',
  },
  catppuccin: {
    bg: '#1e1e2e', fg: '#cdd6f4', card: '#2a2a3c', cardHover: '#333348',
    border: '#3f3f58', muted: '#7a7a9e', accent: '#cba6f7', accentHover: '#dbb8ff',
    glow: 'rgba(203,166,247,0.2)', header: '#1a1a2e', sidebar: '#1a1a2e',
    inputBg: '#333348', shadow: 'rgba(0,0,0,0.3)',
  },
  gruvbox: {
    bg: '#282828', fg: '#ebdbb2', card: '#3c3836', cardHover: '#45403d',
    border: '#504945', muted: '#928374', accent: '#d79921', accentHover: '#e5b93a',
    glow: 'rgba(215,153,33,0.2)', header: '#24211c', sidebar: '#24211c',
    inputBg: '#45403d', shadow: 'rgba(0,0,0,0.35)',
  },
  monokai: {
    bg: '#1a1a1a', fg: '#e8e8d3', card: '#2a2a2a', cardHover: '#353535',
    border: '#444444', muted: '#7a7a7a', accent: '#a6e22e', accentHover: '#bef55a',
    glow: 'rgba(166,226,46,0.2)', header: '#151515', sidebar: '#151515',
    inputBg: '#353535', shadow: 'rgba(0,0,0,0.35)',
  },
  rosepine: {
    bg: '#191724', fg: '#e0def4', card: '#26233a', cardHover: '#2e2a44',
    border: '#3b3555', muted: '#7a739e', accent: '#eb6f92', accentHover: '#f28aa8',
    glow: 'rgba(235,111,146,0.2)', header: '#15131e', sidebar: '#15131e',
    inputBg: '#2e2a44', shadow: 'rgba(0,0,0,0.3)',
  },
  moonlight: {
    bg: '#0b0f1c', fg: '#c8d0e0', card: '#151b2e', cardHover: '#1d2540',
    border: '#2a3355', muted: '#5a6a8e', accent: '#82aaff', accentHover: '#a0c0ff',
    glow: 'rgba(130,170,255,0.2)', header: '#0a0e1a', sidebar: '#0a0e1a',
    inputBg: '#1d2540', shadow: 'rgba(0,0,0,0.35)',
  },
  solarized: {
    bg: '#002b36', fg: '#839496', card: '#073642', cardHover: '#0a4452',
    border: '#1b5a68', muted: '#58747e', accent: '#2aa198', accentHover: '#3cb5aa',
    glow: 'rgba(42,161,152,0.2)', header: '#00222b', sidebar: '#00222b',
    inputBg: '#0a4452', shadow: 'rgba(0,0,0,0.35)',
  },
}

const PRESETS = {
  default: { name: 'Default', accent: '#7c5cbf', accentHover: '#6a4dab' },
  emerald: { name: 'Emerald', accent: '#2dd4a0', accentHover: '#3be0ae' },
  ruby: { name: 'Ruby', accent: '#e0436a', accentHover: '#f05078' },
  amber: { name: 'Amber', accent: '#f59e0b', accentHover: '#fbbf24' },
  sky: { name: 'Sky', accent: '#38bdf8', accentHover: '#56c8fa' },
  midnight: { name: 'Midnight', accent: '#818cf8', accentHover: '#939bf9' },
  forest: { name: 'Forest', accent: '#34d399', accentHover: '#4ade80' },
  sunset: { name: 'Sunset', accent: '#fb923c', accentHover: '#fbbf24' },
  aurora: { name: 'Aurora', accent: '#a78bfa', accentHover: '#b99cfa' },
  monochrome: { name: 'Monochrome', accent: '#888888', accentHover: '#aaaaaa' },
  ocean: { name: 'Ocean', accent: '#0ea5e9', accentHover: '#24b4f2' },
  rose: { name: 'Rose', accent: '#fb7185', accentHover: '#fc8ba0' },
  lime: { name: 'Lime', accent: '#a3e635', accentHover: '#b8f04a' },
  violet: { name: 'Violet', accent: '#a78bfa', accentHover: '#b9a0fc' },
  teal: { name: 'Teal', accent: '#14b8a6', accentHover: '#2ad0bc' },
  indigo: { name: 'Indigo', accent: '#6366f1', accentHover: '#7c7ff3' },
  pink: { name: 'Pink', accent: '#ec4899', accentHover: '#f062a8' },
  cyan: { name: 'Cyan', accent: '#06b6d4', accentHover: '#22cce8' },
  crimson: { name: 'Crimson', accent: '#dc2626', accentHover: '#e84343' },
  gold: { name: 'Gold', accent: '#eab308', accentHover: '#f5c820' },
  jade: { name: 'Jade', accent: '#10b981', accentHover: '#2ccf97' },
  coral: { name: 'Coral', accent: '#f97371', accentHover: '#fa8f8d' },
  lavender: { name: 'Lavender', accent: '#c084fc', accentHover: '#cf9bff' },
  peach: { name: 'Peach', accent: '#fdba74', accentHover: '#fec88a' },
  mint: { name: 'Mint', accent: '#6ee7b7', accentHover: '#86edc5' },
  steel: { name: 'Steel', accent: '#64748b', accentHover: '#7c8aa0' },
  cherry: { name: 'Cherry', accent: '#e11d48', accentHover: '#ec2e56' },
  tangerine: { name: 'Tangerine', accent: '#f97316', accentHover: '#fa882e' },
  plum: { name: 'Plum', accent: '#d946ef', accentHover: '#e05cf2' },
  sage: { name: 'Sage', accent: '#86b49c', accentHover: '#9cc4ae' },
  bronze: { name: 'Bronze', accent: '#b4733f', accentHover: '#c8854e' },
  sapphire: { name: 'Sapphire', accent: '#3b82f6', accentHover: '#5794f7' },
  maple: { name: 'Maple', accent: '#c2410c', accentHover: '#d64d16' },
  wine: { name: 'Wine', accent: '#9b1b30', accentHover: '#b2233a' },
  nebula: { name: 'Nebula', accent: '#8b5cf6', accentHover: '#a070f8' },
  chocolate: { name: 'Chocolate', accent: '#a0522d', accentHover: '#b8653e' },
  flame: { name: 'Flame', accent: '#ef4444', accentHover: '#f15959' },
  glacier: { name: 'Glacier', accent: '#7dd3fc', accentHover: '#96ddfa' },
  hazel: { name: 'Hazel', accent: '#84cc16', accentHover: '#99da30' },
  iris: { name: 'Iris', accent: '#6d28d9', accentHover: '#8235ec' },
  moss: { name: 'Moss', accent: '#4d7c0f', accentHover: '#5d9414' },
  orchid: { name: 'Orchid', accent: '#e879f9', accentHover: '#ed93fa' },
  rust: { name: 'Rust', accent: '#b45309', accentHover: '#ca6210' },
  tulip: { name: 'Tulip', accent: '#f43f5e', accentHover: '#f85a74' },
  umber: { name: 'Umber', accent: '#78350f', accentHover: '#8f4414' },
  watermelon: { name: 'Watermelon', accent: '#f472b6', accentHover: '#f689c3' },
  copper: { name: 'Copper', accent: '#b87333', accentHover: '#cc8743' },
  denim: { name: 'Denim', accent: '#1e40af', accentHover: '#2950c4' },
  garnet: { name: 'Garnet', accent: '#9f1239', accentHover: '#b91643' },
  honey: { name: 'Honey', accent: '#eab308', accentHover: '#f0c41a' },
  ice: { name: 'Ice', accent: '#67e8f9', accentHover: '#81edfa' },
  jasmine: { name: 'Jasmine', accent: '#fde047', accentHover: '#fde868' },
  lilac: { name: 'Lilac', accent: '#d8b4fe', accentHover: '#e2c6fe' },
  mahogany: { name: 'Mahogany', accent: '#7c2d12', accentHover: '#923716' },
  navy: { name: 'Navy', accent: '#1e3a5f', accentHover: '#264b77' },
  olive: { name: 'Olive', accent: '#65a30d', accentHover: '#76b918' },
  salmon: { name: 'Salmon', accent: '#fb7185', accentHover: '#fc8e9e' },
  topaz: { name: 'Topaz', accent: '#f59e0b', accentHover: '#f6ad22' },
  ultramarine: { name: 'Ultramarine', accent: '#4338ca', accentHover: '#504cea' },
  willow: { name: 'Willow', accent: '#a3e635', accentHover: '#b4ed50' },
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('st_mode') || 'dark')
  const [preset, setPreset] = useState(() => localStorage.getItem('st_preset') || 'default')
  const [radius, setRadius] = useState(() => parseInt(localStorage.getItem('st_radius')) || 12)
  const [blur, setBlur] = useState(() => parseInt(localStorage.getItem('st_blur')) || 12)
  const [fontScale, setFontScale] = useState(() => parseFloat(localStorage.getItem('st_font')) || 1)
  const [custom, setCustom] = useState(() => {
    try { return JSON.parse(localStorage.getItem('st_custom')) || {} } catch { return {} }
  })
  const [showIntro, setShowIntro] = useState(() => localStorage.getItem('st_intro') !== 'false')

  const currentPreset = PRESETS[preset] || PRESETS.default

  const applyTheme = useCallback(() => {
    const modeColors = MODES[mode] || MODES.dark
    const p = custom.accent ? { accent: custom.accent, accentHover: custom.accentHover || custom.accent } : currentPreset
    const root = document.documentElement
    root.style.setProperty('--bg', modeColors.bg)
    root.style.setProperty('--fg', modeColors.fg)
    root.style.setProperty('--card', modeColors.card)
    root.style.setProperty('--card-hover', modeColors.cardHover)
    root.style.setProperty('--border', modeColors.border)
    root.style.setProperty('--muted', modeColors.muted)
    root.style.setProperty('--accent', p.accent)
    root.style.setProperty('--accent-hover', p.accentHover)
    root.style.setProperty('--glow', modeColors.glow)
    root.style.setProperty('--header', modeColors.header)
    root.style.setProperty('--sidebar', modeColors.sidebar)
    root.style.setProperty('--input-bg', modeColors.inputBg)
    root.style.setProperty('--shadow', modeColors.shadow)
    root.style.setProperty('--radius', `${radius}px`)
    root.style.setProperty('--blur', `${blur}px`)
    root.style.setProperty('--font-scale', fontScale)
  }, [mode, preset, radius, blur, fontScale, custom, currentPreset])

  useEffect(() => { applyTheme() }, [applyTheme])

  const save = useCallback((key, val) => {
    localStorage.setItem(`st_${key}`, val)
  }, [])

  const changeMode = useCallback((m) => { setMode(m); save('mode', m) }, [save])
  const changePreset = useCallback((p) => { setPreset(p); setCustom({}); save('preset', p); save('custom', '{}') }, [save])
  const changeRadius = useCallback((r) => { setRadius(r); save('radius', r) }, [save])
  const changeBlur = useCallback((b) => { setBlur(b); save('blur', b) }, [save])
  const changeFont = useCallback((f) => { setFontScale(f); save('font', f) }, [save])
  const changeCustom = useCallback((c) => { setCustom(c); save('custom', JSON.stringify(c)) }, [save])
  const skipIntro = useCallback(() => { setShowIntro(false); save('intro', 'false') }, [save])

  return (
    <ThemeContext.Provider value={{
      mode, preset, radius, blur, fontScale, custom, showIntro,
      currentPreset, MODES, PRESETS, modes: Object.keys(MODES),
      changeMode, changePreset, changeRadius, changeBlur, changeFont, changeCustom, skipIntro,
      setShowIntro,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() { return useContext(ThemeContext) }

