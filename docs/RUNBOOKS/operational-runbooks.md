# Operational Runbooks

Operator playbooks for common tasks. Treat these as living documents.

## Pause / Unpause (SystemGuard)

- Preconditions: Guardian multi‑sig ready
- Pause: call `SystemGuard.pause("reason")`
- Effects: `MintGuard.canMint()` returns false; all mints halt
- Unpause: call `SystemGuard.unpause()` after incident resolution

## Proof‑of‑Reserves reconciliation (daily)

1. Pull bank balances (API or CSV)
2. Update `ReserveRegistry.updateReserve()` via bank-gateway-service
3. Verify: `totalNetMinted ≤ totalReservesUsd`
4. If failure: trigger pause, investigate, remediate

## Key rotation (treasury)

- XRPL issuer keys: rotate cold; update services; verify trustlines
- EVM admin: rotate multi‑sig signers; verify roles

## Sanctions event

- Block customer in ComplianceRegistry
- Review pending mints; pause if necessary
- File SAR as required

## Runbooks index

- Mint/Burn: `docs/MINT-BURN-RUNBOOK.md`
- KYC Policy: `docs/KYC-AML-POLICY-US.md`
- PoR Policy: `docs/STABLECOIN-POR-POLICY.md`
