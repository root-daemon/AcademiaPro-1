#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ ! -d "$ROOT/backend/src" ]]; then
  echo "backend/ is missing; run: git submodule update --init backend" >&2
  exit 1
fi
cp -R "$ROOT/backend-overlays/." "$ROOT/backend/"
echo "Applied backend-overlays/ onto backend/"
