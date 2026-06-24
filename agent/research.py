import uuid
from datetime import datetime
from .db import JSONDB
from .graphrag import GraphRAG

class ResearchLayer:
    def __init__(self, db: JSONDB, graph: GraphRAG):
        self.db = db
        self.graph = graph

    def add_idea(self, title, related_topics=None, description=""):
        idea = {
            "idea_id": f"I{uuid.uuid4().hex[:8].upper()}",
            "title": title,
            "description": description,
            "status": "active",
            "related_topics": related_topics or [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "links": []
        }
        ideas = self.db.ideas()
        ideas.append(idea)
        self.db.save_ideas(ideas)
        # Also add to graph
        node_id = self.graph.add_idea(title, related_topics)
        for topic in (related_topics or []):
            self.graph.link_topic_idea(topic, node_id)
        return idea["idea_id"]

    def link_to_topic(self, idea_id, topic):
        ideas = self.db.ideas()
        for idea in ideas:
            if idea["idea_id"] == idea_id:
                if topic not in idea["related_topics"]:
                    idea["related_topics"].append(topic)
                idea["links"].append({
                    "type": "topic",
                    "target": topic,
                    "timestamp": datetime.now().isoformat()
                })
                break
        self.db.save_ideas(ideas)
        # Graph link
        g = self.graph._g()
        for nid, node in g["nodes"].items():
            if node["type"] == "research_idea" and node["label"] == idea_id:
                self.graph.link_topic_idea(topic, nid)
                break

    def update_status(self, idea_id, status):
        ideas = self.db.ideas()
        for idea in ideas:
            if idea["idea_id"] == idea_id:
                idea["status"] = status
                idea["updated_at"] = datetime.now().isoformat()
                break
        self.db.save_ideas(ideas)

    def search(self, keyword=None, status=None):
        ideas = self.db.ideas()
        results = ideas
        if keyword:
            kw = keyword.lower()
            results = [i for i in results if kw in i["title"].lower() or kw in " ".join(i["related_topics"]).lower()]
        if status:
            results = [i for i in results if i["status"] == status]
        return sorted(results, key=lambda x: x["created_at"], reverse=True)

    def get_active(self):
        return self.search(status="active")
