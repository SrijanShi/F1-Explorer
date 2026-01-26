# Build stage for backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

# Build stage for frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY f1-explorer/package*.json ./
RUN npm install
COPY f1-explorer .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy backend
COPY backend/package*.json ./backend/
COPY backend ./backend/
RUN cd backend && npm ci --only=production

# Copy built frontend
COPY --from=frontend-builder /app/frontend/build ./public

EXPOSE 3002

CMD ["node", "backend/index.js"]
