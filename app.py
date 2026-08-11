"""
Hugging Face Spaces / Koyeb Entry Point
Launches the EdgeVision FastAPI server on port 7860 (Hugging Face default) or PORT env.
"""

import os
import sys
import uvicorn

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.api.server import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 7860))
    print(f"Starting EdgeVision Server on 0.0.0.0:{port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
