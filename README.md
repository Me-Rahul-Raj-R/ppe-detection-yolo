# 🛡️ EdgeVision — Autonomous Industrial PPE Safety & Compliance Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org)
[![YOLOv11](https://img.shields.io/badge/YOLO-v11-00FFFF.svg?style=flat)](https://ultralytics.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**EdgeVision** is an enterprise-grade, high-throughput autonomous computer vision system designed for real-time Personal Protective Equipment (PPE) compliance verification, worker tracking, and industrial safety telemetry across plant floors, construction zones, and high-hazard environments.

---

## 🌟 Key Features

* **⚡ Parallel Multi-Camera Vision Engine**: Runs asynchronous parallel YOLO inference threads across hardware webcams, RTSP streams, and YouTube Live links simultaneously.
* **🎥 Network Resilient Streams**: Features auto-reconnect fallback loops for UDP/TCP stream drops and robust TLS/HLS support without crashing or stalling.
* **🎯 Custom Zone Rule Engine**: Per-zone granular PPE enforcement (`helmet`, `vest`, `boots`, `gloves`, `goggles`, `ear-mufs`, `face-guard`, `safety_belt`, `lanyard`, `hook`).
* **⏳ Temporal Compliance & Noise Suppression**: Multi-frame thresholding and minimum dwell-time verification suppress false single-frame alerts before raising real incident violations.
* **💾 Dual Storage Persistence**: Hybrid database engine (MongoDB Atlas cloud primary + local JSON disk fallback) ensuring zero data loss even during network disconnections.
* **📸 Automated Evidence Capture**: Asynchronously captures high-resolution violation snapshots and MP4 video clips without stalling live video FPS.
* **💻 High-Performance UI**: Modern, dark-mode React dashboard built with TanStack Router, Vite, and real-time WebSocket telemetry metrics.

---

## 📁 Repository Structure

```text
EdgeVision/
├── database/                    # Local JSON fallbacks & violation snapshots
├── docs/                        # Architecture, Deployment, and User Guides
├── frontend/                    # React SPA Frontend (Vite + TanStack Router)
├── models/                      # YOLO AI Model Weights (Tracked in GitHub)
├── scripts/                     # ONNX/TensorRT Export & DB Utility Scripts
├── src/                         # Core Python Backend Engine
│   ├── api/                     # FastAPI Application, WebSockets & REST API
│   └── core/                    # Inference logic, Rule Engine & Tracking
├── training/                    # YOLOv11 Custom Training Pipelines
├── tests/                       # Unit test suite
├── start_fullstack.bat          # One-click startup script for Windows
├── requirements.txt             # Python dependencies
└── README.md
```

---

## 🚀 Quickstart Guide

### Prerequisites
* **Python**: 3.10 or higher
* **Node.js**: v18.0 or higher
* **Git** & **CUDA-compatible GPU** *(highly recommended for FP16 inference)*

### 1. Clone & Install

```bash
git clone https://github.com/your-org/edgevision-ppe.git
cd "edgevision-ppe"

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Run the Fullstack Application

#### Windows One-Click Launcher:
Double-click **`start_fullstack.bat`** or run in terminal:
```cmd
start_fullstack.bat
```

#### Manual Startup (Cross-Platform):
```bash
# Terminal 1: Backend Server (Port 8000)
python -m src.api.server

# Terminal 2: Frontend Dashboard (Port 3000)
cd frontend
npm run dev
```

Open your browser at **`http://localhost:3000`** to access the dashboard.

---

## 📚 Documentation & Guides

Comprehensive documentation is available in the `docs/` folder:
- **[Architecture Overview](docs/ARCHITECTURE.md)**: System design and components.
- **[User Guide](docs/user_guide.md)**: Using the dashboard and rule engine.
- **[Jetson Nano / Orin Deployment](docs/jetson_setup.md)**: Instructions for Edge deployment.
- **[TensorRT Optimization](docs/TENSORRT_GUIDE.md)**: Achieving 30+ FPS on embedded devices via ONNX/TensorRT.
- **[Dataset & Training](docs/dataset_guide.md)**: How to train the model on custom industrial datasets.

---

## 🔒 Environment Variables (`.env`)

```ini
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=edgevision
MODEL_PATH=models/best.pt
DETECTION_CONF=0.35
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

---

## 📜 License & Compliance

Licensed under the MIT License. Developed for enterprise workplace safety monitoring. Compliance rules adhere to OSHA and ISO 45001 occupational health and safety management guidelines.