import json, os
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
BACKUP_DIR = BASE_DIR / "backups"

DATA_DIR.mkdir(exist_ok=True)
BACKUP_DIR.mkdir(exist_ok=True)

CONFIG_FILE = DATA_DIR / "config.json"

DEFAULT_CONFIG = {
    "llama": {
        "enabled": False,
        "mode": "ollama",
        "model_path": "",
        "api_url": "http://localhost:11434/api/generate",
        "model": "llama3.1:8b",
        "temperature": 0.7,
        "max_tokens": 512,
        "n_ctx": 2048,
        "n_gpu_layers": 0,
        "max_retries": 3
    },
    "scheduler": {
        "max_daily_hours": 6,
        "default_estimation_bias": 0.8,
        "min_pattern_data_months": 6,
        "backlog_warning_days": 7,
        "max_task_daily": 5
    },
    "backup": {
        "daily_json": True,
        "weekly_graph": True,
        "monthly_full_export": True
    },
    "reporting": {
        "weekly_day": "Sunday",
        "pattern_frequency": "quarterly"
    }
}

def load_config():
    if CONFIG_FILE.exists():
        data = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
        merged = DEFAULT_CONFIG.copy()
        for k, v in data.items():
            if k in merged and isinstance(merged[k], dict):
                merged[k].update(v)
            else:
                merged[k] = v
        return merged
    save_config(DEFAULT_CONFIG)
    return dict(DEFAULT_CONFIG)

def save_config(cfg):
    CONFIG_FILE.write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")
