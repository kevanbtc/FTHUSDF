# FTH Stablecoin – Proof of Reserves (PoR) Policy

## 1. Scope

Applies to:

- FTHUSD (XRPL)
- USDF (XRPL, backed by FTHUSD)

## 2. Reserve Assets

Reserves consist of:

- USD-denominated balances in US bank accounts controlled by FTH
- Optional: short-term U.S. Treasuries / MMFs (if used, documented here)

### 2.1 Eligible Reserve Assets

- **Cash**: USD deposits in FDIC-insured US banks
- **Cash Equivalents**: US Treasury bills (maturity ≤ 90 days)
- **Money Market Funds**: AAA-rated, US government-backed

### 2.2 Ineligible Assets

- Crypto assets (including Bitcoin, Ethereum)
- Equities
- Corporate bonds
- Loans or receivables

---

## 3. Core Invariants

1. `FTHUSD_supply_on_XRPL <= USD_reserves_total`
2. `USDF_supply_on_XRPL <= FTHUSD_balance_in_USDF_backing_wallet`

These invariants must hold **at all times**. Any violation triggers:

- Automatic system pause via `SystemGuard`
- Immediate alert to treasury and compliance
- Investigation and remediation

---

## 4. Daily Process

### 4.1 Bank Balance Import

**Frequency**: Daily at 9:00 AM ET

**Process**:
1. `bank-gateway-service` fetches balances from all bank accounts (API or CSV)
2. Balances recorded in `fiat_accounts` table
3. Total reserves calculated: `SUM(balance) across all accounts`

### 4.2 Reserve Registry Update

**Frequency**: Daily at 9:15 AM ET (after balance import)

**Process**:
1. `bank-gateway-service` calls `ReserveRegistry.updateReserve()` for each bank account
2. On-chain total reserves updated
3. Event logged: `ReserveUpdated`

### 4.3 Supply vs Reserves Reconciliation

**Frequency**: Daily at 9:30 AM ET

**Process**:
1. Query XRPL for FTHUSD supply (all issued tokens minus burned)
2. Query `ReserveRegistry.totalReservesUsd()`
3. Check: `FTHUSD_supply <= USD_reserves`
4. If violated:
   - Trigger `SystemGuard.pause()`
   - Alert treasury, compliance, and executive team
   - Log incident with full details

### 4.4 USDF Backing Check

**Frequency**: Daily at 9:30 AM ET

**Process**:
1. Query XRPL for USDF supply
2. Query XRPL for FTHUSD balance in USDF backing vault wallet
3. Check: `USDF_supply <= FTHUSD_backing_balance`
4. If violated:
   - Pause USDF mint operations
   - Alert treasury
   - Investigate discrepancy

---

## 5. Monthly PoR Snapshots

### 5.1 Frequency

Last business day of each month

### 5.2 Report Contents

- **Date/Time**: UTC timestamp of snapshot
- **FTHUSD Supply**: Total supply on XRPL
- **USDF Supply**: Total supply on XRPL
- **USD Reserves by Bank**:
  - Bank name
  - Account number (last 4 digits)
  - Balance in USD
- **Total USD Reserves**: Sum of all bank balances
- **Backing Ratio**: `Total Reserves / FTHUSD Supply` (should be >= 1.0)
- **USDF Backing Ratio**: `FTHUSD Backing / USDF Supply` (should be >= 1.0)
- **Attestation**: Signed by CFO and compliance officer

### 5.3 Storage

- Reports stored in secure internal document management system
- Optionally: Pin hash to IPFS for permanence
- Retention: 7 years

### 5.4 Third-Party Attestation (Optional)

- Quarterly: Independent CPA review
- Annually: Full audit of reserves and supply

---

## 6. Incident Response

### 6.1 Reserve Shortfall

**Definition**: `FTHUSD_supply > USD_reserves`

**Response**:
1. Immediate system pause
2. Freeze all mint operations
3. Investigation:
   - Verify bank balances (requery APIs, check statements)
   - Verify XRPL supply (cross-check with multiple nodes)
   - Identify cause: accounting error, unauthorized mint, bank error
4. Remediation:
   - If accounting error: Correct records, update registry
   - If unauthorized mint: Burn excess FTHUSD, investigate security breach
   - If bank error: Work with bank to resolve
5. Once resolved and verified:
   - Update `ReserveRegistry`
   - Unpause system
   - Post-mortem report

### 6.2 Over-Collateralization

**Definition**: `USD_reserves > FTHUSD_supply + buffer`

**Response**:
- No immediate action required (over-collateralization is acceptable)
- Consider:
  - Minting additional FTHUSD if customer demand exists
  - Transferring excess reserves to yield-generating accounts
  - Maintaining buffer for operational flexibility

---

## 7. Responsibilities

### 7.1 Treasury Operations

- Daily bank balance imports
- Reserve registry updates
- Monitor for invariant violations
- Execute remediation plans

### 7.2 Compliance

- Review monthly PoR reports
- Investigate anomalies
- Coordinate with external auditors
- Ensure regulatory compliance

### 7.3 Engineering

- Maintain automated monitoring and alerting
- Develop and test invariant checks
- Support incident response
- Ensure `bank-gateway-service` and `ReserveRegistry` reliability

### 7.4 Executive

- Review monthly PoR snapshots
- Approve reserve management policies
- Escalation point for critical incidents

---

## 8. Audit and Transparency

### 8.1 Internal Audit

- Quarterly review of PoR processes
- Verify controls are functioning
- Test incident response procedures

### 8.2 External Audit (Optional/Required)

- Annual audit of reserves and supply
- CPA attestation of PoR report accuracy
- Compliance with regulatory requirements (if applicable)

### 8.3 Public Transparency (Optional)

- Publish monthly PoR reports (redacted for privacy)
- On-chain verification via `ReserveRegistry` (public reads)
- Third-party attestation links

---

## 9. Related Documents

- `ARCHITECTURE.md` – System architecture
- `SYSTEM-FLOW-FTHUSD-USDF.md` – Token flows
- `MINT-BURN-RUNBOOK.md` – Operational procedures

## 10. Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-17 | 0.1.0 | Initial draft | FTH Engineering |
