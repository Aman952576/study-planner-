import uuid
from datetime import datetime, date, timedelta
from .db import JSONDB

class TodoManager:
    def __init__(self, db: JSONDB):
        self.db = db

    def add(self, title, category="general", estimated_hours=1.0, priority=3):
        todo = {
            "id": uuid.uuid4().hex[:12],
            "title": title,
            "category": category,
            "status": "pending",
            "priority": min(max(priority, 1), 5),
            "estimated_hours": estimated_hours,
            "actual_hours": 0.0,
            "created_at": datetime.now().isoformat(),
            "completed_at": None,
            "postponed_count": 0,
            "days_postponed": 0,
            "last_postponed": None,
            "tags": [],
        }
        self.db.add_todo(todo)
        return todo["id"]

    def complete(self, todo_id, actual_hours=None):
        self.db.update_todo(todo_id, {
            "status": "done",
            "completed_at": datetime.now().isoformat(),
            "actual_hours": actual_hours or 0
        })

    def postpone(self, todo_id):
        todo = self.get(todo_id)
        if not todo:
            return
        days = (datetime.now() - datetime.fromisoformat(todo["created_at"])).days
        self.db.update_todo(todo_id, {
            "status": "postponed",
            "last_postponed": datetime.now().isoformat(),
            "postponed_count": todo["postponed_count"] + 1,
            "days_postponed": max(days, todo["days_postponed"])
        })

    def get(self, todo_id):
        for t in self.db.todos():
            if t["id"] == todo_id:
                return t
        return None

    def active(self):
        return [t for t in self.db.todos() if t["status"] in ("pending", "in_progress")]

    def overdue(self, days=7):
        now = datetime.now()
        result = []
        for t in self.active():
            created = datetime.fromisoformat(t["created_at"])
            if (now - created).days >= days:
                result.append(t)
        return result

    def by_category(self, category):
        return [t for t in self.db.todos() if t["category"] == category]

    def stats(self):
        todos = self.db.todos()
        total = len(todos)
        done = len([t for t in todos if t["status"] == "done"])
        pending = len([t for t in todos if t["status"] == "pending"])
        postponed = len([t for t in todos if t["status"] == "postponed"])
        total_est = sum(t.get("estimated_hours", 0) for t in todos if t["status"] == "done")
        total_act = sum(t.get("actual_hours", 0) for t in todos if t["status"] == "done")
        estimation_accuracy = None
        if total_est > 0:
            estimation_accuracy = round((total_act / total_est) * 100, 1)
        return {
            "total": total,
            "done": done,
            "pending": pending,
            "postponed": postponed,
            "total_estimated_hours": round(total_est, 1),
            "total_actual_hours": round(total_act, 1),
            "estimation_accuracy_pct": estimation_accuracy
        }
