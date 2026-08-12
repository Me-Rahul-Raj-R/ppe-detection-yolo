# TensorRT FP16 / INT8 Engine Build Guide for Jetson

NVIDIA TensorRT optimizes neural network models for hardware acceleration on Jetson Orin devices, providing up to 4x throughput improvements over raw PyTorch inference.

---

## 🛠️ Prerequisites

These steps must be performed **on the target Jetson device** (or an identically configured machine). TensorRT engines are hardware- and software-version specific.

### Required software (Jetson)

| Component | Version |
|-----------|---------|
| JetPack | 6.x (L4T R36) |
| CUDA | 12.2 |
| TensorRT | 8.6 or 10.x (bundled with JetPack) |
| Python | 3.10 |
| ultralytics | >= 8.2 |

Verify installed versions:
```bash
dpkg -l | grep -E "tensorrt|cuda|cudnn"
python3 -c "import tensorrt; print(tensorrt.__version__)"
```

---

## 🛠️ Step-by-Step Build Instructions

### Step 1: Export PyTorch Weights (`best.pt`) to ONNX
Run the export script on your workstation or Jetson Orin:
```bash
python scripts/export_onnx.py --model best.pt --imgsz 640
```
This produces: `best.onnx`

### Step 2: Build FP16 TensorRT Engine
Run the export script to generate a device-specific FP16 engine (calls `trtexec` under the hood):
```bash
python scripts/export_tensorrt.py \
    --model best.pt \
    --imgsz 640 \
    --device 0
```
This produces: `best.engine`. Expect 5–15 minutes for first-time engine compilation.

### Step 3: Build INT8 Quantized TensorRT Engine (Optional)
INT8 delivers higher throughput but requires calibration data:
```bash
python scripts/export_tensorrt.py \
    --model best.pt \
    --imgsz 640 \
    --int8 \
    --device 0
```
*Note: Prepare calibration images in `datasets/calibration/` (200–500 images, representative of deployment conditions).*

---

## 🚀 Step 4: Verify Engine Performance

Run benchmark validation:
```bash
python scripts/benchmark.py
```

To use it in production, set your environment variable:
```bash
export MODEL_PATH=best.engine
python -m src.api.server
```

---

## 📊 FP16 vs INT8 comparison

| Metric | FP32 | FP16 | INT8 |
|--------|------|------|------|
| Accuracy | Baseline | ≈ baseline | Slight drop (~1–3 % mAP) |
| Throughput | 1× | ~2× | ~3–4× |
| Memory | Highest | Medium | Lowest |
| Calibration | Not needed | Not needed | Required |

> [!TIP]
> **Recommendation:** Start with FP16. Use INT8 only if FP16 cannot reach 12 FPS at 1080p.

---

## 🔧 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `TensorRT version mismatch` | Engine built on different TRT version | Rebuild engine on same device |
| `CUDA out of memory` | Large batch or image size | Reduce `--imgsz` or `--batch` |
| `trtexec not found` | TensorRT not installed | Install TensorRT via JetPack SDK Manager |
| `segmentation fault during export` | Ultralytics + TRT version mismatch | Pin `ultralytics==8.2.x` and rebuild |
