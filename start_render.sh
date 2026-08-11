#!/bin/bash
set -e

# Fallback PORT to 8000 if not set by Render environment
export RENDER_PORT=${PORT:-8000}
export PORT=${RENDER_PORT}

echo "Starting EdgeVision Unified Fullstack Container on PORT ${PORT}..."

# Substitute $PORT into Nginx configuration template
envsubst '${PORT}' < /app/nginx.conf.template > /etc/nginx/nginx.conf

# Start Python FastAPI backend on internal port 8080 (avoids collision with public $PORT)
echo "Starting FastAPI Backend on 127.0.0.1:8080..."
PORT=8080 SERVER_PORT=8080 uvicorn src.api.server:app --host 127.0.0.1 --port 8080 &
BACKEND_PID=$!

# Start Frontend Nitro SSR Server on internal port 3000
echo "Starting React Frontend (Nitro SSR) on 127.0.0.1:3000..."
NITRO_PORT=3000 PORT=3000 HOST=127.0.0.1 NITRO_HOST=127.0.0.1 node /app/frontend/.output/server/index.mjs &
FRONTEND_PID=$!

# Cleanup handler on process termination
cleanup() {
    echo "Shutting down internal processes..."
    kill -TERM $BACKEND_PID 2>/dev/null || true
    kill -TERM $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "Waiting for internal services (Backend:8080, Frontend:3000) to initialize..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8080/health >/dev/null 2>&1 && curl -s http://127.0.0.1:3000/ >/dev/null 2>&1; then
        echo "All internal services are healthy!"
        break
    fi
    sleep 1
done

# Start Nginx in foreground on public PORT
echo "Starting Nginx Reverse Proxy on port ${PORT}..."
nginx -g 'daemon off;'
