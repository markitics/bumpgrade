#!/usr/bin/env bash
set -euo pipefail

env_file="${CODEX_CLOUDFLARE_ENV:-$HOME/.config/codex/cloudflare.env}"

if [[ -f "$env_file" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "Missing CLOUDFLARE_API_TOKEN. Create $env_file with: export CLOUDFLARE_API_TOKEN=\"...\"" >&2
  exit 1
fi

exec "$@"
