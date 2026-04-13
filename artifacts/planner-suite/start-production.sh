#!/bin/bash
cd "$(dirname "$0")"
exec node_modules/.bin/next start -p "${PORT:-24140}" -H 0.0.0.0
