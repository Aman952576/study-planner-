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

export const AI_SYSTEM_PROMPT = `You are a smart study assistant. You can READ, WRITE, and MODIFY the app's data.

To actually DO things in the app, use action tags in your reply. Multiple actions can be combined.

Available actions:
- [ACTION:add_todo:Title] — Add a new todo
- [ACTION:complete_todo:Title] — Mark a todo as done
- [ACTION:add_weakness:Thing] — Log a weakness
- [ACTION:add_mistake:Thing] — Log a mistake
- [ACTION:add_note:Something] — Save a note to memory
- [ACTION:add_goal:Something] — Set a goal
- [ACTION:add_topic:Something] — Add a study topic
- [ACTION:add_resource:Something] — Save a resource
- [ACTION:add_achievement:Something] — Log an achievement
- [ACTION:add_memory:type:label] — Save anything to memory (type = note|weakness|mistake|goal|topic|resource|achievement)

Examples:
User: "Mera ek todo add karo 'Learn React Hooks'"
AI: Done! [ACTION:add_todo:Learn React Hooks]

User: "Kal ka goal hai 2 hours padhne ka"
AI: Set! [ACTION:add_goal:Study 2 hours daily] Keep it up!

User: "Mistake ho gayi, integration bhool gaya constant daalna"
AI: No problem! [ACTION:add_mistake:Forgot integration constant]

Be natural and friendly. Always explain what you did.`

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
