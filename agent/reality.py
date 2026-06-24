from datetime import datetime, date, timedelta
from .db import JSONDB
from config import load_config

class RealityLayer:
    def __init__(self, db: JSONDB):
        self.db = db

    def _get_week_range(self, dt=None):
        if dt is None:
            dt = date.today()
        start = dt - timedelta(days=dt.weekday())
        end = start + timedelta(days=6)
        return start.isoformat(), end.isoformat()

    def compute_weekly_error(self):
        todos = self.db.todos()
        week_start, week_end = self._get_week_range()
        week_todos = []
        for t in todos:
            created = t["created_at"][:10]
            if week_start <= created <= week_end:
                week_todos.append(t)
        planned = sum(t.get("estimated_hours", 0) for t in week_todos)
        actual = sum(t.get("actual_hours", 0) for t in week_todos if t["status"] == "done")
        error_pct = 0
        if planned > 0:
            error_pct = round(((actual - planned) / planned) * 100, 1)
        return {
            "week_start": week_start,
            "week_end": week_end,
            "planned_hours": round(planned, 1),
            "actual_hours": round(actual, 1),
            "estimation_error_pct": error_pct,
            "tasks_planned": len(week_todos),
            "tasks_done": len([t for t in week_todos if t["status"] == "done"])
        }

    def compute_monthly_error(self):
        todos = self.db.todos()
        now = date.today()
        month_start = now.replace(day=1).isoformat()
        month_end = now.isoformat()
        month_todos = [t for t in todos if month_start <= t["created_at"][:10] <= month_end]
        planned = sum(t.get("estimated_hours", 0) for t in month_todos)
        actual = sum(t.get("actual_hours", 0) for t in month_todos if t["status"] == "done")
        error_pct = 0
        if planned > 0:
            error_pct = round(((actual - planned) / planned) * 100, 1)
        return {
            "month": now.strftime("%Y-%m"),
            "planned_hours": round(planned, 1),
            "actual_hours": round(actual, 1),
            "estimation_error_pct": error_pct,
            "tasks_planned": len(month_todos),
            "tasks_done": len([t for t in month_todos if t["status"] == "done"])
        }

    def compute_cumulative_bias(self):
        reports = self.db.weekly_reports()
        if len(reports) < 2:
            return None
        errors = [r["estimation_error_pct"] for r in reports if "estimation_error_pct" in r]
        if not errors:
            return None
        avg_error = sum(errors) / len(errors)
        recommendation = None
        if avg_error < -20:
            recommendation = "Reduce future planning by 20%. You consistently overestimate capacity."
        elif avg_error > 20:
            recommendation = "Increase planning by 15%. You consistently underestimate capacity."
        elif abs(avg_error) <= 5:
            recommendation = "Estimation is accurate. Keep it up."
        return {
            "weeks_analyzed": len(errors),
            "average_error_pct": round(avg_error, 1),
            "trend": "overestimating" if avg_error < 0 else "underestimating",
            "recommendation": recommendation,
            "current_bias": round(avg_error / 100, 2)
        }

    def generate_weekly_report(self):
        weekly = self.compute_weekly_error()
        bias = self.compute_cumulative_bias()
        report = {
            "report_id": f"W{datetime.now().strftime('%Y_%U')}",
            "type": "weekly",
            "generated_at": datetime.now().isoformat(),
            **weekly,
            "bias_analysis": bias
        }
        reports = self.db.weekly_reports()
        reports.append(report)
        self.db.save_weekly_reports(reports)
        return report

    def generate_monthly_report(self):
        monthly = self.compute_monthly_error()
        bias = self.compute_cumulative_bias()
        report = {
            "report_id": f"M{datetime.now().strftime('%Y_%m')}",
            "type": "monthly",
            "generated_at": datetime.now().isoformat(),
            **monthly,
            "bias_analysis": bias
        }
        reports = self.db.monthly_reports()
        reports.append(report)
        self.db.save_monthly_reports(reports)
        return report
