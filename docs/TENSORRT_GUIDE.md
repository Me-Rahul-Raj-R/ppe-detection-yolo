# TensorRT FP16 / INT8 Engine Build Guide for Jetson Orin

NVIDIA TensorRT optimizes neural network models for hardware acceleration on Jetson Orin devices.

---

## 🛠️ Step-by-Step Build Instructions

### Step 1: Export PyTorch Weights (`best.pt`) to ONNX
Run the export script on your workstation or Jetson Orin:
```bash
python scripts/export_onnx.py --model best.pt --imgsz 640
```
This generates `best.onnx`.

### Step 2: Build FP16 TensorRT Engine
Run `trtexec` to generate a device-specific FP16 engine:
```bash
trtexec --onnx=best.onnx --saveEngine=best.engine --fp16
```

### Step 3: Build INT8 Quantized TensorRT Engine (Optional)
For maximum throughput (>30 FPS):
```bash
trtexec --onnx=best.onnx --saveEngine=best_int8.engine --int8 --best
```

### Step 4: Verify Engine Performance
Run benchmark validation:
```bash
python scripts/benchmark.py
```
