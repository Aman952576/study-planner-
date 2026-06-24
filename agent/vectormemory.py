import json, numpy as np
from pathlib import Path
from config import DATA_DIR
from .supabase_db import SupabaseVectorMemory, supabase_available

class VectorMemory:
    def __init__(self):
        self._model = None
        self._data_file = DATA_DIR / "vector_memory.json"
        self._data = self._load()
        self._supa = SupabaseVectorMemory() if supabase_available() else None

    def _load(self):
        if self._data_file.exists():
            return json.loads(self._data_file.read_text(encoding="utf-8"))
        return {"entries": []}

    def _save(self):
        self._data_file.parent.mkdir(parents=True, exist_ok=True)
        self._data_file.write_text(json.dumps(self._data, ensure_ascii=False, indent=2), encoding="utf-8")

    def _get_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer('all-MiniLM-L6-v2')
        return self._model

    def add(self, text, metadata=None):
        if self._supa:
            return self._supa.add(text, metadata)
        model = self._get_model()
        emb = model.encode(text, normalize_embeddings=True).tolist()
        entry = {
            "id": f"mem_{len(self._data['entries'])}",
            "text": text,
            "metadata": metadata or {},
            "embedding": emb
        }
        self._data["entries"].append(entry)
        self._save()
        return entry["id"]

    def search(self, query, top_k=5, threshold=0.3):
        if self._supa:
            return self._supa.search(query, top_k, threshold)
        if not self._data["entries"]:
            return []
        model = self._get_model()
        q_emb = model.encode(query, normalize_embeddings=True)
        idx = np.array([e["embedding"] for e in self._data["entries"]])
        scores = np.dot(idx, q_emb)
        top = np.argsort(scores)[::-1][:top_k]
        results = []
        for i in top:
            if scores[i] >= threshold:
                results.append({
                    "text": self._data["entries"][i]["text"],
                    "metadata": self._data["entries"][i]["metadata"],
                    "score": float(scores[i])
                })
        return results

    def build_context(self, query, max_items=8):
        if self._supa:
            return self._supa.build_context(query, max_items)
        results = self.search(query, top_k=12, threshold=0.25)
        if not results:
            return ""
        lines = [f"- [{r['metadata'].get('type', 'note')}] {r['text']}" for r in results[:max_items]]
        return "Relevant memories:\n" + "\n".join(lines)

    def count(self):
        if self._supa:
            return self._supa.count()
        return len(self._data["entries"])
