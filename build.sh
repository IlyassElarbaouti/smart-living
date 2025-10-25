#!/bin/bash

# Vercel build script for Prisma compatibility
set -e

echo "Starting custom Vercel build..."

# Set environment variables for Prisma
export PRISMA_CLI_BINARY_TARGETS="rhel-openssl-3.0.x,rhel-openssl-1.0.x,native"
export PRISMA_BINARIES_MIRROR="https://binaries.prisma.sh"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Generate Prisma client with all targets
echo "Generating Prisma client..."
npx prisma generate

# Verify binary exists
echo "Checking for Prisma binaries..."
if [ -f "node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node" ]; then
    echo "✓ rhel-openssl-3.0.x binary found"
else
    echo "✗ rhel-openssl-3.0.x binary missing"
    exit 1
fi

# Build Next.js
echo "Building Next.js application..."
npm run build

echo "Build completed successfully!"