# ========================================
# Production Dockerfile (No Nginx)
# ========================================
 
########## Stage 1: Build ##########
# FROM node:20-alpine AS builder
FROM node:22-slim AS builder
 
WORKDIR /app
 
COPY package.json package-lock.json ./
RUN npm ci
 
COPY . .
RUN npm run build
 
 
########## Stage 2: Runtime ##########
# FROM node:20-alpine
FROM node:22-slim
 
WORKDIR /app
 
# Install minimal static file server
RUN npm install -g serve@14
 
# Create non-root user (Debian-safe slim image supported)
RUN groupadd -g 1002 appgroup && \
    useradd -u 1001 -g appgroup -m appuser
 
# Copy built files only
COPY --from=builder /app/dist ./dist
 
# Fix permissions
RUN chown -R appuser:appgroup /app
 
USER appuser
 
EXPOSE 4173
 
# Serve SPA (single-page app support)
CMD ["serve", "-s", "dist", "-l", "4173"]
