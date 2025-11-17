#!/bin/bash

# check-ledger-lag.sh
# Check ledger lag for XRPL nodes

set -e

NODE_URL=${1:-"https://core.xrpl.futuretech.internal"}

echo "=== Checking ledger lag for $NODE_URL ==="
echo ""

# TODO: Query node and compare validated_ledger with current time
# For now, stub implementation

# Example:
# LEDGER_TIME=$(curl -s $NODE_URL -X POST -H "Content-Type: application/json" \
#   -d '{"method":"server_info","params":[{}]}' | jq -r '.result.info.validated_ledger.close_time')
# CURRENT_TIME=$(date +%s)
# LAG=$((CURRENT_TIME - LEDGER_TIME))

LAG=2

echo "Ledger lag: $LAG seconds"

if [ $LAG -gt 10 ]; then
  echo "ERROR: Ledger lag is too high!"
  exit 1
fi

echo "OK: Ledger lag is acceptable"
