import json, os, requests
from config import load_config

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_RATE_LIMIT_RPM = 30
GROQ_RATE_LIMIT_RPD = 6000

class LlamaEngine:
    def __init__(self):
        cfg = load_config()
        llm = cfg["llama"]
        self.enabled = llm["enabled"]
        self.mode = llm.get("mode", "ollama")
        self.model_path = llm.get("model_path", "")
        self.api_url = llm["api_url"]
        self.model = llm["model"]
        self.temperature = llm["temperature"]
        self.max_tokens = llm.get("max_tokens", 512)
        self.n_ctx = llm.get("n_ctx", 2048)
        self.n_gpu_layers = llm.get("n_gpu_layers", 0)
        self.max_retries = llm["max_retries"]
        self._model = None
        self._groq_client = None
        self._actual_mode = self.mode

    def _get_groq_client(self):
        if self._groq_client is None and GROQ_API_KEY:
            from groq import Groq
            self._groq_client = Groq(api_key=GROQ_API_KEY, timeout=30)
        return self._groq_client

    def _load_direct(self):
        if self._model is not None:
            return True
        if not self.model_path or not os.path.isfile(self.model_path):
            return False
        try:
            from llama_cpp import Llama
            self._model = Llama(
                model_path=self.model_path,
                n_ctx=self.n_ctx,
                n_gpu_layers=self.n_gpu_layers,
                verbose=False
            )
            return True
        except Exception:
            return False

    def ask(self, prompt, system=""):
        if not self.enabled:
            return None

        if self.mode == "direct":
            resp = self._ask_direct(prompt, system)
            if resp:
                self._actual_mode = "direct"
                return resp

        if self.mode == "groq" or self.mode == "ollama":
            resp = self._ask_ollama(prompt, system)
            if resp:
                self._actual_mode = "ollama"
                return resp

        resp = self._ask_groq(prompt, system)
        if resp:
            self._actual_mode = "groq"
            return resp

        self._actual_mode = self.mode
        return None

    def _ask_direct(self, prompt, system=""):
        if not self._load_direct():
            return None
        try:
            resp = self._model.create_chat_completion(
                messages=[
                    {"role": "system", "content": system or "You are a study productivity AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            return resp["choices"][0]["message"]["content"].strip()
        except Exception:
            return None

    def _ask_ollama(self, prompt, system=""):
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system or "You are a study productivity AI assistant.",
            "stream": False,
            "temperature": self.temperature,
            "options": {"num_predict": self.max_tokens}
        }
        for attempt in range(self.max_retries):
            try:
                resp = requests.post(self.api_url, json=payload, timeout=5)
                if resp.status_code == 200:
                    return resp.json().get("response", "").strip()
            except Exception:
                if attempt == self.max_retries - 1:
                    return None
        return None

    def _ask_groq(self, prompt, system=""):
        client = self._get_groq_client()
        if not client:
            return None
        try:
            messages = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt})
            resp = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            return resp.choices[0].message.content.strip()
        except Exception:
            return None

    def prioritize(self, tasks):
        if not self.enabled or not tasks:
            return tasks
        prompt = f"""Given these study tasks, prioritize them (1=highest). Return JSON array with id and priority.

Tasks:
{json.dumps([{"id": t["id"], "title": t["title"], "category": t["category"]} for t in tasks], indent=2)}

Return format: [{{"id": "...", "priority": 1}}]"""
        resp = self.ask(prompt, "You are a task prioritization engine. Return only valid JSON.")
        if resp:
            try:
                parsed = json.loads(resp)
                lookup = {p["id"]: p["priority"] for p in parsed}
                for t in tasks:
                    if t["id"] in lookup:
                        t["priority"] = lookup[t["id"]]
                tasks.sort(key=lambda x: x["priority"])
            except Exception:
                pass
        return tasks

    def generate_tasks(self, study_log):
        if not self.enabled:
            return None
        prompt = f"""Based on today's study log, generate 3-5 specific tasks for tomorrow.

Today's log: {json.dumps(study_log, indent=2)}

Generate tasks that build on what was studied, fill gaps, and prepare for next topics.
Return JSON array: [{{"title": "...", "category": "...", "estimated_hours": 1.0}}]"""
        resp = self.ask(prompt, "You are a task generation engine. Return only valid JSON.")
        if resp:
            try:
                return json.loads(resp)
            except Exception:
                pass
        return None

    def analyze_pattern(self, weekly_data):
        if not self.enabled:
            return None
        prompt = f"""Analyze these weekly study reports and identify patterns.

Data: {json.dumps(weekly_data, indent=2)}

Return JSON:
{{"patterns": ["pattern1", ...], "recommendation": "advice", "estimation_bias": -0.2}}"""
        resp = self.ask(prompt, "You are a pattern analysis engine. Return only valid JSON.")
        if resp:
            try:
                return json.loads(resp)
            except Exception:
                pass
        return None

    def check(self):
        if not self.enabled:
            return False
        if self.mode == "direct":
            if not self.model_path:
                return False
            if not os.path.isfile(self.model_path):
                return False
            return self._load_direct()
        try:
            resp = requests.get(self.api_url.replace("/api/generate", ""), timeout=5)
            return resp.status_code == 200
        except Exception:
            return False

    def groq_available(self):
        return bool(GROQ_API_KEY)
