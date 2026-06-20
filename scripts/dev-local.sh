#!/usr/bin/env bash
# Local dev: install deps (optional clean) then Next dev server.
# Usage:
#   npm run dev:local
#   CLEAN_INSTALL=1 npm run dev:local   # rm -rf node_modules first
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MIN_NODE_VERSION=26.3.1
if ! node -e "
  const [major, minor, patch] = process.versions.node.split('.').map(Number);
  const [minMajor, minMinor, minPatch] = process.argv[1].split('.').map(Number);
  process.exit(
    major > minMajor ||
    (major === minMajor && minor > minMinor) ||
    (major === minMajor && minor === minMinor && patch >= minPatch)
      ? 0
      : 1
  );
" "${MIN_NODE_VERSION}" >/dev/null 2>&1; then
  echo "error: Node.js >= ${MIN_NODE_VERSION} required (got: $(node -v 2>/dev/null || echo 'not found'))"
  exit 1
fi

if [ "${CLEAN_INSTALL:-}" = "1" ]; then
  echo "Removing node_modules (CLEAN_INSTALL=1)..."
  rm -rf node_modules
fi

echo "Installing dependencies..."
npm install --no-audit --no-fund

echo "Starting dev server at http://localhost:3000 (0.0.0.0:3000) — Ctrl+C to stop"
exec npm run dev
