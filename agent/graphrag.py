import json, uuid
from datetime import datetime
from .db import JSONDB
from .supabase_db import SupabaseGraph, supabase_available

NODE_TYPES = {"weakness", "mistake", "opportunity", "research_idea", "topic", "recovery", "project", "note", "achievement", "goal", "resource", "insight", "habit", "strategy"}

class GraphRAG:
    def __init__(self, db: JSONDB):
        self.db = db
        self._supa = SupabaseGraph() if supabase_available() else None

    def _g(self):
        if self._supa:
            return {"nodes": self._supa.all_nodes(), "edges": []}
        return self.db.graph()

    def add_node(self, node_type, label, properties=None):
        assert node_type in NODE_TYPES, f"Invalid type: {node_type}"
        if self._supa:
            return self._supa.add_node(node_type, label, properties)
        g = self._g()
        node_id = f"{node_type}_{uuid.uuid4().hex[:8]}"
        g["nodes"][node_id] = {
            "id": node_id,
            "type": node_type,
            "label": label,
            "properties": properties or {},
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        self.db.save_graph(g)
        return node_id

    def add_edge(self, from_id, to_id, relation, weight=1.0):
        if self._supa:
            return
        g = self._g()
        g["edges"].append({
            "from": from_id,
            "to": to_id,
            "relation": relation,
            "weight": weight,
            "created_at": datetime.now().isoformat()
        })
        self.db.save_graph(g)

    def get_node(self, node_id):
        if self._supa:
            return self._supa.get_node(node_id)
        g = self._g()
        return g["nodes"].get(node_id)

    def query(self, node_type=None, label_contains=None, limit=10):
        if self._supa:
            return self._supa.query(node_type, label_contains, limit)
        g = self._g()
        results = []
        for nid, node in g["nodes"].items():
            if node_type and node["type"] != node_type:
                continue
            if label_contains and label_contains.lower() not in node["label"].lower():
                continue
            results.append(node)
        results.sort(key=lambda x: x["created_at"], reverse=True)
        return results[:limit]

    def get_connected(self, node_id, max_depth=2):
        if self._supa:
            return []
        g = self._g()
        visited = set()
        def walk(nid, depth):
            if nid in visited or depth > max_depth:
                return []
            visited.add(nid)
            result = [nid]
            for e in g["edges"]:
                if e["from"] == nid:
                    result.extend(walk(e["to"], depth + 1))
                elif e["to"] == nid:
                    result.extend(walk(e["from"], depth + 1))
            return result
        connected = walk(node_id, 0)
        return [g["nodes"].get(nid) for nid in connected if g["nodes"].get(nid)]

    def weak_spot_summary(self):
        if self._supa:
            return self._supa.weak_spot_summary()
        g = self._g()
        weaknesses = [n for n in g["nodes"].values() if n["type"] == "weakness"]
        mistakes = [n for n in g["nodes"].values() if n["type"] == "mistake"]
        topics = [n for n in g["nodes"].values() if n["type"] == "topic"]
        edges = g["edges"]
        summary = {
            "weak_count": len(weaknesses),
            "mistake_count": len(mistakes),
            "topic_count": len(topics),
            "common_weaknesses": [w["label"] for w in weaknesses[-5:]],
            "recent_mistakes": [m["label"] for m in mistakes[-5:]],
            "edge_count": len(edges),
        }
        return summary

    def opportunity_summary(self):
        if self._supa:
            return self._supa.opportunity_summary()
        g = self._g()
        opps = [n for n in g["nodes"].values() if n["type"] == "opportunity"]
        return {
            "count": len(opps),
            "items": sorted(opps, key=lambda x: x["properties"].get("deadline", "9999"), reverse=False)[:10]
        }

    def research_summary(self):
        if self._supa:
            return self._supa.research_summary()
        g = self._g()
        ideas = [n for n in g["nodes"].values() if n["type"] == "research_idea"]
        return {
            "count": len(ideas),
            "items": sorted(ideas, key=lambda x: x["created_at"], reverse=True)[:10]
        }

    def add_weakness(self, label, details=""):
        nid = self.add_node("weakness", label, {"details": details, "occurrences": 1})
        return nid

    def add_mistake(self, label, details=""):
        nid = self.add_node("mistake", label, {"details": details, "date": datetime.now().isoformat()})
        return nid

    def add_opportunity(self, label, deadline=None, requirements=None, status="active"):
        props = {
            "deadline": deadline or "",
            "requirements": requirements or [],
            "status": status
        }
        nid = self.add_node("opportunity", label, props)
        return nid

    def add_idea(self, title, topics=None, status="active"):
        props = {
            "title": title,
            "status": status,
            "related_topics": topics or []
        }
        nid = self.add_node("research_idea", title, props)
        return nid

    def add_topic(self, label):
        nid = self.add_node("topic", label)
        return nid

    def link_topic_idea(self, topic_label, idea_id):
        g = self._g()
        topic_id = None
        for nid, node in g["nodes"].items():
            if node["type"] == "topic" and node["label"].lower() == topic_label.lower():
                topic_id = nid
                break
        if not topic_id:
            topic_id = self.add_topic(topic_label)
        self.add_edge(topic_id, idea_id, "related_to")
