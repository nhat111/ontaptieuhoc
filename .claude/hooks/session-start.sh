#!/bin/bash
set -euo pipefail

# Only run inside Claude Code on the web (remote ephemeral container).
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install npm deps. Idempotent — npm install is a no-op when node_modules
# already matches the lockfile, and --prefer-offline uses cache when possible.
npm install --no-audit --no-fund --prefer-offline
