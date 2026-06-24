from datetime import datetime, date, timedelta
from .db import JSONDB
from .todo import TodoManager
from config import load_config

class Scheduler:
    def __init__(self, db: JSONDB, todo: TodoManager):
        self.db = db
        self.todo = todo
        cfg = load_config()
        self.max_daily = cfg["scheduler"]["max_daily_hours"]
        self.default_bias = cfg["scheduler"]["default_estimation_bias"]

    def plan_day(self, dt=None):
        if dt is None:
            dt = date.today()
        todos = self.todo.active()
        daily_entry = self.db.get_daily(dt.isoformat())
        if daily_entry:
            studied = daily_entry.get("topics_studied", [])
        else:
            studied = []
        planned = []
        hours_used = 0
        for t in todos:
            adj_hours = t["estimated_hours"] * self.default_bias
            if hours_used + adj_hours <= self.max_daily:
                planned.append(t)
                hours_used += adj_hours
        return {
            "date": dt.isoformat(),
            "planned_tasks": [{"id": t["id"], "title": t["title"], "hours": round(t["estimated_hours"] * self.default_bias, 1)} for t in planned],
            "total_planned_hours": round(hours_used, 1),
            "topics_yesterday": studied,
            "max_capacity": self.max_daily,
            "bias_applied": self.default_bias
        }

    def log_study_session(self, hours, topics, notes=""):
        dt = date.today().isoformat()
        existing = self.db.get_daily(dt)
        if existing:
            existing["hours_studied"] = existing.get("hours_studied", 0) + hours
            existing["topics_studied"] = list(set(existing.get("topics_studied", []) + topics))
            existing["notes"] = notes or existing.get("notes", "")
            self.db.add_daily_entry(existing)
        else:
            self.db.add_daily_entry({
                "date": dt,
                "hours_studied": hours,
                "topics_studied": topics,
                "tasks_completed": [],
                "notes": notes
            })

    def weekly_summary(self):
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        total_hours = 0
        total_topics = set()
        for i in range(7):
            d = (week_start + timedelta(days=i)).isoformat()
            entry = self.db.get_daily(d)
            if entry:
                total_hours += entry.get("hours_studied", 0)
                total_topics.update(entry.get("topics_studied", []))
        return {
            "week": today.strftime("%Y-W%W"),
            "total_hours": round(total_hours, 1),
            "unique_topics": list(total_topics),
            "avg_daily": round(total_hours / 7, 1) if total_hours > 0 else 0
        }
