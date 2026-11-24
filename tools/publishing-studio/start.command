#!/bin/zsh
set -eu
cd "$(dirname "$0")/../.."
if ! command -v node >/dev/null; then
  export PATH="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
fi
if ! command -v node >/dev/null; then
  echo 'Node >=20.9 required.'; exit 1
fi
node --import tsx tools/publishing-studio/start.ts
