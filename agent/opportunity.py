import uuid
from datetime import datetime
from .db import JSONDB
from .graphrag import GraphRAG

class OpportunityGraph:
    def __init__(self, db: JSONDB, graph: GraphRAG):
        self.db = db
        self.graph = graph

    def add(self, title, opportunity_type="internship", deadline=None, requirements=None, url="", notes=""):
        opp = {
            "id": f"OP{uuid.uuid4().hex[:8].upper()}",
            "title": title,
            "type": opportunity_type,
            "deadline": deadline or "",
            "requirements": requirements or [],
            "url": url,
            "notes": notes,
            "status": "active",
            "created_at": datetime.now().isoformat(),
        }
        opps = self.db.opportunities()
        opps.append(opp)
        self.db.save_opportunities(opps)
        # Add to graph
        node_id = self.graph.add_opportunity(title, deadline, requirements)
        if requirements:
            for req in requirements:
                g = self.graph._g()
                found = False
                for nid, node in g["nodes"].items():
                    if node["type"] == "topic" and node["label"].lower() == req.lower():
                        self.graph.add_edge(node_id, nid, "requires")
                        found = True
                        break
                if not found:
                    tid = self.graph.add_topic(req)
                    self.graph.add_edge(node_id, tid, "requires")
        return opp["id"]

    def upcoming(self, limit=10):
        opps = self.db.opportunities()
        active = [o for o in opps if o["status"] == "active"]
        with_deadline = [o for o in active if o["deadline"]]
        without_deadline = [o for o in active if not o["deadline"]]
        with_deadline.sort(key=lambda x: x["deadline"])
        return (with_deadline + without_deadline)[:limit]

    def by_requirement_status(self, skills_known=None):
        opps = self.db.opportunities()
        skills_known = skills_known or []
        result = []
        for o in opps:
            missing = [r for r in o.get("requirements", []) if r.lower() not in [s.lower() for s in skills_known]]
            result.append({**o, "missing_requirements": missing, "ready": len(missing) == 0})
        return sorted(result, key=lambda x: len(x["missing_requirements"]))

    def close(self, opp_id, outcome=""):
        opps = self.db.opportunities()
        for o in opps:
            if o["id"] == opp_id:
                o["status"] = "closed"
                o["outcome"] = outcome
                o["closed_at"] = datetime.now().isoformat()
                break
        self.db.save_opportunities(opps)
