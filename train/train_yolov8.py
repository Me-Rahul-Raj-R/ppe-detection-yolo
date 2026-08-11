"""
EdgeVision PyTorch / YOLOv8 Model Training Script
Trains or fine-tunes YOLOv8 model for 8 industrial PPE and work-at-height safety classes.
"""

import argparse
import os
import sys

def train_model(data_yaml: str, epochs: int = 100, img_size: int = 640, batch_size: int = 16, weights: str = "yolov8m.pt"):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("Ultralytics library required for training. Run: pip install ultralytics")
        sys.exit(1)

    print(f"--- Starting EdgeVision YOLOv8 Training ---")
    print(f"Base Weights: {weights}")
    print(f"Dataset YAML: {data_yaml}")
    print(f"Epochs: {epochs} | Batch Size: {batch_size} | Image Resolution: {img_size}")

    model = YOLO(weights)
    
    # Train model on industrial PPE dataset
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=img_size,
        batch=batch_size,
        workers=8,
        device=0,
        project="runs/detect",
        name="edgevision_ppe_model",
        exist_ok=True,
        pretrained=True,
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,
        mosaic=1.0,
        mixup=0.15,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4
    )

    print(f"--- Training Complete ---")
    print(f"Best model weights saved to: runs/detect/edgevision_ppe_model/weights/best.pt")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train EdgeVision PPE Detection Model")
    parser.add_argument("--data", type=str, default="data.yaml", help="Path to dataset YAML file")
    parser.add_argument("--epochs", type=int, default=100, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Inference resolution")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--weights", type=str, default="yolov8m.pt", help="Pretrained weights")
    args = parser.parse_args()

    train_model(args.data, args.epochs, args.imgsz, args.batch, args.weights)
