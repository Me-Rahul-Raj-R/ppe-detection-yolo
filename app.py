"""
Hugging Face Spaces Entry Point
Mounts the EdgeVision FastAPI server into Gradio so the Hugging Face Space supervisor manages execution on 16GB RAM.
"""

import os
import sys
import uvicorn
import gradio as gr

# Set writable directories for read-only environments (Hugging Face Spaces / Docker)
os.environ.setdefault("YOLO_CONFIG_DIR", "/tmp/Ultralytics")
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Hugging Face ZeroGPU compatibility hook (only active when running on HF ZeroGPU infrastructure)
HAS_ZERO_GPU = False
if os.getenv("SPACES_ZERO_GPU", "").lower() in ("1", "true", "yes") or os.getenv("ZERO_GPU", "").lower() in ("1", "true", "yes"):
    try:
        import spaces
        HAS_ZERO_GPU = True
    except Exception:
        HAS_ZERO_GPU = False

if HAS_ZERO_GPU:
    try:
        @spaces.GPU
        def zero_gpu_startup():
            """Top-level function decorated with @spaces.GPU to satisfy Hugging Face ZeroGPU supervisor check."""
            return True
        zero_gpu_startup()
    except Exception as _gpu_err:
        print(f"ZeroGPU startup check skipped: {_gpu_err}")
        HAS_ZERO_GPU = False

from src.api.server import app as fastapi_app

# Create a lightweight Gradio interface to satisfy Hugging Face Space supervisor
with gr.Blocks(title="EdgeVision PPE Compliance Platform") as demo:
    gr.Markdown("# 🛡️ EdgeVision — Autonomous Industrial PPE Compliance Platform")
    gr.Markdown("### 🚀 Backend API & AI Inference Engine running live on **16 GB RAM**.")
    gr.Markdown("""
    #### Active Endpoints:
    - **Health Status**: `/health` or `/api/health`
    - **Safety Zones API**: `/api/zones`
    - **Model Metrics**: `/api/model-metrics`
    - **Live WebSocket Stream**: `/ws`
    - **MJPEG Video Stream**: `/stream`
    """)

# Mount FastAPI app into Gradio
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 7860))
    print(f"Starting EdgeVision Server on 0.0.0.0:{port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
