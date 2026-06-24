import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

const KEY = 'st_syllabus'
const LEVEL_KEY = 'st_topic_levels'

const SYLLABUS_DATA = {
  mathematics: [
    { id: 'm1', unit: 1, chapter: 'Sets, Relations and Functions', difficulty: 'Beginner', topics: ['Sets', 'Relations', 'Functions', 'Composition'] },
    { id: 'm2', unit: 2, chapter: 'Complex Numbers and Quadratic Equations', difficulty: 'Intermediate', topics: ['Complex Numbers', 'Argand Diagram', 'Quadratic Equations'] },
    { id: 'm3', unit: 3, chapter: 'Matrices and Determinants', difficulty: 'Intermediate', topics: ['Matrices', 'Determinants', 'Adjoint', 'Inverse'] },
    { id: 'm4', unit: 4, chapter: 'Permutations and Combinations', difficulty: 'Beginner', topics: ['Permutations', 'Combinations', 'Applications'] },
    { id: 'm5', unit: 5, chapter: 'Binomial Theorem', difficulty: 'Intermediate', topics: ['Binomial Expansion', 'General Term', 'Middle Term'] },
    { id: 'm6', unit: 6, chapter: 'Sequence and Series', difficulty: 'Intermediate', topics: ['AP', 'GP', 'Means', 'Relations'] },
    { id: 'm7', unit: 7, chapter: 'Limit, Continuity and Differentiability', difficulty: 'Advanced', topics: ['Limits', 'Continuity', 'Derivatives', 'Applications'] },
    { id: 'm8', unit: 8, chapter: 'Integral Calculus', difficulty: 'Advanced', topics: ['Integration', 'Substitution', 'Definite Integrals', 'Areas'] },
    { id: 'm9', unit: 9, chapter: 'Differential Equations', difficulty: 'Advanced', topics: ['Order and Degree', 'Separation of Variables', 'Linear DE'] },
    { id: 'm10', unit: 10, chapter: 'Co-ordinate Geometry', difficulty: 'Intermediate', topics: ['Lines', 'Circle', 'Conics', 'Parabola', 'Ellipse'] },
    { id: 'm11', unit: 11, chapter: 'Three Dimensional Geometry', difficulty: 'Intermediate', topics: ['3D Coordinates', 'Lines', 'Planes', 'Angles'] },
    { id: 'm12', unit: 12, chapter: 'Vector Algebra', difficulty: 'Intermediate', topics: ['Vectors', 'Scalars', 'Products', 'Applications'] },
    { id: 'm13', unit: 13, chapter: 'Statistics and Probability', difficulty: 'Intermediate', topics: ['Mean', 'Median', 'Mode', 'Probability', 'Distribution'] },
    { id: 'm14', unit: 14, chapter: 'Trigonometry', difficulty: 'Beginner', topics: ['Identities', 'Functions', 'Inverse Functions'] },
  ],
  physics: [
    { id: 'p1', unit: 1, chapter: 'Units and Measurements', difficulty: 'Beginner', topics: ['SI Units', 'Dimensions', 'Errors', 'Significant Figures'] },
    { id: 'p2', unit: 2, chapter: 'Kinematics', difficulty: 'Beginner', topics: ['Motion', 'Velocity', 'Acceleration', 'Projectile Motion'] },
    { id: 'p3', unit: 3, chapter: 'Laws of Motion', difficulty: 'Beginner', topics: ['Newtons Laws', 'Momentum', 'Friction', 'Circular Motion'] },
    { id: 'p4', unit: 4, chapter: 'Work, Energy and Power', difficulty: 'Intermediate', topics: ['Work', 'Energy', 'Potential Energy', 'Collisions'] },
    { id: 'p5', unit: 5, chapter: 'Rotational Motion', difficulty: 'Intermediate', topics: ['Torque', 'Angular Momentum', 'Moment of Inertia', 'Equilibrium'] },
    { id: 'p6', unit: 6, chapter: 'Gravitation', difficulty: 'Intermediate', topics: ['Newtons Law', 'Kepler Laws', 'Satellites', 'Escape Velocity'] },
    { id: 'p7', unit: 7, chapter: 'Properties of Solids and Liquids', difficulty: 'Intermediate', topics: ['Elasticity', 'Pressure', 'Viscosity', 'Surface Tension'] },
    { id: 'p8', unit: 8, chapter: 'Thermodynamics', difficulty: 'Intermediate', topics: ['Heat', 'Temperature', 'First Law', 'Second Law'] },
    { id: 'p9', unit: 9, chapter: 'Kinetic Theory of Gases', difficulty: 'Intermediate', topics: ['Pressure', 'Temperature', 'RMS Speed', 'Mean Free Path'] },
    { id: 'p10', unit: 10, chapter: 'Oscillations and Waves', difficulty: 'Advanced', topics: ['SHM', 'Pendulum', 'Waves', 'Superposition', 'Beats'] },
    { id: 'p11', unit: 11, chapter: 'Electrostatics', difficulty: 'Advanced', topics: ['Coulombs Law', 'Electric Field', 'Potential', 'Capacitor'] },
    { id: 'p12', unit: 12, chapter: 'Current Electricity', difficulty: 'Intermediate', topics: ['Current', 'Resistance', 'Ohms Law', 'Circuits', 'Kirchhoff Laws'] },
    { id: 'p13', unit: 13, chapter: 'Magnetic Effects and Magnetism', difficulty: 'Advanced', topics: ['Biot Savart', 'Ampere Law', 'Force on Charge', 'Galvanometer'] },
    { id: 'p14', unit: 14, chapter: 'Electromagnetic Induction', difficulty: 'Advanced', topics: ['Faraday Law', 'Induction', 'AC Circuits', 'Transformer'] },
    { id: 'p15', unit: 15, chapter: 'Electromagnetic Waves', difficulty: 'Advanced', topics: ['Displacement Current', 'EM Waves', 'Spectrum'] },
    { id: 'p16', unit: 16, chapter: 'Optics', difficulty: 'Intermediate', topics: ['Reflection', 'Refraction', 'Lenses', 'Interference', 'Diffraction'] },
    { id: 'p17', unit: 17, chapter: 'Dual Nature of Matter', difficulty: 'Advanced', topics: ['Photoelectric Effect', 'Matter Waves', 'de Broglie'] },
    { id: 'p18', unit: 18, chapter: 'Atoms and Nuclei', difficulty: 'Advanced', topics: ['Rutherford Model', 'Bohr Model', 'Spectrum', 'Nuclear Reactions'] },
    { id: 'p19', unit: 19, chapter: 'Electronic Devices', difficulty: 'Intermediate', topics: ['Semiconductors', 'Diode', 'Logic Gates'] },
  ],
  chemistry: [
    { id: 'c1', unit: 1, chapter: 'Basic Concepts in Chemistry', difficulty: 'Beginner', topics: ['Atomic Theory', 'Mole Concept', 'Stoichiometry', 'Chemical Equations'] },
    { id: 'c2', unit: 2, chapter: 'Atomic Structure', difficulty: 'Intermediate', topics: ['EM Radiation', 'Bohr Model', 'Quantum Numbers', 'Orbitals', 'Electronic Configuration'] },
    { id: 'c3', unit: 3, chapter: 'Chemical Bonding', difficulty: 'Intermediate', topics: ['Ionic Bond', 'Covalent Bond', 'Hybridization', 'VSEPR', 'Molecular Orbital'] },
    { id: 'c4', unit: 4, chapter: 'Chemical Thermodynamics', difficulty: 'Advanced', topics: ['Heat', 'Enthalpy', 'Entropy', 'Gibbs Energy', 'Hess Law'] },
    { id: 'c5', unit: 5, chapter: 'Solutions', difficulty: 'Intermediate', topics: ['Concentration', 'Colligative Properties', 'Vapor Pressure', 'Raoult Law'] },
    { id: 'c6', unit: 6, chapter: 'Equilibrium', difficulty: 'Intermediate', topics: ['Equilibrium Constant', 'Le Chatelier Principle', 'Ionic Equilibrium', 'pH'] },
    { id: 'c7', unit: 7, chapter: 'Redox Reactions and Electrochemistry', difficulty: 'Advanced', topics: ['Oxidation', 'Reduction', 'Electrochemical Cells', 'Nernst Equation'] },
    { id: 'c8', unit: 8, chapter: 'Chemical Kinetics', difficulty: 'Advanced', topics: ['Reaction Rate', 'Order', 'Molecularity', 'Activation Energy'] },
    { id: 'c9', unit: 9, chapter: 'Classification of Elements', difficulty: 'Beginner', topics: ['Periodic Law', 'Periodic Trends', 'Blocks'] },
    { id: 'c10', unit: 10, chapter: 'p-Block Elements', difficulty: 'Intermediate', topics: ['Group 13-18', 'Properties', 'Chemical Reactions'] },
    { id: 'c11', unit: 11, chapter: 'd and f-Block Elements', difficulty: 'Intermediate', topics: ['Transition Elements', 'Inner Transition', 'Properties'] },
    { id: 'c12', unit: 12, chapter: 'Coordination Compounds', difficulty: 'Advanced', topics: ['Ligands', 'Coordination Number', 'IUPAC Nomenclature', 'Crystal Field Theory'] },
    { id: 'c13', unit: 13, chapter: 'Purification of Organic Compounds', difficulty: 'Intermediate', topics: ['Crystallization', 'Distillation', 'Chromatography', 'Analysis'] },
    { id: 'c14', unit: 14, chapter: 'Basic Principles of Organic Chemistry', difficulty: 'Intermediate', topics: ['Hybridization', 'Isomerism', 'Bond Fission', 'Reactions'] },
    { id: 'c15', unit: 15, chapter: 'Hydrocarbons', difficulty: 'Intermediate', topics: ['Alkanes', 'Alkenes', 'Alkynes', 'Aromatics', 'Benzene'] },
    { id: 'c16', unit: 16, chapter: 'Organic Compounds with Halogens', difficulty: 'Intermediate', topics: ['C-X Bond', 'Substitution', 'Reactions', 'Uses'] },
    { id: 'c17', unit: 17, chapter: 'Organic Compounds with Oxygen', difficulty: 'Intermediate', topics: ['Alcohols', 'Phenols', 'Ethers', 'Aldehydes', 'Ketones', 'Carboxylic Acids'] },
    { id: 'c18', unit: 18, chapter: 'Organic Compounds with Nitrogen', difficulty: 'Intermediate', topics: ['Amines', 'Diazonium Salts', 'Reactions'] },
    { id: 'c19', unit: 19, chapter: 'Biomolecules', difficulty: 'Advanced', topics: ['Carbohydrates', 'Proteins', 'Vitamins', 'Nucleic Acids'] },
  ]
}

function load() {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) {
      const initial = {}
      Object.entries(SYLLABUS_DATA).forEach(([subject, chapters]) => {
        initial[subject] = chapters.map(ch => ({ ...ch, completed: false }))
      })
      return initial
    }
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

function loadLevels() {
  try {
    const stored = localStorage.getItem(LEVEL_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export default function SyllabusTracker() {
  const [data, setData] = useState(load)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [topicLevels, setTopicLevels] = useState(loadLevels)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [levelInput, setLevelInput] = useState('')
  const [expandedTopic, setExpandedTopic] = useState(null)

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(data)) }, [data])
  useEffect(() => { localStorage.setItem(LEVEL_KEY, JSON.stringify(topicLevels)) }, [topicLevels])

  const toggleChapter = (subject, chapterId) => {
    setData(prev => ({
      ...prev,
      [subject]: prev[subject].map(ch => ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch)
    }))
  }

  const getAllLevels = () => {
    const levels = new Set()
    Object.values(topicLevels).forEach(topicLevelList => {
      topicLevelList.forEach(lvl => levels.add(lvl))
    })
    return Array.from(levels)
  }

  const getTopicLevelList = (topicName) => topicLevels[topicName] || []

  const addLevelToTopic = (topicName, levelName) => {
    if (!levelName.trim()) return
    setTopicLevels(prev => ({
      ...prev,
      [topicName]: [...(prev[topicName] || []), levelName]
    }))
    setLevelInput('')
    setExpandedTopic(null)
  }

  const getStats = () => {
    let total = 0, completed = 0
    const byDifficulty = { Beginner: { total: 0, completed: 0 }, Intermediate: { total: 0, completed: 0 }, Advanced: { total: 0, completed: 0 } }
    const bySubject = { mathematics: { total: 0, completed: 0 }, physics: { total: 0, completed: 0 }, chemistry: { total: 0, completed: 0 } }

    Object.entries(data).forEach(([subject, chapters]) => {
      chapters.forEach(ch => {
        total++
        bySubject[subject].total++
        byDifficulty[ch.difficulty].total++
        if (ch.completed) {
          completed++
          bySubject[subject].completed++
          byDifficulty[ch.difficulty].completed++
        }
      })
    })

    return { total, completed, byDifficulty, bySubject }
  }

  const getFiltered = () => {
    let result = []
    Object.entries(data).forEach(([subject, chapters]) => {
      if (filterSubject !== 'all' && subject !== filterSubject) return
      chapters.forEach(ch => {
        if (filterDifficulty !== 'all' && ch.difficulty !== filterDifficulty) return
        if (search && !ch.chapter.toLowerCase().includes(search.toLowerCase())) return
        
        // Filter by selected level if set
        if (selectedLevel) {
          const chapterLevels = getTopicLevelList(ch.chapter)
          if (!chapterLevels.includes(selectedLevel)) return
        }
        
        result.push({ ...ch, subject })
      })
    })
    return result
  }

  const stats = getStats()
  const filtered = getFiltered()
  const progressPct = stats.total ? Math.round(stats.completed / stats.total * 100) : 0

  const chartDataDifficulty = [
    { name: 'Beginner', value: stats.byDifficulty.Beginner.completed, color: '#22c55e' },
    { name: 'Intermediate', value: stats.byDifficulty.Intermediate.completed, color: '#f59e0b' },
    { name: 'Advanced', value: stats.byDifficulty.Advanced.completed, color: '#ef4444' },
  ].filter(d => d.value > 0)

  const chartDataSubject = [
    { name: 'Math', completed: stats.bySubject.mathematics.completed, total: stats.bySubject.mathematics.total },
    { name: 'Physics', completed: stats.bySubject.physics.completed, total: stats.bySubject.physics.total },
    { name: 'Chemistry', completed: stats.bySubject.chemistry.completed, total: stats.bySubject.chemistry.total },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>JEE Mains Syllabus Tracker</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Track your preparation across all subjects</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Overall Progress</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--accent)' }}>{progressPct}%</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{stats.completed}/{stats.total} chapters</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Mathematics</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#3b82f6' }}>{stats.bySubject.mathematics.completed}/{stats.bySubject.mathematics.total}</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{stats.bySubject.mathematics.total ? Math.round(stats.bySubject.mathematics.completed / stats.bySubject.mathematics.total * 100) : 0}%</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Physics</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#8b5cf6' }}>{stats.bySubject.physics.completed}/{stats.bySubject.physics.total}</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{stats.bySubject.physics.total ? Math.round(stats.bySubject.physics.completed / stats.bySubject.physics.total * 100) : 0}%</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Chemistry</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#ec4899' }}>{stats.bySubject.chemistry.completed}/{stats.bySubject.chemistry.total}</p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{stats.bySubject.chemistry.total ? Math.round(stats.bySubject.chemistry.completed / stats.bySubject.chemistry.total * 100) : 0}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Difficulty Distribution */}
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>PROGRESS BY DIFFICULTY</p>
          <div className="flex items-center gap-6">
            <div style={{ width: '140px', height: '140px' }}>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={chartDataDifficulty} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" stroke="none">
                    {chartDataDifficulty.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {chartDataDifficulty.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded" style={{ background: d.color }} />
                  <span style={{ color: 'var(--muted)' }}>{d.name}</span>
                  <span className="font-semibold" style={{ color: 'var(--fg)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>SUBJECT PROGRESS</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartDataSubject}>
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)' }} />
              <Bar dataKey="completed" fill="var(--accent)" />
              <Bar dataKey="total" fill="var(--border)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Search chapters..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg text-xs outline-none"
          style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
        />
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="px-4 py-2 rounded-lg text-xs outline-none"
          style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Subjects</option>
          <option value="mathematics">Mathematics</option>
          <option value="physics">Physics</option>
          <option value="chemistry">Chemistry</option>
        </select>
        <select
          value={filterDifficulty}
          onChange={e => setFilterDifficulty(e.target.value)}
          className="px-4 py-2 rounded-lg text-xs outline-none"
          style={{ background: 'var(--input-bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
        >
          <option value="all">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Level Filter */}
      {getAllLevels().length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLevel(null)}
            className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
            style={{ background: !selectedLevel ? 'var(--accent)' : 'var(--input-bg)', color: !selectedLevel ? '#fff' : 'var(--fg)' }}
          >
            All Levels
          </button>
          {getAllLevels().map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
              style={{ background: selectedLevel === level ? 'var(--accent)' : 'var(--input-bg)', color: selectedLevel === level ? '#fff' : 'var(--fg)' }}
            >
              {level}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>CHAPTERS ({filtered.length})</p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map(ch => {
            const topicLevelList = getTopicLevelList(ch.chapter)
            return (
              <div key={ch.id} className="space-y-1">
                <div
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  onClick={() => toggleChapter(ch.subject, ch.id)}
                >
                  <input
                    type="checkbox"
                    checked={ch.completed}
                    onChange={() => { }}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: ch.completed ? 'var(--muted)' : 'var(--fg)', textDecoration: ch.completed ? 'line-through' : 'none' }}>{ch.chapter}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{ch.topics.join(', ')}</p>
                  </div>
                  <span
                    className="px-2 py-1 text-[10px] font-semibold rounded text-white"
                    style={{
                      background: ch.difficulty === 'Beginner' ? '#22c55e' : ch.difficulty === 'Intermediate' ? '#f59e0b' : '#ef4444'
                    }}
                  >
                    {ch.difficulty}
                  </span>
                </div>

                {/* Level Options */}
                {expandedTopic === ch.chapter && (
                  <div className="ml-7 p-2 rounded-lg space-y-2" style={{ background: 'var(--input-bg)' }}>
                    {topicLevelList.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>Select Level:</p>
                        {topicLevelList.map(level => (
                          <button
                            key={level}
                            onClick={() => {
                              setSelectedLevel(level)
                              setExpandedTopic(null)
                            }}
                            className="w-full text-left px-2 py-1 text-xs rounded transition-all"
                            style={{ background: 'var(--card)', color: 'var(--fg)' }}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="New level..."
                        value={expandedTopic === ch.chapter ? levelInput : ''}
                        onChange={e => setLevelInput(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs rounded outline-none"
                        style={{ background: 'var(--bg)', color: 'var(--fg)', border: '1px solid var(--border)' }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            addLevelToTopic(ch.chapter, levelInput)
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => addLevelToTopic(ch.chapter, levelInput)}
                        className="px-2 py-1 text-xs font-medium rounded transition-all"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                      >
                        Add
                      </button>
                    </div>

                    <button
                      onClick={() => setExpandedTopic(null)}
                      className="w-full px-2 py-1 text-xs rounded transition-all"
                      style={{ background: 'var(--card)', color: 'var(--fg)' }}
                    >
                      Close
                    </button>
                  </div>
                )}

                {expandedTopic !== ch.chapter && (
                  <button
                    onClick={() => setExpandedTopic(ch.chapter)}
                    className="ml-7 text-xs px-3 py-1 rounded transition-all font-medium"
                    style={{ background: 'var(--input-bg)', color: 'var(--accent)' }}
                  >
                    + Add Level
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
