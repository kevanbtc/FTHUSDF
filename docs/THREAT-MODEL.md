# Threat Model (STRIDE)

This document maps core threats to explicit controls and invariants across XRPL, the EVM control plane, and services.

## System scope

- XRPL IOUs: FTHUSD (institutional), USDF (member rail)
- EVM contracts: SystemGuard, MintGuard, ReserveRegistry
- Services: xrpl-core-api, compliance-service, membership-service, treasury-service, bank-gateway-service

## STRIDE matrix (high level)

- Spoofing
  - Threat: Impersonation of member or treasury.
  - Controls: KYC + membership NFTs; XRPL account auth; service auth; role-based access in contracts.
- Tampering
  - Threat: Reserve manipulation; mint amount alteration.
  - Controls: ReserveRegistry role gating; `canMint` checks; `confirmMint`/`recordBurn` event trails; PoR reconciliation.
- Repudiation
  - Threat: Disputes of mint/burn actions.
  - Controls: On-chain events with tx hashes; XRPL tx hashes; immutable logs.
- Information disclosure
  - Threat: Sensitive keys/PII leak.
  - Controls: `.env` secrets; key isolation; PII minimization and vendor contracts.
- Denial of service
  - Threat: Flooding public node or services.
  - Controls: Member API rate limits; circuit breaker via `SystemGuard.pause()`; backlog handling.
- Elevation of privilege
  - Threat: Unauthorized mint/pause.
  - Controls: OpenZeppelin AccessControl roles, multi‑sig guardianship, service-side whitelisting.

## Invariants

- Supply ≤ Reserves: `MintGuard.totalNetMinted() ≤ ReserveRegistry.totalReservesUsd()`
- No mints while paused: `SystemGuard.isPaused() => canMint = false`
- Whitelist required: service checks enforced before calls
- Supply cap enforced: `totalNetMinted + new ≤ supplyCap`

## Monitoring & response

- Alerts: invariant violation, failed canMint, sanctions hits
- Actions: guardian `pause()`, incident response, reconciliation

## Open items

- Formal threat scenarios per service
- Third‑party audit notes and controls mapping
