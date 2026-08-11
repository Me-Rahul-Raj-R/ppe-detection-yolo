"""
EdgeVision ONNX Model Export Script
Converts PyTorch PyTorch model weights (best.pt) to ONNX format with dynamic axes.
"""

import argparse
import os
import sys

def export_onnx(model_path: str, output_path: str = "best.onnx", imgsz: int = 640, half: bool = False):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("Ultralytics library required for export. Run: pip install ultralytics")
        sys.exit(1)

    if not os.path.exists(model_path):
        print(f"Error: Model file not found at {model_path}")
        sys.exit(1)

    print(f"--- Exporting {model_path} to ONNX ---")
    model = YOLO(model_path)
    
    exported_file = model.export(
        format="onnx",
        imgsz=imgsz,
        dynamic=True,
        simplify=True,
        half=half
    )

    print(f"Successfully exported ONNX model to: {exported_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export YOLOv8 model to ONNX")
    parser.add_argument("--model", type=str, default="best.pt", help="Path to best.pt weights")
    parser.add_argument("--imgsz", type=int, default=640, help="Export resolution")
    parser.add_argument("--half", action="store_true", help="Enable FP16 precision export")
    args = parser.parse_args()

    export_onnx(args.model, imgsz=args.imgsz, half=args.half)
