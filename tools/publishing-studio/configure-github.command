#!/bin/zsh
set -eu
cd "$(dirname "$0")/../.."
if ! command -v node >/dev/null; then
  export PATH="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
fi
node --import tsx tools/publishing-studio/configure-github.ts
