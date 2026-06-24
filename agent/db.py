import json, os, shutil
from datetime import datetime, date
from pathlib import Path
from config import DATA_DIR, BACKUP_DIR

class JSONDB:
    def __init__(self):
        self.base = DATA_DIR
        self.files = {
            "todos": self.base / "todos.json",
            "daily_log": self.base / "daily_log.json",
            "graph": self.base / "graph.json",
            "ideas": self.base / "ideas.json",
            "opportunities": self.base / "opportunities.json",
            "weekly_reports": self.base / "weekly_reports.json",
            "monthly_reports": self.base / "monthly_reports.json",
        }
        self._ensure_files()

    def _ensure_files(self):
        defaults = {
            "todos": [],
            "daily_log": [],
            "graph": {"nodes": {}, "edges": []},
            "ideas": [],
            "opportunities": [],
            "weekly_reports": [],
            "monthly_reports": [],
        }
        for name, path in self.files.items():
            if not path.exists():
                path.write_text(json.dumps(defaults.get(name, []), indent=2, ensure_ascii=False), encoding="utf-8")

    def _read(self, key):
        path = self.files[key]
        return json.loads(path.read_text(encoding="utf-8"))

    def _write(self, key, data):
        path = self.files[key]
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    def todos(self): return self._read("todos")
    def save_todos(self, data): self._write("todos", data)

    def daily_log(self): return self._read("daily_log")
    def save_daily_log(self, data): self._write("daily_log", data)

    def graph(self): return self._read("graph")
    def save_graph(self, data): self._write("graph", data)

    def ideas(self): return self._read("ideas")
    def save_ideas(self, data): self._write("ideas", data)

    def opportunities(self): return self._read("opportunities")
    def save_opportunities(self, data): self._write("opportunities", data)

    def weekly_reports(self): return self._read("weekly_reports")
    def save_weekly_reports(self, data): self._write("weekly_reports", data)

    def monthly_reports(self): return self._read("monthly_reports")
    def save_monthly_reports(self, data): self._write("monthly_reports", data)

    def add_todo(self, todo):
        todos = self.todos()
        todos.append(todo)
        self.save_todos(todos)

    def update_todo(self, todo_id, updates):
        todos = self.todos()
        for t in todos:
            if t["id"] == todo_id:
                t.update(updates)
                break
        self.save_todos(todos)

    def add_daily_entry(self, entry):
        log = self.daily_log()
        # Replace if same date exists
        for i, e in enumerate(log):
            if e["date"] == entry["date"]:
                log[i] = entry
                self.save_daily_log(log)
                return
        log.append(entry)
        self.save_daily_log(log)

    def get_daily(self, dt=None):
        if dt is None:
            dt = date.today().isoformat()
        log = self.daily_log()
        for e in log:
            if e["date"] == dt:
                return e
        return None

    def backup(self, backup_type="daily"):
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = BACKUP_DIR / f"{backup_type}_{ts}"
        backup_dir.mkdir(parents=True, exist_ok=True)
        for name, path in self.files.items():
            if path.exists():
                shutil.copy2(path, backup_dir / f"{name}.json")
        if backup_type == "monthly":
            # Full export
            full = {}
            for name, path in self.files.items():
                if path.exists():
                    full[name] = json.loads(path.read_text(encoding="utf-8"))
            (backup_dir / "full_export.json").write_text(
                json.dumps(full, indent=2, ensure_ascii=False), encoding="utf-8"
            )
        return str(backup_dir)
