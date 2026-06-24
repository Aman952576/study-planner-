from datetime import datetime, date
from .db import JSONDB
from config import load_config

class AntiBacklogGuardian:
    def __init__(self, db: JSONDB):
        self.db = db
        cfg = load_config()
        self.warning_days = cfg["scheduler"]["backlog_warning_days"]

    def check(self):
        todos = self.db.todos()
        warnings = []
        now = datetime.now()
        for t in todos:
            if t["status"] not in ("done", "cancelled"):
                created = datetime.fromisoformat(t["created_at"])
                days_since = (now - created).days
                if days_since >= self.warning_days:
                    warnings.append({
                        "id": t["id"],
                        "title": t["title"],
                        "days_unresolved": days_since,
                        "postponed_count": t["postponed_count"],
                        "severity": "HIGH" if days_since >= self.warning_days * 2 else "WARNING"
                    })
        return sorted(warnings, key=lambda x: x["days_unresolved"], reverse=True)

    def scan_backlog_trap(self):
        warnings = self.check()
        traps = []
        postpone_counts = {}
        for w in warnings:
            key = w["postponed_count"]
            postpone_counts[key] = postpone_counts.get(key, 0) + 1
        for w in warnings:
            if w["postponed_count"] >= 2:
                traps.append({
                    **w,
                    "message": f"'{w['title']}' postponed {w['postponed_count']} times. Risk of backlog trap detected."
                })
        return traps

    def report(self):
        warnings = self.check()
        traps = self.scan_backlog_trap()
        return {
            "total_aging_tasks": len(warnings),
            "backlog_traps": len(traps),
            "warnings": warnings[:10],
            "traps": traps[:5],
            "critical_count": len([w for w in warnings if w["severity"] == "HIGH"]),
            "action_needed": len(traps) > 0 or len(warnings) > 3
        }
