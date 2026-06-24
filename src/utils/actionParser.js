const API = '/api'

async function api(url, opts = {}) {
  try {
    const res = await fetch(`${API}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opts
    })
    return await res.json()
  } catch { return null }
}

function ls(key, def = []) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : def } catch { return def }
}
function lss(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

const ACTION_MAP = {
  add_todo: async (title) => {
    if (!title.trim()) return null
    const r = await api('/tasks', { method: 'POST', body: JSON.stringify({ title: title.trim() }) })
    return r?.id ? `✅ Added todo: "${title.trim()}"` : `❌ Failed to add todo`
  },
  complete_todo: async (titleOrId) => {
    const tasks = await api('/tasks?status=active')
    if (!tasks || !Array.isArray(tasks)) return `❌ Could not fetch tasks`
    const match = tasks.find(t => t.title?.toLowerCase() === titleOrId.toLowerCase() || t.id === titleOrId)
    if (!match) return `❌ Task "${titleOrId}" not found`
    await api(`/tasks/${match.id}/done`, { method: 'POST', body: JSON.stringify({ actual_hours: 0 }) })
    return `✅ Completed: "${match.title}"`
  },
  delete_todo: async (titleOrId) => {
    const tasks = await api('/tasks?status=all')
    if (!tasks || !Array.isArray(tasks)) return `❌ Could not fetch tasks`
    const match = tasks.find(t => t.title?.toLowerCase() === titleOrId.toLowerCase() || t.id === titleOrId)
    if (!match) return `❌ Task "${titleOrId}" not found`
    await api(`/tasks/${match.id}/done`, { method: 'POST', body: JSON.stringify({ actual_hours: 0 }) })
    return `✅ Deleted: "${match.title}"`
  },
  add_weakness: async (label) => {
    const r = await api('/graph/weakness', { method: 'POST', body: JSON.stringify({ label: label.trim() }) })
    return r?.id ? `✅ Weakness added: "${label.trim()}"` : `❌ Failed to add weakness`
  },
  add_mistake: async (label) => {
    const r = await api('/graph/mistake', { method: 'POST', body: JSON.stringify({ label: label.trim() }) })
    return r?.id ? `✅ Mistake added: "${label.trim()}"` : `❌ Failed to add mistake`
  },
  add_note: async (label) => {
    const r = await api('/graph/add', { method: 'POST', body: JSON.stringify({ type: 'note', label: label.trim() }) })
    return r?.id ? `✅ Note saved: "${label.trim()}"` : `❌ Failed to save note`
  },
  add_goal: async (label) => {
    const r = await api('/graph/add', { method: 'POST', body: JSON.stringify({ type: 'goal', label: label.trim() }) })
    return r?.id ? `✅ Goal added: "${label.trim()}"` : `❌ Failed to add goal`
  },
  add_topic: async (label) => {
    const r = await api('/graph/add', { method: 'POST', body: JSON.stringify({ type: 'topic', label: label.trim() }) })
    return r?.id ? `✅ Topic saved: "${label.trim()}"` : `❌ Failed to add topic`
  },
  add_resource: async (label) => {
    const r = await api('/graph/add', { method: 'POST', body: JSON.stringify({ type: 'resource', label: label.trim() }) })
    return r?.id ? `✅ Resource saved: "${label.trim()}"` : `❌ Failed to add resource`
  },
  add_achievement: async (label) => {
    const r = await api('/graph/add', { method: 'POST', body: JSON.stringify({ type: 'achievement', label: label.trim() }) })
    return r?.id ? `✅ Achievement saved: "${label.trim()}"` : `❌ Failed to add achievement`
  },
  add_memory: async (type, label) => {
    const t = type?.trim()?.toLowerCase() || 'note'
    const r = await api('/graph/add', { method: 'POST', body: JSON.stringify({ type: t, label: label.trim() }) })
    return r?.id ? `✅ Saved "${label.trim()}" as ${t}` : `❌ Failed to save`
  },
  add_exam: async (name, date, subject = 'general') => {
    const exams = ls('st_exam_tracker', {})
    const id = 'exam_' + Date.now()
    exams[id] = { id, name: name.trim(), date: date.trim(), subject: subject.trim(), progress: 0, topics: [] }
    lss('st_exam_tracker', exams)
    return `✅ Exam added: "${name.trim()}" on ${date.trim()}`
  },
  add_event: async (title, date) => {
    const events = ls('st_events', [])
    events.push({ id: 'evt_' + Date.now(), title: title.trim(), date: date.trim(), time: '' })
    lss('st_events', events)
    return `✅ Event added: "${title.trim()}" on ${date.trim()}`
  },
  add_flashcard: async (question, answer) => {
    const cards = ls('st_flashcards', [])
    cards.push({ id: 'fc_' + Date.now(), question: question.trim(), answer: answer.trim(), level: 1 })
    lss('st_flashcards', cards)
    return `✅ Flashcard added: "${question.trim()}"`
  },
  add_study_slot: async (day, time, topic) => {
    const slots = ls('st_planner', [])
    slots.push({ id: 'slot_' + Date.now(), day: day.trim(), time: time.trim(), topic: topic.trim() })
    lss('st_planner', slots)
    return `✅ Study slot added: ${topic.trim()} on ${day.trim()} at ${time.trim()}`
  },
  add_quick_note: async (text) => {
    const notes = ls('st_notes', [])
    notes.unshift({ id: 'note_' + Date.now(), text: text.trim(), created: new Date().toISOString() })
    lss('st_notes', notes)
    return `✅ Quick note saved`
  },
  add_resource_link: async (title, url) => {
    const resources = ls('st_resources', [])
    resources.push({ id: 'res_' + Date.now(), title: title.trim(), url: url.trim(), tags: [] })
    lss('st_resources', resources)
    return `✅ Resource saved: "${title.trim()}"`
  },
}

const CODE_MAP = {
  read: async (path) => {
    const r = await api('/code/read', { method: 'POST', body: JSON.stringify({ path: path.trim() }) })
    if (r?.error) return `❌ ${r.error}`
    return { action: 'read', path: path.trim(), content: r.content }
  },
  write: async (path, content) => {
    const r = await api('/code/write', { method: 'POST', body: JSON.stringify({ path: path.trim(), content }) })
    return r?.ok ? `✅ Written to ${path.trim()}` : `❌ Failed to write ${path.trim()}`
  },
  edit: async (path, oldStr, newStr, replaceAll = false) => {
    const r = await api('/code/edit', {
      method: 'POST',
      body: JSON.stringify({ path: path.trim(), oldString: oldStr, newString: newStr, replaceAll })
    })
    return r?.ok ? `✅ Edited ${path.trim()}` : `❌ Failed to edit: ${r?.error || 'unknown'}`
  },
  create: async (path, content) => {
    return await CODE_MAP.write(path, content)
  },
  search: async (query) => {
    const r = await api(`/code/search?q=${encodeURIComponent(query)}`)
    if (r?.length) return { action: 'search', query, results: r.slice(0, 10) }
    return `🔍 No matches for "${query}"`
  },
}

export async function parseAndExecuteActions(text) {
  const results = []
  const regex = /\[ACTION:([^\]]+)\]/g
  let match
  while ((match = regex.exec(text)) !== null) {
    const parts = match[1].split(':')
    const type = parts[0].trim().toLowerCase()
    const params = parts.slice(1).map(s => s.trim())
    const handler = ACTION_MAP[type]
    if (handler) {
      const result = await handler(...params)
      if (result) results.push({ type, result, raw: match[0] })
    }
  }
  return results
}

export async function parseAndExecuteCodeActions(text) {
  const results = []
  const regex = /\[CODE:([^\]]+)\]/g
  let match
  while ((match = regex.exec(text)) !== null) {
    const parts = match[1].split(':')
    const type = parts[0].trim().toLowerCase()
    const params = parts.slice(1).map(s => s.trim())
    const handler = CODE_MAP[type]
    if (handler) {
      const result = await handler(...params)
      if (result) results.push({ type, result, raw: match[0] })
    }
  }
  return results
}

export function stripActions(text) {
  return text.replace(/\[ACTION:[^\]]+\]/g, '').replace(/\[CODE:[^\]]+\]/g, '').replace(/\n{3,}/g, '\n\n').trim()
}

export function buildAppContext() {
  const ctx = []
  try {
    const todos = ls('st_todos', [])
    const activeTodos = todos.filter(t => !t.done)
    ctx.push(`📋 Active Todos: ${activeTodos.length}`)
    if (activeTodos.length) ctx.push(`  - ${activeTodos.map(t => t.title).join('\n  - ')}`)
  } catch {}
  try {
    const exams = ls('st_exam_tracker', {})
    const examList = Object.values(exams)
    ctx.push(`📝 Exams: ${examList.length}`)
    if (examList.length) ctx.push(`  - ${examList.map(e => `${e.name} (${e.date})`).join('\n  - ')}`)
  } catch {}
  try {
    const events = ls('st_events', [])
    ctx.push(`📅 Events: ${events.length}`)
    if (events.length) ctx.push(`  - ${events.slice(0, 5).map(e => `${e.title} (${e.date})`).join('\n  - ')}`)
  } catch {}
  try {
    const goals = ls('st_goals', [])
    ctx.push(`🎯 Goals: ${goals.length}`)
  } catch {}
  try {
    const notes = ls('st_notes', [])
    ctx.push(`📓 Quick Notes: ${notes.length}`)
  } catch {}
  try {
    const flashcards = ls('st_flashcards', [])
    ctx.push(`🔖 Flashcards: ${flashcards.length}`)
  } catch {}
  try {
    const resources = ls('st_resources', [])
    ctx.push(`📚 Resources: ${resources.length}`)
  } catch {}
  return ctx.join('\n')
}

export const AI_SYSTEM_PROMPT = `You are a SUPER SMART study assistant and automation agent. You control the entire app.

Your job: User kuch bhi bole — tum analysis kro, action lo, aur reply do. Tumhare paas poore app ka data hai (todos, exams, events, goals, notes, flashcards, resources, knowledge graph).

TO ACTUALLY DO THINGS, use [ACTION:type:params] tags in your reply. Multiple actions ek saath kar sakte ho.

HOW TO RESPOND:
1. Pehle analyze karo user ka request + app ka current state
2. Decide kya action lena hai
3. Action tag daalo, aur batao kya kiya

AVAILABLE ACTIONS (sab kaam kar sakte ho):

📋 TODOS
[ACTION:add_todo:Title] — Add new todo
[ACTION:complete_todo:Title] — Mark todo done
[ACTION:delete_todo:Title] — Delete todo

🧠 MEMORY / GRAPH
[ACTION:add_weakness:Thing] — Log weakness
[ACTION:add_mistake:Thing] — Log mistake
[ACTION:add_note:Something] — Save note
[ACTION:add_goal:Something] — Set goal
[ACTION:add_topic:Something] — Add topic
[ACTION:add_resource:Something] — Save resource
[ACTION:add_achievement:Something] — Log achievement
[ACTION:add_memory:type:label] — Save anything (type = note|weakness|mistake|goal|topic|resource|achievement)

📝 EXAMS & EVENTS
[ACTION:add_exam:Name:Date:Subject] — Add exam (date format: YYYY-MM-DD)
[ACTION:add_event:Title:Date] — Add calendar event

🔖 FLASHCARDS & NOTES
[ACTION:add_flashcard:Question:Answer] — Add flashcard
[ACTION:add_quick_note:Text] — Save quick note
[ACTION:add_resource_link:Title:URL] — Save resource link

📚 STUDY PLANNER
[ACTION:add_study_slot:Day:Time:Topic] — Add to planner (day = Monday|Tuesday|etc)

EXAMPLES:
User: "Mera aaj ka plan banao, 2 ghante maths padhna hai aur ek todo add karo"
AI: Done! Added todo and study slot for you. [ACTION:add_todo:Study Maths 2hrs] [ACTION:add_study_slot:Monday:10:00:Maths] Maths karte ho to derivatives par dhyan do!

User: "Mera analysis karo, kaisa chal raha hai"
AI: (analyze all data and give detailed report with suggestions)

User: "Weakness hai integration mein, aur ek exam add karo GATE 2027 2027-02-01"
AI: Noted! [ACTION:add_weakness:Integration] [ACTION:add_exam:GATE 2027:2027-02-01:General]

ALWAYS greet naturally in Hinglish. Never just say "I can't do that". Find a way.`

export const CODE_SYSTEM_PROMPT = `You are a code agent that can READ, WRITE, and EDIT project files.

To actually modify code, use action tags in your reply:

Available code actions:
- [CODE:read:path] — Read a file
- [CODE:write:path] — Write a new file (after [CODE:read:path] content... put content in next line)
  Actually use: [CODE:write:path]content here[/CODE]
- [CODE:edit:path:oldString:newString] — Edit a file (replace first match)
- [CODE:edit:path:oldString:newString:true] — Edit a file (replace all matches)
- [CODE:search:query] — Search codebase

For writing files, use:
[CODE:write:path/to/file.js]
file content here
[/CODE]

For edits:
[CODE:edit:path/to/file.js:old code:new code]

Examples:
User: "TodoList mein ek clear button add karo"
AI: [CODE:read:src/components/TodoList.jsx]
...then after reading... 
[CODE:edit:src/components/TodoList.jsx:old code:new code with button added]

Always explain what changes you're making. Read first, then edit.`
