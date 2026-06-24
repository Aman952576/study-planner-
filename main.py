import sys, json, os
from datetime import datetime, date
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

class StudyAgent:
    def __init__(self):
        self.db = JSONDB()
        self.graph = GraphRAG(self.db)
        self.todo = TodoManager(self.db)
        self.reality = RealityLayer(self.db)
        self.backlog = AntiBacklogGuardian(self.db)
        self.research = ResearchLayer(self.db, self.graph)
        self.opportunity = OpportunityGraph(self.db, self.graph)
        self.scheduler = Scheduler(self.db, self.todo)
        self.llama = LlamaEngine()
        self.reporter = ReportGenerator(self.db, self.reality, self.backlog,
                                        self.graph, self.scheduler, self.llama)

    def cmd_add(self, args):
        title = " ".join(args)
        tid = self.todo.add(title)
        print(f"  [OK] Added: {title} [{tid}]")

    def cmd_tasks(self, args):
        status = args[0] if args else "active"
        if status == "active":
            tasks = self.todo.active()
        elif status == "all":
            tasks = self.db.todos()
        else:
            tasks = [t for t in self.db.todos() if t["status"] == status]
        if not tasks:
            print("  No tasks found.")
            return
        print(f"  {'ID':<12} {'TITLE':<30} {'STATUS':<12} {'EST':<5} {'DAYS':<5}")
        print("  " + "-" * 64)
        for t in tasks:
            days = (datetime.now() - datetime.fromisoformat(t["created_at"])).days
            print(f"  {t['id']:<12} {t['title'][:28]:<30} {t['status']:<12} {t['estimated_hours']:<5} {days:<5}")

    def cmd_done(self, args):
        tid = args[0] if args else ""
        hours = float(args[1]) if len(args) > 1 else 0
        self.todo.complete(tid, hours)
        print(f"  [OK] Completed: {tid}")

    def cmd_postpone(self, args):
        tid = args[0] if args else ""
        self.todo.postpone(tid)
        print(f"  [..] Postponed: {tid}")

    def cmd_study(self, args):
        hours = float(args[0]) if args else 0
        topics = args[1:] if len(args) > 1 else []
        self.scheduler.log_study_session(hours, topics)
        print(f"  [OK] Logged {hours}h studying: {', '.join(topics)}")

    def cmd_weakness(self, args):
        label = " ".join(args)
        nid = self.graph.add_weakness(label)
        print(f"  [OK] Logged weakness: {label} [{nid}]")

    def cmd_mistake(self, args):
        label = " ".join(args)
        nid = self.graph.add_mistake(label)
        print(f"  [OK] Logged mistake: {label} [{nid}]")

    def cmd_idea(self, args):
        title = " ".join(args)
        iid = self.research.add_idea(title)
        print(f"  [OK] Added research idea: {title} [{iid}]")

    def cmd_opportunity(self, args):
        if len(args) < 1:
            print("  Usage: opportunity <title> [deadline] [req1,req2,...]")
            return
        title = args[0]
        deadline = args[1] if len(args) > 1 else ""
        reqs = args[2].split(",") if len(args) > 2 else []
        oid = self.opportunity.add(title, deadline=deadline, requirements=reqs)
        print(f"  [OK] Added opportunity: {title} [{oid}]")

    def cmd_daily(self, args):
        print(self.reporter.daily_brief())

    def cmd_weekly(self, args):
        print(self.reporter.weekly_report())

    def cmd_monthly(self, args):
        print(self.reporter.monthly_report())

    def cmd_backup(self, args):
        btype = args[0] if args else "daily"
        path = self.db.backup(btype)
        print(f"  [OK] {btype.capitalize()} backup saved to: {path}")

    def cmd_llama(self, args):
        if not self.llama.enabled:
            print("  Llama 8B is disabled. Enable it: python main.py llama-on")
            return
        if self.llama.mode == "direct":
            if not self.llama.model_path:
                print("  [XX] No model_path set in config.json")
                return
            if not os.path.isfile(self.llama.model_path):
                print(f"  [XX] File not found: {self.llama.model_path}")
                return
            ok = self.llama._load_direct()
            if ok:
                print(f"  [OK] Direct GGUF model loaded: {self.llama.model_path}")
            else:
                print("  [XX] Failed to load GGUF. Install llama-cpp-python: pip install llama-cpp-python")
            return
        if self.llama.check():
            print("  [OK] Llama 8B (Ollama) is running and reachable")
        else:
            print("  [XX] Cannot reach Ollama. Is it running? (ollama serve)")

    def cmd_llama_on(self, args):
        cfg = load_config()
        model_path = " ".join(args) if args else ""
        if model_path:
            resolved = os.path.abspath(model_path)
            if os.path.isfile(resolved):
                cfg["llama"]["model_path"] = resolved
                cfg["llama"]["mode"] = "direct"
                print(f"  Using direct GGUF: {resolved}")
            else:
                print(f"  [XX] File not found: {resolved}")
                return
        else:
            cfg["llama"]["mode"] = "ollama"
        cfg["llama"]["enabled"] = True
        save_config(cfg)
        self.llama = LlamaEngine()
        print("  [OK] Llama 8B enabled (Ollama mode)")
        print("  Make sure Ollama is running: ollama serve")

    def cmd_prioritize(self, args):
        if not self.llama.enabled:
            print("  Enable Llama first: python main.py llama-on")
            return
        tasks = self.todo.active()
        prioritized = self.llama.prioritize(tasks)
        print(f"  Prioritized {len(prioritized)} tasks using Llama 8B:")
        for i, t in enumerate(prioritized[:5], 1):
            print(f"    {i}. [{t['priority']}] {t['title']}")

    def cmd_model(self, args):
        cfg = load_config()
        path = " ".join(args) if args else ""
        if not path:
            print(f"  Current model path: {cfg['llama'].get('model_path', '(not set)')}")
            print(f"  Mode: {cfg['llama'].get('mode', 'ollama')}")
            return
        resolved = os.path.abspath(path)
        if not os.path.isfile(resolved):
            print(f"  [XX] File not found: {resolved}")
            return
        cfg["llama"]["model_path"] = resolved
        cfg["llama"]["mode"] = "direct"
        save_config(cfg)
        self.llama = LlamaEngine()
        print(f"  [OK] Model set to: {resolved}")
        print("  Enable it: python main.py llama-on")

    def cmd_scan(self, args):
        report = self.backlog.report()
        print(f"  Backlog Scan:")
        print(f"    Aging tasks: {report['total_aging_tasks']}")
        print(f"    Backlog traps: {report['backlog_traps']}")
        for tr in report["traps"]:
            print(f"    [!] {tr['message']}")

    def cmd_graph(self, args):
        ntype = args[0] if args else None
        if ntype and ntype not in ("weakness", "mistake", "opportunity", "research_idea", "topic", "recovery", "project"):
            print(f"  Types: weakness, mistake, opportunity, research_idea, topic, recovery, project")
            return
        nodes = self.graph.query(node_type=ntype, limit=20) if ntype else list(self.graph._g()["nodes"].values())[:20]
        if not nodes:
            print("  No nodes found.")
            return
        print(f"  {'TYPE':<16} {'LABEL':<35}")
        print("  " + "-" * 51)
        for n in nodes:
            lbl = n["label"][:33]
            print(f"  {n['type']:<16} {lbl:<35}")

    def cmd_stats(self, args):
        stats = self.todo.stats()
        print(f"  Todo Stats:")
        print(f"    Total: {stats['total']} | Done: {stats['done']} | Pending: {stats['pending']} | Postponed: {stats['postponed']}")
        if stats["estimation_accuracy_pct"] is not None:
            print(f"    Estimation accuracy: {stats['estimation_accuracy_pct']}%")
        ws = self.scheduler.weekly_summary()
        print(f"    This week: {ws['total_hours']}h studied ({ws['avg_daily']}h/day)")

    def cmd_help(self, args):
        print("""
  Aman's Study Agent v2 - Commands

  TASKS
    add <title>              Add a new task
    tasks [status]           List tasks (active|all|done|postponed)
    done <id> [hours]        Mark task complete
    postpone <id>            Postpone a task
    scan                     Scan for backlog traps

  STUDY
    study <hours> [topics]   Log study session

  GRAPH
    weakness <label>         Log a weakness
    mistake <label>          Log a mistake
    graph [type]             View knowledge graph

  RESEARCH & OPPORTUNITIES
    idea <title>             Add research idea
    opportunity <title> [deadline] [reqs]  Add opportunity

  REPORTS
    daily                    Daily brief
    weekly                   Weekly report
    monthly                  Monthly report
    stats                    Quick stats

  LLAMA 8B
    llama                    Check Llama status
    llama-on [path]          Enable Llama (with optional GGUF path)
    model [path]             Set/view GGUF model path
    prioritize               AI-prioritize tasks

  SYSTEM
    backup [daily|weekly|monthly]  Backup data
    help                     This help
""")

    def run(self):
        if len(sys.argv) < 2:
            self.cmd_help([])
            return
        cmd = sys.argv[1]
        args = sys.argv[2:]
        cmds = {
            "add": self.cmd_add, "tasks": self.cmd_tasks, "done": self.cmd_done,
            "postpone": self.cmd_postpone, "study": self.cmd_study,
            "weakness": self.cmd_weakness, "mistake": self.cmd_mistake,
            "idea": self.cmd_idea, "opportunity": self.cmd_opportunity,
            "daily": self.cmd_daily, "weekly": self.cmd_weekly, "monthly": self.cmd_monthly,
            "backup": self.cmd_backup, "llama": self.cmd_llama, "llama-on": self.cmd_llama_on,
            "prioritize": self.cmd_prioritize, "scan": self.cmd_scan,
            "model": self.cmd_model,
            "graph": self.cmd_graph, "stats": self.cmd_stats, "help": self.cmd_help,
        }
        handler = cmds.get(cmd)
        if handler:
            handler(args)
        else:
            print(f"  Unknown command: {cmd}")
            self.cmd_help([])

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Launch UI
        import subprocess, webbrowser, time
        flask_proc = subprocess.Popen([sys.executable, '-u', 'app.py'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(2)
        vite_proc = subprocess.Popen(['npx.cmd', 'vite', '--host'], shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(3)
        webbrowser.open('http://localhost:5173')
        print("  AI Study Agent UI launched!")
        print("  Flask backend: http://127.0.0.1:5555")
        print("  Vite frontend: http://localhost:5173")
        print("  Press Ctrl+C to stop.")
        try:
            while True: time.sleep(1)
        except KeyboardInterrupt:
            flask_proc.kill()
            vite_proc.kill()
    else:
        StudyAgent().run()
