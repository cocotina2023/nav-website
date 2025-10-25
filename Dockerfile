# Multi-stage build for Nav Website
FROM node:18-alpine AS builder

WORKDIR /app

# Install backend dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install frontend dependencies
COPY web/package.json web/package-lock.json ./web/
RUN cd web && npm ci

# Copy source code
COPY . .

# Build frontend assets
RUN cd web && npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4500

# Install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application files
COPY --from=builder /app/app.js ./app.js
COPY --from=builder /app/config.js ./config.js
COPY --from=builder /app/db.js ./db.js
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/database ./database
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/web/dist ./web/dist

EXPOSE 4500

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4500/api/health', (res) => { if (res.statusCode !== 200) { process.exit(1); } }).on('error', () => process.exit(1));"

CMD ["node", "app.js"]
