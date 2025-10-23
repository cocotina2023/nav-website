# Multi-stage build for Nav Website
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY web/package*.json ./web/

# Install dependencies
RUN npm install
RUN cd web && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd web && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy application files
COPY --from=builder /app/app.js ./
COPY --from=builder /app/config.js ./
COPY --from=builder /app/db.js ./
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/database ./database
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/web/dist ./web/dist

# Expose port
EXPOSE 4500

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4500

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4500/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "app.js"]
