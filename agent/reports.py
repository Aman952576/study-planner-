from datetime import datetime, date
from .db import JSONDB
from .reality import RealityLayer
from .backlog import AntiBacklogGuardian
from .graphrag import GraphRAG
from .scheduler import Scheduler
from .llama import LlamaEngine

class ReportGenerator:
    def __init__(self, db: JSONDB, reality: RealityLayer, backlog: AntiBacklogGuardian,
                 graph: GraphRAG, scheduler: Scheduler, llama: LlamaEngine):
        self.db = db
        self.reality = reality
        self.backlog = backlog
        self.graph = graph
        self.scheduler = scheduler
        self.llama = llama

    def daily_brief(self):
        backlog_report = self.backlog.report()
        plan = self.scheduler.plan_day()
        lines = []
        lines.append("=" * 50)
        lines.append(f"  DAILY BRIEF - {date.today().isoformat()}")
        lines.append("=" * 50)
        lines.append(f"  Tasks today: {len(plan['planned_tasks'])} ({plan['total_planned_hours']}h)")
        for t in plan["planned_tasks"]:
            lines.append(f"    - {t['title']} ({t['hours']}h)")
        if backlog_report["backlog_traps"] > 0:
            lines.append(f"\n  [!] BACKLOG TRAPS: {backlog_report['backlog_traps']}")
            for tr in backlog_report["traps"][:3]:
                lines.append(f"    {tr['message']}")
        if plan["topics_yesterday"]:
            lines.append(f"\n  Yesterday's topics: {', '.join(plan['topics_yesterday'])}")
        lines.append("=" * 50)
        return "\n".join(lines)

    def weekly_report(self):
        weekly = self.reality.generate_weekly_report()
        backlog_report = self.backlog.report()
        ws = self.scheduler.weekly_summary()
        graph_summary = self.graph.weak_spot_summary()
        opp_summary = self.graph.opportunity_summary()

        lines = []
        lines.append("=" * 60)
        lines.append(f"  WEEKLY REPORT - {weekly['week_start']} to {weekly['week_end']}")
        lines.append("=" * 60)
        lines.append(f"\n  [*] STUDY STATS")
        lines.append(f"     Hours planned: {weekly['planned_hours']}h")
        lines.append(f"     Hours actual:  {weekly['actual_hours']}h")
        lines.append(f"     Estimation error: {weekly['estimation_error_pct']}%")
        lines.append(f"     Actual study: {ws['total_hours']}h across {len(ws['unique_topics'])} topics")
        if weekly.get("bias_analysis"):
            b = weekly["bias_analysis"]
            lines.append(f"\n  [*] CUMULATIVE BIAS ({b['weeks_analyzed']} weeks)")
            lines.append(f"     Avg error: {b['average_error_pct']}% ({b['trend']})")
            lines.append(f"     -> {b['recommendation']}")
        lines.append(f"\n  [*] WEAKNESSES TRACKED: {graph_summary['weak_count']}")
        lines.append(f"     Recent: {', '.join(graph_summary['common_weaknesses'][:3])}")
        if opp_summary["count"] > 0:
            lines.append(f"\n  [*] OPPORTUNITIES: {opp_summary['count']} active")
            for o in opp_summary["items"][:3]:
                dl = o["properties"].get("deadline", "No deadline")
                lines.append(f"     - {o['label']} (Deadline: {dl})")
        if backlog_report["warnings"]:
            lines.append(f"\n  [!] BACKLOG: {len(backlog_report['warnings'])} aging tasks")
        lines.append("\n" + "=" * 60)
        return "\n".join(lines)

    def monthly_report(self):
        monthly = self.reality.generate_monthly_report()
        backlog_report = self.backlog.report()
        graph_summary = self.graph.weak_spot_summary()
        ideas_summary = self.graph.research_summary()

        lines = []
        lines.append("=" * 60)
        lines.append(f"  MONTHLY REPORT - {monthly['month']}")
        lines.append("=" * 60)
        lines.append(f"\n  [*] ESTIMATION ACCURACY")
        lines.append(f"     Planned: {monthly['planned_hours']}h | Actual: {monthly['actual_hours']}h")
        lines.append(f"     Error: {monthly['estimation_error_pct']}%")
        if monthly.get("bias_analysis") and monthly["bias_analysis"]["recommendation"]:
            lines.append(f"     -> {monthly['bias_analysis']['recommendation']}")
        lines.append(f"\n  [*] KNOWLEDGE GRAPH")
        lines.append(f"     Weaknesses: {graph_summary['weak_count']}")
        lines.append(f"     Mistakes logged: {graph_summary['mistake_count']}")
        lines.append(f"     Topics tracked: {graph_summary['topic_count']}")
        lines.append(f"     Research ideas: {ideas_summary['count']}")
        lines.append(f"\n  [!] BACKLOG STATUS: {backlog_report['total_aging_tasks']} aging tasks")
        if backlog_report["critical_count"] > 0:
            lines.append(f"     [!] {backlog_report['critical_count']} CRITICAL tasks need immediate attention")
        lines.append(f"\n  [*] BACKUP: Monthly full export recommended")
        lines.append("\n" + "=" * 60)
        return "\n".join(lines)
