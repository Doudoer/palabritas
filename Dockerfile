# ==========================================
# Multi-stage Dockerfile for Palabritas
# ==========================================

# 1. Stage: Dependencies
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Cache dependencies layer
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 2. Stage: Development (Hot Reloading)
FROM oven/bun:1-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
ENV HOST=0.0.0.0
ENV PORT=3000
CMD ["bun", "run", "dev"]

# 3. Stage: Production Build
FROM oven/bun:1-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# 4. Stage: Production Server (Ultra-lightweight Nginx)
FROM nginx:1.27-alpine AS production
LABEL maintainer="Palabritas"
LABEL description="Palabritas - Aplicación educativa infantil de lectoescritura"

# Copy custom Nginx configuration with SPA fallback, gzip & PWA caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Container healthcheck
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
