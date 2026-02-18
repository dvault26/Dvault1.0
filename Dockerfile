# Multi-stage Dockerfile for Dvault Cold Wallet
# Supports Windows, macOS, and Linux builds

# Stage 1: Build dependencies
FROM node:20-alpine as dependencies

WORKDIR /app

# Install Python for build tools
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Stage 2: Type checking
FROM dependencies as type-check

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

RUN npm run build:main -- --noEmit || true

# Stage 3: Renderer build
FROM dependencies as renderer-build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

RUN npm run build:renderer

# Stage 4: Final production image
FROM node:20-alpine as production

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache \
    # For USB device access
    libusb-dev \
    udev \
    # For file operations
    tini \
    # Security tools
    openssl

# Copy built application
COPY --from=renderer-build /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S dvault && \
    adduser -S dvault -u 1001 && \
    chown -R dvault:dvault /app

USER dvault

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD npm run health || exit 1

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main/main.js"]

# Labels for metadata
LABEL maintainer="Dvault Team"
LABEL description="Dvault - Secure Cold Wallet with USB Security Key Integration"
LABEL version="0.2.0"

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install only production dependencies
RUN npm ci --only=production

# Create a non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

USER appuser

# Expose port if needed (adjust as necessary)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to run the app
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

# Start the application
CMD ["node", "dist/main/main.js"]
