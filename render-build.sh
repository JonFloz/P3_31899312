#!/bin/bash
set -e

echo "=== Installing backend dependencies ==="
npm ci --legacy-peer-deps

echo "=== Installing frontend dependencies ==="
cd web
npm ci
echo "=== Building frontend ==="
npm run build
cd ..

echo "=== Build complete ==="
