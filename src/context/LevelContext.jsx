import { createContext, useContext, useState, useEffect } from 'react'

const LevelContext = createContext()

export const useLevelContext = () => {
  const ctx = useContext(LevelContext)
  if (!ctx) throw new Error('useLevelContext must be used inside LevelProvider')
  return ctx
}

const LEVEL_KEY = 'st_levels'

function loadLevels() {
  try {
    const stored = localStorage.getItem(LEVEL_KEY)
    if (!stored) return { allLevels: [], topicLevels: {} }
    return JSON.parse(stored)
  } catch {
    return { allLevels: [], topicLevels: {} }
  }
}

export function LevelProvider({ children }) {
  const [levels, setLevels] = useState(loadLevels)

  useEffect(() => {
    localStorage.setItem(LEVEL_KEY, JSON.stringify(levels))
  }, [levels])

  // Create a new level
  const createLevel = (levelName) => {
    const newLevel = {
      id: `level_${Date.now()}`,
      name: levelName,
      createdAt: new Date().toISOString()
    }
    setLevels(prev => ({
      ...prev,
      allLevels: [...prev.allLevels, newLevel]
    }))
    return newLevel
  }

  // Assign a level to a topic (topic can have multiple levels)
  const assignLevelToTopic = (topicName, levelId) => {
    setLevels(prev => {
      const existing = prev.topicLevels[topicName] || []
      if (existing.includes(levelId)) return prev
      return {
        ...prev,
        topicLevels: {
          ...prev.topicLevels,
          [topicName]: [...existing, levelId]
        }
      }
    })
  }

  // Get all levels
  const getAllLevels = () => levels.allLevels

  // Get levels for a specific topic
  const getTopicLevels = (topicName) => {
    const levelIds = levels.topicLevels[topicName] || []
    return levels.allLevels.filter(l => levelIds.includes(l.id))
  }

  // Remove level assignment from topic
  const removeLevelFromTopic = (topicName, levelId) => {
    setLevels(prev => {
      const existing = prev.topicLevels[topicName] || []
      return {
        ...prev,
        topicLevels: {
          ...prev.topicLevels,
          [topicName]: existing.filter(id => id !== levelId)
        }
      }
    })
  }

  // Delete a level entirely
  const deleteLevel = (levelId) => {
    setLevels(prev => ({
      ...prev,
      allLevels: prev.allLevels.filter(l => l.id !== levelId),
      topicLevels: Object.fromEntries(
        Object.entries(prev.topicLevels).map(([topic, ids]) => [
          topic,
          ids.filter(id => id !== levelId)
        ])
      )
    }))
  }

  return (
    <LevelContext.Provider value={{
      createLevel,
      assignLevelToTopic,
      getAllLevels,
      getTopicLevels,
      removeLevelFromTopic,
      deleteLevel
    }}>
      {children}
    </LevelContext.Provider>
  )
}
