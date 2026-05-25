#!/usr/bin/env bash
set -euo pipefail

npm run cf:build

# The combined OpenNext deploy command can duplicate generated next-env exports
# during Wrangler bundling. Keep cache population and Worker upload separate.
scripts/with-cloudflare-env.sh npm exec opennextjs-cloudflare populateCache remote
scripts/with-cloudflare-env.sh env OPEN_NEXT_DEPLOY=true npm exec wrangler deploy
