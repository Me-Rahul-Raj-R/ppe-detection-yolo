"""
Hugging Face Spaces Entry Point
Mounts the EdgeVision FastAPI server into Gradio so the Hugging Face Space supervisor manages execution on 16GB RAM.
"""

import os
import sys
import uvicorn
import gradio as gr

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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
