#!/bin/bash
set -e
cd "$(dirname "$0")/.."
pnpm run build
cp -r public .next/standalone/artifacts/planner-suite/public
cp -r .next/static .next/standalone/artifacts/planner-suite/.next/static
echo "Standalone build complete"
