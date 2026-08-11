# EdgeVision REST & WebSocket API Documentation

The EdgeVision platform provides a high-performance RESTful API and WebSocket endpoint interface built on FastAPI.

## 🚀 Interactive OpenAPI Docs
When the server is running, interactive OpenAPI and ReDoc documentation are available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 📡 Key API Endpoints

### 1. Safety Zones
- `GET /api/zones`: Retrieve all configured safety zones and required PPE rules.
- `POST /api/zones`: Create or update a safety zone configuration.
- `DELETE /api/zones/{zone_id}`: Delete a safety zone and purge its rules from DB.

### 2. Camera Management
- `GET /api/cameras`: Retrieve registered cameras enriched with real-time pipeline status (FPS, latency, online/offline state).
- `POST /api/cameras`: Register a webcam or YouTube/RTSP stream URL.
- `PUT /api/cameras/{cam_id}`: Update camera properties.
- `DELETE /api/cameras/{cam_id}`: Delete a camera and stop its processing pipeline.
- `GET /api/devices/cameras`: Probe physical webcam hardware devices connected to the host.
- `POST /api/cameras/{cam_id}/controls`: Stream playback controls (`play`, `pause`, `toggle`, `seek`, `skip`, `restart`).

### 3. Safety Violations & Evidence
- `GET /api/violations`: Query violation records supporting multi-parameter filtering (`cameras`, `date_range`, `start_date`, `end_date`, `zone_id`, `worker_id`, `status`).
- `POST /api/violations/{evt_id}/status`: Set violation status (`accepted` or `declined`). **Declined alerts are automatically purged completely from MongoDB**.
- `DELETE /api/violations/{evt_id}`: Delete a specific violation evidence record.
- `DELETE /api/violations`: Purge all stored violation evidence records.

### 4. Telemetry & Workers
- `GET /api/workers`: Retrieve worker compliance analytics and tracking IDs.
- `GET /api/reports`: Get aggregated daily, weekly, and monthly safety telemetry.
- `GET /api/stats`: Dashboard overview metrics (FPS, active streams, total violations).

### 5. WebSockets
- `WS /ws/live`: Real-time WebSocket connection streaming live detection events, frame bounding boxes, worker tracking updates, and pipeline status.
