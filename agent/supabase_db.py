import os, uuid
from datetime import datetime
from sentence_transformers import SentenceTransformer

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

_available = None

def supabase_available():
    global _available
    if _available is not None:
        return _available
    _available = bool(SUPABASE_URL and SUPABASE_KEY)
    return _available

def get_client():
    if not supabase_available():
        return None
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_KEY)

_embed_model = None
def get_embedder():
    global _embed_model
    if _embed_model is None:
        _embed_model = SentenceTransformer('all-MiniLM-L6-v2')
    return _embed_model


class SupabaseGraph:
    def __init__(self):
        self._client = None if not supabase_available() else get_client()

    def add_node(self, node_type, label, properties=None):
        if not self._client:
            return None
        node_id = f"{node_type}_{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow().isoformat()
        data = {
            "id": node_id,
            "type": node_type,
            "label": label,
            "properties": properties or {},
            "created_at": now,
            "updated_at": now
        }
        self._client.table("graph_nodes").insert(data).execute()
        return node_id

    def get_node(self, node_id):
        if not self._client:
            return None
        res = self._client.table("graph_nodes").select("*").eq("id", node_id).maybe_single().execute()
        return res.data if res.data else None

    def query(self, node_type=None, label_contains=None, limit=10):
        if not self._client:
            return []
        q = self._client.table("graph_nodes").select("*")
        if node_type:
            q = q.eq("type", node_type)
        if label_contains:
            q = q.ilike("label", f"%{label_contains}%")
        q = q.order("created_at", desc=True).limit(limit)
        res = q.execute()
        return res.data if res.data else []

    def all_nodes(self):
        if not self._client:
            return {}
        res = self._client.table("graph_nodes").select("*").execute()
        nodes = {}
        for n in res.data or []:
            nodes[n["id"]] = n
        return nodes

    def weak_spot_summary(self):
        if not self._client:
            return {"weak_count": 0, "mistake_count": 0, "topic_count": 0, "common_weaknesses": [], "recent_mistakes": [], "edge_count": 0}
        nodes = self.all_nodes().values()
        weaknesses = [n for n in nodes if n["type"] == "weakness"]
        mistakes = [n for n in nodes if n["type"] == "mistake"]
        topics = [n for n in nodes if n["type"] == "topic"]
        return {
            "weak_count": len(weaknesses),
            "mistake_count": len(mistakes),
            "topic_count": len(topics),
            "common_weaknesses": [w["label"] for w in sorted(weaknesses, key=lambda x: x["created_at"], reverse=True)[-5:]],
            "recent_mistakes": [m["label"] for m in sorted(mistakes, key=lambda x: x["created_at"], reverse=True)[-5:]],
            "edge_count": 0,
        }

    def opportunity_summary(self):
        if not self._client:
            return {"count": 0, "items": []}
        res = self._client.table("graph_nodes").select("*").eq("type", "opportunity").order("created_at", desc=True).limit(10).execute()
        return {"count": len(res.data or []), "items": res.data or []}

    def research_summary(self):
        if not self._client:
            return {"count": 0, "items": []}
        res = self._client.table("graph_nodes").select("*").eq("type", "research_idea").order("created_at", desc=True).limit(10).execute()
        return {"count": len(res.data or []), "items": res.data or []}


class SupabaseVectorMemory:
    def __init__(self):
        self._client = None if not supabase_available() else get_client()

    def add(self, text, metadata=None):
        if not self._client:
            return None
        model = get_embedder()
        emb = model.encode(text, normalize_embeddings=True).tolist()
        mem_id = f"mem_{uuid.uuid4().hex[:8]}"
        data = {
            "id": mem_id,
            "text_content": text,
            "metadata": metadata or {},
            "embedding": emb
        }
        self._client.table("vector_memories").insert(data).execute()
        return mem_id

    def search(self, query, top_k=10, threshold=0.25):
        if not self._client:
            return []
        model = get_embedder()
        q_emb = model.encode(query, normalize_embeddings=True).tolist()
        res = self._client.rpc("match_memories", {
            "query_embedding": q_emb,
            "match_threshold": threshold,
            "match_count": top_k
        }).execute()
        if not res.data:
            return []
        results = []
        for r in res.data:
            results.append({
                "text": r["text_content"],
                "metadata": r["metadata"],
                "score": r["similarity"]
            })
        return results

    def build_context(self, query, max_items=8):
        results = self.search(query, top_k=12, threshold=0.25)
        if not results:
            return ""
        lines = [f"- [{r['metadata'].get('type', 'note')}] {r['text']}" for r in results[:max_items]]
        return "Relevant memories:\n" + "\n".join(lines)

    def count(self):
        if not self._client:
            return 0
        res = self._client.table("vector_memories").select("id", count="exact").execute()
        return res.count or 0
