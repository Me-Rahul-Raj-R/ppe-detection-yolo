# EdgeVision Platform Operational User Guide

Welcome to the **EdgeVision Industrial PPE Compliance & Work-at-Height Safety Platform** operational manual.

---

## 🖥️ Navigation & Dashboard Views

### 1. Live Monitoring (`/live`)
- View multi-camera live video streams overlaid with real-time AI bounding boxes, worker tracking IDs (`Worker-101`), and detected PPE tags.
- Use interactive stream controls (**Play**, **Pause**, **Seek**, **Skip 5s**, **Restart**) on YouTube streams or RTSP feeds.

### 2. Manual Verification & Triage (`/violations`)
- Safety officers can review raised alerts under **Unacknowledged**, **Accepted**, or **Declined** tabs.
- Click **Confirm Real Violation** to include the alert in executive reporting.
- Click **Decline Alert (False Alarm)** to mark it as a false alert. **Declined alerts are automatically removed completely from MongoDB**.

### 3. Event History (`/events`)
- Search past safety breaches filtered by **Safety Zone**, **Camera ID**, **Tracked Worker ID**, **Date Range**, or **Status**.
- Preview full-resolution image evidence crops and video clips.

### 4. Safety Zone Rules (`/zones`)
- Configure required PPE per safety area (`helmet`, `vest`, `boots`, `safety_belt`, `lanyard`, `hook`, `goggles`, `gloves`).
- Click **Add Safety Zone** to register a new zone.
- Click **Edit Zone** to modify rules or zone names.
- Click **Delete Zone** to remove a zone from the database.

### 5. Camera Management (`/cameras`)
- Add local webcams or RTSP/YouTube stream links.
- Monitor live stream FPS, latency, and hardware status.

### 6. Reports & Analytics (`/reports`)
- View daily, weekly, and monthly safety compliance reports.
- Export filtered audit logs to CSV or Excel.
