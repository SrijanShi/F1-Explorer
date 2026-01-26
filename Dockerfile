# Multi-service Dockerfile for F1 Explorer
# Includes: React Frontend, Node.js Backend, Python FastAPI

# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY f1-explorer/package*.json ./
RUN npm install
COPY f1-explorer .
RUN npm run build

# Stage 2: Final Production Image
FROM node:18-alpine
WORKDIR /app

# Install Python and required system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    nginx \
    supervisor \
    && ln -sf python3 /usr/bin/python

# Set up Node.js backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production
COPY backend ./backend/

# Set up Python FastAPI service
COPY backend/src/python/requirements.txt ./python/
RUN pip3 install --no-cache-dir -r python/requirements.txt
COPY backend/src/python/*.py ./python/

# Copy built React frontend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Create nginx configuration for serving React app
RUN mkdir -p /etc/nginx/http.d && \
    echo 'server {' > /etc/nginx/http.d/default.conf && \
    echo '    listen 3000;' >> /etc/nginx/http.d/default.conf && \
    echo '    root /app/frontend/build;' >> /etc/nginx/http.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/http.d/default.conf && \
    echo '    location / {' >> /etc/nginx/http.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/http.d/default.conf && \
    echo '    }' >> /etc/nginx/http.d/default.conf && \
    echo '}' >> /etc/nginx/http.d/default.conf

# Create supervisor configuration
COPY docker/supervisord.conf /etc/supervisord.conf

# Expose ports
EXPOSE 3000 5000 8000

# Start all services with supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
