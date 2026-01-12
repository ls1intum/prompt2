#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

if ! command -v go >/dev/null 2>&1; then
  echo "Error: Go is not installed. Install Go to set up swag."
  exit 1
fi

if ! command -v swag >/dev/null 2>&1; then
  echo "Installing swag..."
  go install github.com/swaggo/swag/cmd/swag@latest
fi

git config core.hooksPath .githooks
echo "Git hooks path set to .githooks"
