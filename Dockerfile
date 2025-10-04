# Production Dockerfile for ExpatEats
FROM node:18-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev && npm cache clean --force

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership of necessary files
RUN chown -R nextjs:nodejs /app

# Copy health check script
COPY --chown=nextjs:nodejs healthcheck.js ./

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["npm", "start"]