"""
Central configuration for the EdgeVision PPE Compliance Platform.
All tuneable values live here; environment variables override where relevant.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── MQTT ──────────────────────────────────────────────────────────────────────
MQTT_BROKER   = os.getenv("MQTT_BROKER", "test.mosquitto.org")
MQTT_PORT     = int(os.getenv("MQTT_PORT", "1883"))
MQTT_TOPIC    = os.getenv("MQTT_TOPIC", "factory/ppe_violations")
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "")
MQTT_USE_TLS  = os.getenv("MQTT_USE_TLS", "false").lower() == "true"

# ── Model ─────────────────────────────────────────────────────────────────────
DEFAULT_MODEL_PATH  = os.getenv(
    "MODEL_PATH",
    "best.pt" if os.path.exists("best.pt") else "models/best.pt"
)
FALLBACK_MODEL_PATH = "models/yolo11n.pt"
DETECTION_CONF      = float(os.getenv("DETECTION_CONF", "0.20"))
TRACKER_CONFIG      = "bytetrack.yaml"

import torch
PERFORMANCE_PROFILE = os.getenv("PERFORMANCE_PROFILE", "auto").lower()
IS_GPU_AVAILABLE = torch.cuda.is_available()

# Inference Optimization (Jetson / TensorRT / FP16 / Adaptive Hardware Profiles)
if PERFORMANCE_PROFILE == "low_end" or (PERFORMANCE_PROFILE == "auto" and not IS_GPU_AVAILABLE):
    # Low-end system profile (8GB RAM / CPU-only laptop) - maximize responsiveness & zero camera lag
    INFERENCE_IMG_SIZE       = int(os.getenv("INFERENCE_IMG_SIZE", "480"))
    INFERENCE_HALF_PRECISION = os.getenv("INFERENCE_HALF_PRECISION", "false").lower() == "true"
    FRAME_SKIP_INTERVAL      = int(os.getenv("FRAME_SKIP_INTERVAL", "1"))  # Run inference on alternating frames
    STREAM_MAX_WIDTH         = int(os.getenv("STREAM_MAX_WIDTH", "854"))     # 480p preview stream
    JPEG_QUALITY             = int(os.getenv("JPEG_QUALITY", "50"))
else:
    # High-end system profile (Discrete GPU / Jetson Edge / Multi-Core)
    INFERENCE_IMG_SIZE       = int(os.getenv("INFERENCE_IMG_SIZE", "640"))
    INFERENCE_HALF_PRECISION = os.getenv("INFERENCE_HALF_PRECISION", "true").lower() == "true"
    FRAME_SKIP_INTERVAL      = int(os.getenv("FRAME_SKIP_INTERVAL", "0"))  # Run inference every frame
    STREAM_MAX_WIDTH         = int(os.getenv("STREAM_MAX_WIDTH", "1280"))
    JPEG_QUALITY             = int(os.getenv("JPEG_QUALITY", "65"))

# ── PPE classes (must match model / data.yaml order) ─────────────────────────
PPE_CLASSES = [
    "person",               # 0
    "helmet",               # 1
    "vest",                 # 2
    "boots",                # 3
    "lanyard",              # 4
    "no_harness",           # 5
    "no_lanyard",           # 6
    "lanyard_good",         # 7
    "lanyard_bad",          # 8
    "glove",                # 9
    "glass",                # 10
    "ear_protection",       # 11
    "mask",                 # 12
    "no_helmet",            # 13
    "no_vest",              # 14
    "no_boots",             # 15
    "no_glove",             # 16
    "no_glass",             # 17
]

# ── Stage-3 association ───────────────────────────────────────────────────────
PPE_CONTAINMENT_THRESHOLD = float(os.getenv("PPE_CONTAINMENT_THRESHOLD", "0.40"))

# ── Stage-5 temporal validation ───────────────────────────────────────────────
TEMPORAL_WINDOW        = int(os.getenv("TEMPORAL_WINDOW", "10"))        # frames
TEMPORAL_MIN_HITS      = int(os.getenv("TEMPORAL_MIN_HITS", "8"))       # out of WINDOW (matches spec requirement: 8 of 10)
TEMPORAL_MIN_CONF      = float(os.getenv("TEMPORAL_MIN_CONF", "0.20")) # confidence
TEMPORAL_MIN_ZONE_SECS = float(os.getenv("TEMPORAL_MIN_ZONE_SECS", "2.0")) # seconds (matches spec: > 2 seconds)

# ── Persistent worker tracker (majority voting across frames) ─────────────────
WORKER_TRACKER_WINDOW    = int(os.getenv("WORKER_TRACKER_WINDOW", "8"))    # sliding window size
WORKER_TRACKER_MIN_VOTES = int(os.getenv("WORKER_TRACKER_MIN_VOTES", "3"))  # min detections to confirm PPE
WORKER_TRACKER_STALE_FRAMES = int(os.getenv("WORKER_TRACKER_STALE_FRAMES", "60"))  # cleanup after N absent frames

# ── Violation deduplication ───────────────────────────────────────────────────
VIOLATION_COOLDOWN_SECS = float(os.getenv("VIOLATION_COOLDOWN_SECS", "5.0"))   # per-worker DB write cooldown

# ── PPE Aliases & Normalization ───────────────────────────────────────────────
PPE_ALIASES: dict[str, str] = {
    # Helmet / Hard hat
    "helmet":            "Hard_hat",
    "Hard_hat":          "Hard_hat",
    "no_helmet":         "Hard_hat",
    "no-helmet":         "Hard_hat",
    "No-Helmet":         "Hard_hat",
    
    # Vest
    "vest":              "Vest",
    "Vest":              "Vest",
    "no_vest":           "Vest",
    "no-vest":           "Vest",
    "No-Vest":           "Vest",
    
    # Boots
    "boots":             "Boots",
    "Boots":             "Boots",
    "no_boots":          "Boots",
    "no-boots":          "Boots",
    "No-Boots":          "Boots",
    
    # Gloves
    "glove":             "Glove",
    "gloves":            "Glove",
    "Glove":             "Glove",
    "no_glove":          "Glove",
    "no-gloves":         "Glove",
    "No-Glove":          "Glove",
    
    # Glass / Goggles
    "glass":             "Glass",
    "goggles":           "Glass",
    "Glass":             "Glass",
    "no_glass":          "Glass",
    "no-goggles":        "Glass",
    "No-Glass":          "Glass",
    
    # Ear protection
    "ear_protection":   "Ear-Protection",
    "ear-mufs":          "Ear-Protection",
    "Ear-Protection":    "Ear-Protection",
    "no-ear-protection": "Ear-Protection",
    "No-Ear-Protection": "Ear-Protection",
    
    # Mask
    "mask":              "Mask",
    "Mask":              "Mask",
    "no-mask":           "Mask",
    "No-Mask":           "Mask",
    
    # Harness / Lanyard / Height Safety
    "lanyard":           "lanyard",
    "lanyard_good":      "lanyard",
    "lanyard_bad":       "lanyard",
    "no_lanyard":        "lanyard",
    "no_harness":        "safety_belt",
    "harness":           "safety_belt",
    "safety_belt":       "safety_belt",
    "hook":              "hook",
    "anchor_point":      "anchor_point",
}

# ── Zone rule engine (Stage-4) ────────────────────────────────────────────────
# Each zone maps to a set of required PPE class names.
ZONE_RULES: dict[str, set[str]] = {
    "general_plant":       {"Hard_hat", "Vest"},
    "construction":        {"Hard_hat", "Vest", "Boots"},
    "work_at_height":      {"Hard_hat", "Vest", "Boots", "safety_belt", "hook"},
    "restricted_machinery":{"Hard_hat", "Vest", "Glass", "Ear-Protection", "Mask"},
    "hazardous_material":  {"Hard_hat", "Vest", "Boots", "Glove", "Glass", "Mask"},
}

DEFAULT_ZONE = "general_plant"

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://ppe_user:ppe_pass@localhost:5432/ppe_db"
)
MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://localhost:27017"
)
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "edgevision")

# ── Web server ────────────────────────────────────────────────────────────────
SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0")
SERVER_PORT = int(os.getenv("PORT", os.getenv("SERVER_PORT", "8000")))

# ── Camera ────────────────────────────────────────────────────────────────────
DEFAULT_CAMERA_SOURCE = os.getenv("CAMERA_SOURCE", "0")
DEFAULT_CAMERA_INDEX  = DEFAULT_CAMERA_SOURCE
FRAME_WIDTH          = int(os.getenv("FRAME_WIDTH", "1280"))
FRAME_HEIGHT         = int(os.getenv("FRAME_HEIGHT", "720"))
TARGET_FPS           = int(os.getenv("TARGET_FPS", "20"))
