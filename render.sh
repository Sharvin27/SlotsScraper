#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🔧 Running custom build..."

# Install dependencies
npm install

# Puppeteer cache workaround for Render
if [[ ! -d "$PUPPETEER_CACHE_DIR" ]]; then 
  echo "📦 Copying Puppeteer cache from build cache..."
  cp -R "$XDG_CACHE_HOME/puppeteer/" "$PUPPETEER_CACHE_DIR"
else 
  echo "📤 Storing Puppeteer cache in build cache..."
  cp -R "$PUPPETEER_CACHE_DIR" "$XDG_CACHE_HOME"
fi

echo "✅ Build script complete."
