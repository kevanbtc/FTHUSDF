# CBDC Interoperability Principles & Reference Architecture

Version: 1.0  
Date: 2025-11-17

---

## 1. Context

CBDCs (e.g., RBI e₹) operate on sovereign infrastructure with regulated access. XRPL provides open settlement rails and a powerful IOU model. Interoperability must preserve regulatory boundaries while enabling programmatic flows.

---

## 2. Design Goals

- Preserve compliance domains (CBDC realm vs XRPL realm)
- Provide atomic or near‑atomic coordination between realms
- Ensure reversibility paths and audit artifacts
- Avoid re‑hypothecation; keep FTHUSD issuance constrained by reserves

---

## 3. Reference Patterns

### 3.1 Gateway Orchestrator (Two‑Phase Commit)

```text
Step 1: Lock CBDC funds (or obtain irrevocable debit authorization)
Step 2: Issue XRPL IOU (FTHUSD/USDF) to recipient
Step 3: Confirm CBDC settlement (or roll back XRPL via burn/credit)
Artifacts: CBDC txn ID, XRPL hash, signed receipts
```

### 3.2 Escrow/Hold & Confirm

- CBDC side places hold; XRPL side holds IOU in escrow
- Upon finality on both sides, release to parties

### 3.3 Trusted Operator with SLAs

- For pilot phases where atomicity APIs are unavailable
- Contractual SLAs + insurance + audit ensure integrity

---

## 4. Roles & Trust Boundaries

- Regulated entity (bank/PSP) operates CBDC‑side components
- FTH operates XRPL components and EVM control plane
- Joint audit log spans both realms

---

## 5. Controls & Telemetry

- Pre‑checks: whitelist, limits, pause state, reserves
- Runtime: dual‑hash linking (CBDC_txn_id ↔ XRPL_tx_hash)
- Post‑ops: reconciliation dashboards; exception handling flows

---

## 6. India (e₹) Considerations

- Work with partner bank in RBI pilot/sandbox constructs
- Follow RBI technical and operational guidelines
- Scope: enterprise disbursements; treasury ops; CSR payments

---

## 7. Roadmap

- PoC with simulated CBDC API
- Partner bank sandbox pilot
- Limited production corridors with caps and monitoring
