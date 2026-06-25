import sys, os, json, webbrowser, threading, re, secrets
from flask import Flask, jsonify, request, send_from_directory, session, redirect
from flask_cors import CORS
from datetime import datetime, date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import load_config, save_config
from agent.db import JSONDB
from agent.graphrag import GraphRAG
from agent.todo import TodoManager
from agent.reality import RealityLayer
from agent.backlog import AntiBacklogGuardian
from agent.research import ResearchLayer
from agent.opportunity import OpportunityGraph
from agent.scheduler import Scheduler
from agent.reports import ReportGenerator
from agent.llama import LlamaEngine
from agent.vectormemory import VectorMemory

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.secret_key = os.environ.get("FLASK_SECRET", secrets.token_hex(32))
APP_PASSWORD = os.environ.get("APP_PASSWORD", "")

db = JSONDB()
graph = GraphRAG(db)
todo = TodoManager(db)
reality = RealityLayer(db)
backlog = AntiBacklogGuardian(db)
research = ResearchLayer(db, graph)
opportunity = OpportunityGraph(db, graph)
scheduler = Scheduler(db, todo)
llama = LlamaEngine()
vmem = VectorMemory()
reporter = ReportGenerator(db, reality, backlog, graph, scheduler, llama)

# Auto-enable AI with groq mode if groq key is present and ollama not available
GROQ_KEY = os.environ.get("GROQ_API_KEY", "")
if GROQ_KEY and not llama.check():
    cfg = load_config()
    cfg["llama"]["enabled"] = True
    cfg["llama"]["mode"] = "groq"
    save_config(cfg)
    llama = LlamaEngine()
    llama.forced_mode = "groq"

# ─── Simple password protection ───────────────────────────
if APP_PASSWORD:
    @app.before_request
    def check_auth():
        if request.method == 'OPTIONS':
            return
        if request.path in ('/login', '/api/auth/login', '/api/auth/check', '/healthz', '/clear-sw', '/sw.js', '/mnc'):
            return
        if request.path.startswith('/api/'):
            if not session.get('authed'):
                return jsonify({"error": "login required"}), 401

@app.route("/login")
def login_page():
    if session.get('authed'):
        return redirect('/')
    html = '''<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Login - Study Planner</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0f0f13;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.card{background:#1a1a23;border:1px solid #2a2a35;border-radius:16px;padding:40px;width:100%;max-width:380px;text-align:center}
h1{color:#fff;font-size:22px;margin-bottom:6px}
p{color:#888;font-size:13px;margin-bottom:24px}
input{width:100%;padding:12px 16px;border-radius:10px;border:1px solid #2a2a35;background:#0f0f13;color:#fff;font-size:14px;outline:none;margin-bottom:12px}
input:focus{border-color:#6366f1}
button{width:100%;padding:12px;border-radius:10px;border:none;background:#6366f1;color:#fff;font-size:14px;font-weight:600;cursor:pointer}
button:hover{background:#4f46e5}
.error{color:#ef4444;font-size:12px;margin-top:8px}
</style></head><body>
<div class="card">
<h1>Study Planner</h1>
<p>Enter password to continue</p>
<form method="post" action="/api/auth/login" id="loginForm">
<input type="password" name="password" placeholder="Password" required autofocus>
<button type="submit">Continue</button>
</form>
<div class="error" id="error"></div>
</div>
<script>document.getElementById('loginForm').onsubmit=async(e)=>{
e.preventDefault();const p=document.querySelector('input').value;const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:p})})
if(r.ok){window.location.href=new URLSearchParams(location.search).get('redirect')||'/'}
else{document.getElementById('error').textContent='Wrong password'}}</script>
</body></html>'''
    return html

@app.route("/api/auth/check")
def api_auth_check():
    return jsonify({"authed": session.get('authed', False)})

@app.route("/api/auth/login", methods=["POST"])
def api_auth_login():
    data = request.json or request.form
    p = data.get("password", "")
    if APP_PASSWORD and p == APP_PASSWORD:
        session['authed'] = True
        session['username'] = 'admin'
        session.permanent = True
        return jsonify({"ok": True, "user": "admin"})
    from agent.supabase_db import supabase_available, get_client
    if supabase_available():
        client = get_client()
        res = client.table("app_users").select("*").eq("password", p).maybe_single().execute()
        if res.data:
            session['authed'] = True
            session['username'] = res.data.get("username", "user")
            session.permanent = True
            return jsonify({"ok": True, "user": session['username']})
    return jsonify({"error": "wrong password"}), 401

@app.route("/api/auth/logout", methods=["POST"])
def api_auth_logout():
    session.pop('authed', None)
    session.pop('username', None)
    return jsonify({"ok": True})

@app.route("/api/auth/adduser", methods=["POST"])
def api_auth_adduser():
    if not session.get('authed') or session.get('username') != 'admin':
        return jsonify({"error": "admin only"}), 403
    data = request.json
    uname = data.get("username", "").strip()
    pwd = data.get("password", "").strip()
    if not uname or not pwd:
        return jsonify({"error": "username and password required"}), 400
    from agent.supabase_db import supabase_available, get_client
    if not supabase_available():
        return jsonify({"error": "no database"}), 500
    client = get_client()
    existing = client.table("app_users").select("id").eq("username", uname).maybe_single().execute()
    if existing.data:
        return jsonify({"error": "user exists"}), 400
    client.table("app_users").insert({"username": uname, "password": pwd}).execute()
    return jsonify({"ok": True, "username": uname})

@app.route("/api/auth/users", methods=["GET"])
def api_auth_users():
    if not session.get('authed') or session.get('username') != 'admin':
        return jsonify({"error": "admin only"}), 403
    from agent.supabase_db import supabase_available, get_client
    if not supabase_available():
        return jsonify([])
    client = get_client()
    res = client.table("app_users").select("username,created_at").execute()
    return jsonify(res.data or [])

@app.route("/healthz")
def healthz():
    return "ok", 200

@app.route("/clear-sw")
def clear_service_worker():
    html = '''<!DOCTYPE html><html><body>
<script>
(async function(){
  if('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    for(const r of regs) await r.unregister();
  }
  if('caches' in window) {
    const keys = await caches.keys();
    for(const k of keys) await caches.delete(k);
  }
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/';
})();
</script>
<h2>Clearing service worker...</h2>
</body></html>'''
    return html

@app.route("/")
def index():
    resp = app.send_static_file("index.html")
    return resp

@app.route("/sw.js")
def old_sw():
    return "", 410

@app.route("/mnc")
def mnc_dashboard():
    return send_from_directory(BASE_DIR, "mnc.html")

@app.route("/api/status")
def api_status():
    return jsonify({
        "llama_enabled": llama.enabled,
        "llama_connected": llama.check() if llama.enabled else False,
        "llama_mode": llama.mode,
        "llama_model": llama.model,
        "mode": llama.mode,
        "actual_mode": getattr(llama, '_actual_mode', llama.mode),
        "forced_mode": getattr(llama, 'forced_mode', None),
        "groq_available": llama.groq_available(),
        "cloud_memory": hasattr(vmem, '_supa') and vmem._supa is not None,
        "groq_usage": llama.groq_usage() if hasattr(llama, 'groq_usage') else {}
    })

@app.route("/api/tasks", methods=["GET"])
def api_tasks():
    status = request.args.get("status", "active")
    if status == "active":
        tasks = todo.active()
    elif status == "all":
        tasks = db.todos()
    elif status == "done":
        tasks = [t for t in db.todos() if t["status"] == "done"]
    elif status == "postponed":
        tasks = [t for t in db.todos() if t["status"] == "postponed"]
    else:
        tasks = db.todos()
    for t in tasks:
        t["age_days"] = (datetime.now() - datetime.fromisoformat(t["created_at"])).days
    return jsonify(tasks)

@app.route("/api/tasks", methods=["POST"])
def api_add_task():
    data = request.json
    title = data.get("title", "")
    if not title:
        return jsonify({"error": "Title required"}), 400
    tid = todo.add(
        title=title,
        category=data.get("category", "general"),
        estimated_hours=float(data.get("estimated_hours", 1)),
        priority=int(data.get("priority", 3))
    )
    return jsonify({"id": tid, "title": title})

@app.route("/api/tasks/<tid>/done", methods=["POST"])
def api_done(tid):
    data = request.json or {}
    hours = float(data.get("actual_hours", 0))
    todo.complete(tid, hours)
    return jsonify({"ok": True})

@app.route("/api/tasks/<tid>/postpone", methods=["POST"])
def api_postpone(tid):
    todo.postpone(tid)
    return jsonify({"ok": True})

@app.route("/api/study", methods=["POST"])
def api_study():
    data = request.json
    hours = float(data.get("hours", 0))
    topics = data.get("topics", [])
    scheduler.log_study_session(hours, topics)
    return jsonify({"ok": True, "hours": hours, "topics": topics})

@app.route("/api/daily")
def api_daily():
    return jsonify({"report": reporter.daily_brief()})

@app.route("/api/weekly")
def api_weekly():
    return jsonify({"report": reporter.weekly_report()})

@app.route("/api/monthly")
def api_monthly():
    return jsonify({"report": reporter.monthly_report()})

@app.route("/api/stats")
def api_stats():
    s = todo.stats()
    ws = scheduler.weekly_summary()
    return jsonify({**s, "weekly_study_hours": ws["total_hours"]})

@app.route("/api/scan")
def api_scan():
    return jsonify(backlog.report())

@app.route("/api/graph", methods=["GET"])
def api_graph():
    ntype = request.args.get("type")
    nodes = graph.query(node_type=ntype, limit=50) if ntype else list(graph._g()["nodes"].values())[:50]
    summary = graph.weak_spot_summary()
    opp_summary = graph.opportunity_summary()
    return jsonify({"nodes": nodes, "summary": summary, "opportunities": opp_summary})

@app.route("/api/graph/weakness", methods=["POST"])
def api_add_weakness():
    data = request.json
    nid = graph.add_weakness(data.get("label", ""))
    return jsonify({"id": nid})

@app.route("/api/graph/mistake", methods=["POST"])
def api_add_mistake():
    data = request.json
    nid = graph.add_mistake(data.get("label", ""))
    return jsonify({"id": nid})

@app.route("/api/graph/add", methods=["POST"])
def api_graph_add():
    data = request.json
    node_type = data.get("type", "note")
    label = data.get("label", "")
    if not label:
        return jsonify({"error": "label required"}), 400
    nid = graph.add_node(node_type, label, data.get("properties", {}))
    return jsonify({"id": nid})

@app.route("/api/ideas", methods=["GET"])
def api_ideas():
    return jsonify(research.search())

@app.route("/api/ideas", methods=["POST"])
def api_add_idea():
    data = request.json
    iid = research.add_idea(
        title=data.get("title", ""),
        related_topics=data.get("topics", [])
    )
    return jsonify({"id": iid})

@app.route("/api/opportunities", methods=["GET"])
def api_opportunities():
    return jsonify(opportunity.upcoming(50))

@app.route("/api/opportunities", methods=["POST"])
def api_add_opportunity():
    data = request.json
    oid = opportunity.add(
        title=data.get("title", ""),
        deadline=data.get("deadline", ""),
        requirements=data.get("requirements", []),
        opportunity_type=data.get("type", "opportunity")
    )
    return jsonify({"id": oid})

@app.route("/api/backup", methods=["POST"])
def api_backup():
    data = request.json or {}
    btype = data.get("type", "daily")
    path = db.backup(btype)
    return jsonify({"path": path})

@app.route("/api/llama/enable", methods=["POST"])
def api_llama_enable():
    global llama
    cfg = load_config()
    cfg["llama"]["enabled"] = True
    cfg["llama"]["mode"] = "ollama"
    save_config(cfg)
    llama = LlamaEngine()
    connected = llama.check()
    if not connected and os.environ.get("GROQ_API_KEY", ""):
        llama.forced_mode = "groq"
        connected = True
    return jsonify({"ok": True, "connected": connected})

@app.route("/api/llama/disable", methods=["POST"])
def api_llama_disable():
    global llama
    cfg = load_config()
    cfg["llama"]["enabled"] = False
    save_config(cfg)
    llama = LlamaEngine()
    return jsonify({"ok": True})

@app.route("/api/llama/mode", methods=["POST"])
def api_llama_set_mode():
    data = request.json
    mode = data.get("mode", "auto")
    if mode == "auto":
        llama.forced_mode = None
    elif mode in ("ollama", "groq"):
        llama.forced_mode = mode
    else:
        return jsonify({"error": "invalid mode"}), 400
    return jsonify({"ok": True, "mode": mode, "actual_mode": getattr(llama, '_actual_mode', llama.mode)})

@app.route("/api/llama/prioritize", methods=["POST"])
def api_llama_prioritize():
    tasks = todo.active()
    if not tasks:
        return jsonify({"tasks": []})
    prioritized = llama.prioritize(tasks)
    return jsonify({"tasks": prioritized[:10]})

@app.route("/api/llama/generate", methods=["POST"])
def api_llama_generate():
    data = request.json
    prompt = data.get("prompt", "")
    system = data.get("system", "You are a study productivity AI assistant.")
    old_max = llama.max_tokens
    llama.max_tokens = min(data.get("max_tokens", 256), 256)
    resp = llama.ask(prompt, system)
    llama.max_tokens = old_max
    return jsonify({"response": resp})

@app.route("/api/llama/chat", methods=["POST"])
def api_llama_chat():
    data = request.json
    prompt = data.get("prompt", "")
    context = data.get("context", "")
    system_override = data.get("system", "")
    memory_instruction = (
        "If user shares anything personal worth remembering, end your reply with "
        "[MEMO:category:detail] — like [MEMO:weakness:calculus] or [MEMO:topic:linear algebra] or "
        "[MEMO:goal:crack GATE] or [MEMO:mistake:skipped revision]"
    )
    system = system_override or f"You are a friendly study assistant. Be concise. {memory_instruction}"
    full_prompt = f"{context}\n\nUser: {prompt}" if context else prompt
    old_max = llama.max_tokens
    llama.max_tokens = min(data.get("max_tokens", 512), 1024)
    try:
        resp = llama.ask(full_prompt, system)
    except Exception as e:
        return jsonify({"response": f"⚠️ AI error: {str(e)}. Groq mode: {llama.forced_mode or llama.mode}, API key: {'set' if GROQ_KEY else 'missing'}"})
    llama.max_tokens = old_max

    if resp is None:
        return jsonify({"response": f"⚠️ AI not responding. Mode: {llama.forced_mode or llama.mode}, Groq key: {'set' if GROQ_KEY else 'missing'}, Ollama: {'checking...' if llama.check() else 'not available'}"})
        gr = llama.groq_remaining
        msg = "⚠️ Groq 70B rate limit reached. "
        msg += f"Resets in {gr.get('reset_requests', 'a few minutes')}. "
        msg += "Using local Ollama instead or try again later."
        return jsonify({"response": msg, "rate_limited": True, "groq_remaining": gr})

    memories = []
    if resp:
        memos = re.findall(r'\[MEMO:([^:]+):([^\]]+)\]', resp)
        resp = re.sub(r'\s*\[MEMO:[^\]]+\]', '', resp).strip()
        for mtype, mlabel in memos:
            mtype = mtype.strip().lower()
            mlabel = mlabel.strip()
            if mtype and mlabel:
                memories.append({"type": mtype, "label": mlabel})
                try:
                    graph.add_node(mtype, mlabel)
                    vmem.add(f"{mlabel}", metadata={"type": mtype, "source": "chat"})
                except:
                    pass

    return jsonify({"response": resp, "memories": memories})

@app.route("/api/weekly-data")
def api_weekly_data():
    reports = db.weekly_reports()
    return jsonify(reports)

@app.route("/api/daily-log")
def api_daily_log():
    return jsonify(db.daily_log())

@app.route("/api/config", methods=["GET"])
def api_config():
    cfg = load_config()
    return jsonify(cfg)

@app.route("/api/config", methods=["POST"])
def api_save_config():
    data = request.json
    global llama
    cfg = load_config()
    for section, values in data.items():
        if section in cfg and isinstance(cfg[section], dict):
            cfg[section].update(values)
        else:
            cfg[section] = values
    save_config(cfg)
    llama = LlamaEngine()
    return jsonify({"ok": True})

# ─── Code Agent ───────────────────────────────────────────────
IGNORE_DIRS = {'node_modules', '__pycache__', '.git', 'dist', 'backups', 'data', '.venv', 'venv', 'android'}
IGNORE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.mp4', '.mp3', '.zip', '.pyc', '.gguf', '.bin'}

def safe_path(path):
    full = os.path.normpath(os.path.join(BASE_DIR, path))
    if not full.startswith(os.path.normpath(BASE_DIR)):
        return None
    return full

@app.route("/api/code/tree")
def api_code_tree():
    result = []
    try:
        for root, dirs, files in os.walk(BASE_DIR):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            rel = os.path.relpath(root, BASE_DIR)
            parts = rel.split(os.sep) if rel != '.' else []
            if parts and (parts[0] in IGNORE_DIRS or parts[0].startswith('.')):
                continue
            for f in sorted(files):
                ext = os.path.splitext(f)[1].lower()
                if ext in IGNORE_EXTS or f.startswith('.'):
                    continue
                if rel == '.':
                    result.append(f)
                else:
                    result.append(rel.replace(os.sep, '/') + '/' + f)
    except:
        pass
    return jsonify(sorted(result))

@app.route("/api/code/read", methods=["POST"])
def api_code_read():
    data = request.json
    path = safe_path(data.get("path", ""))
    if not path or not os.path.isfile(path):
        return jsonify({"error": "File not found"}), 404
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        return jsonify({"content": content, "path": data["path"]})
    except:
        return jsonify({"error": "Cannot read file"}), 500

@app.route("/api/code/search")
def api_code_search():
    q = request.args.get("q", "")
    if not q:
        return jsonify([])
    results = []
    try:
        for root, dirs, files in os.walk(BASE_DIR):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext in IGNORE_EXTS or f.startswith('.'):
                    continue
                fp = os.path.join(root, f)
                try:
                    with open(fp, "r", encoding="utf-8", errors="ignore") as fh:
                        for i, line in enumerate(fh, 1):
                            if q.lower() in line.lower():
                                rel = os.path.relpath(fp, BASE_DIR)
                                results.append({"file": rel, "line": i, "text": line.rstrip()[:200]})
                except:
                    pass
    except:
        pass
    return jsonify(results[:50])

@app.route("/api/code/graph-context")
def api_code_graph_context():
    g = graph._g()
    nodes = list(g["nodes"].values())
    edges = g["edges"]
    by_type = {}
    for n in nodes:
        t = n["type"]
        if t not in by_type: by_type[t] = []
        by_type[t].append(n["label"])
    summary = {t: by_type[t] for t in by_type}
    summary["total_nodes"] = len(nodes)
    summary["total_edges"] = len(edges)
    summary["vector_memories"] = vmem.count()
    return jsonify(summary)

@app.route("/api/code/write", methods=["POST"])
def api_code_write():
    data = request.json
    path = safe_path(data.get("path", ""))
    if not path:
        return jsonify({"error": "Invalid path"}), 400
    parent = os.path.dirname(path)
    os.makedirs(parent, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(data.get("content", ""))
    return jsonify({"ok": True})

@app.route("/api/memory/search")
def api_memory_search():
    q = request.args.get("q", "")
    if not q:
        return jsonify([])
    results = vmem.search(q, top_k=10, threshold=0.2)
    return jsonify(results)

@app.route("/api/memory/context")
def api_memory_context():
    q = request.args.get("q", "")
    if not q:
        return jsonify({"context": ""})
    ctx = vmem.build_context(q)
    return jsonify({"context": ctx})

@app.route("/api/code/edit", methods=["POST"])
def api_code_edit():
    data = request.json
    path = safe_path(data.get("path", ""))
    if not path or not os.path.isfile(path):
        return jsonify({"error": "File not found"}), 404
    old = data.get("oldString", "")
    new = data.get("newString", "")
    replace_all = data.get("replaceAll", False)
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        if replace_all:
            if old not in content:
                return jsonify({"error": "String not found"}), 400
            new_content = content.replace(old, new)
        else:
            if content.count(old) > 1:
                return jsonify({"error": "Multiple matches, use replaceAll or more context"}), 400
            if old not in content:
                return jsonify({"error": "String not found"}), 400
            new_content = content.replace(old, new, 1)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/chat/history")
def api_chat_history():
    session_id = request.args.get("session_id", "default")
    limit = min(int(request.args.get("limit", 50)), 200)
    from agent.supabase_db import supabase_available, get_client
    if not supabase_available():
        return jsonify([])
    client = get_client()
    res = client.table("chat_history").select("role,content,created_at").eq("session_id", session_id).order("created_at", desc=False).limit(limit).execute()
    return jsonify(res.data or [])

@app.route("/api/chat/save", methods=["POST"])
def api_chat_save():
    data = request.json
    session_id = data.get("session_id", "default")
    messages = data.get("messages", [])
    from agent.supabase_db import supabase_available, get_client
    if not supabase_available():
        return jsonify({"ok": False, "error": "no cloud"})
    client = get_client()
    rows = [{"session_id": session_id, "role": m["role"], "content": m["content"]} for m in messages if m.get("role") and m.get("content")]
    if rows:
        client.table("chat_history").insert(rows).execute()
    return jsonify({"ok": True, "saved": len(rows)})

@app.route("/api/chat/clear", methods=["POST"])
def api_chat_clear():
    session_id = request.json.get("session_id", "default") if request.json else "default"
    from agent.supabase_db import supabase_available, get_client
    if not supabase_available():
        return jsonify({"ok": False})
    client = get_client()
    client.table("chat_history").delete().eq("session_id", session_id).execute()
    return jsonify({"ok": True})

def open_browser():
    webbrowser.open("http://127.0.0.1:5555")

def main():
    port = int(os.environ.get("PORT", 5555))
    host = os.environ.get("HOST", "127.0.0.1")
    print(f"  GROQ_KEY set: {bool(GROQ_KEY)}")
    print(f"  AI auto-enabled: {llama.enabled}, mode: {llama.mode}, forced: {llama.forced_mode}")
    threading.Thread(target=open_browser, daemon=True).run()
    print(f"  Aman's Study Agent UI: http://{host}:{port}")
    app.run(host=host, port=port, debug=False, use_reloader=False)

if __name__ == "__main__":
    main()
