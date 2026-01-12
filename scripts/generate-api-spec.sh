#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <server-directory>"
  echo "Example: $0 core"
  exit 1
fi

server_dir="$1"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
target_dir="${repo_root}/servers/${server_dir}"

if [[ ! -d "${target_dir}" ]]; then
  echo "Error: server directory not found: ${target_dir}"
  exit 1
fi

cd "${target_dir}"
swag init --output docs --parseDependency --parseInternal
