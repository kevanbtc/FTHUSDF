# Global Roll‑Out Playbook

Version: 1.0  
Date: 2025-11-17

---

## 1. Objectives

- Expand FTH’s digital finance platform globally with local compliance
- Maintain solvency and security invariants across regions

---

## 2. Deployment Phases

1. US MVP (live) → proof of solvency, ops maturity
2. India Pilot → partner‑led on/off ramps; local node; UPI payouts
3. EU/UK → e‑money/EMI partnerships; GDPR alignment; SEPA rails
4. GCC/MEA → FX corridors; energy projects; localized KYC
5. APAC (SG) → MAS sandbox; corridor hub; regional node mesh

---

## 3. Region Bundle (per country)

- Legal & Licensing: MSB/MTL or equivalent; partner contracts
- Banking: at least one primary + one secondary partner bank
- Infra: 1 public read node + 1 internal node; API edge; monitoring
- Compliance: regional sanctions lists; KYC docs; retention policies
- Data: residency and transfer controls; key management

---

## 4. Technical Standards

- Node SLOs: <2s latency; <5s ledger age; ≥5 peers
- Security: HSM/MPC for keys; WAF; DDoS protection; zero‑trust access
- Observability: logs, metrics, traces; incident runbooks

---

## 5. Go/No‑Go Checklist

- Invariants green (supply ≤ reserves; no debt to reserves)
- Bank letters on reserve balances
- Contracts deployed with multi‑sig ownership
- Monitoring and alerting tested
- Legal review and Board approval

---

## 6. Commercial Motion

- Institutional API product: SLA‑backed XRPL access
- Issuer onboarding: white‑label stablecoin rails
- Data products: attestation feeds; analytics APIs

---

## 7. Risks

- Regulatory shifts → phased rollouts; exit plans
- Banking outages → multi‑bank; cash buffers; pause policies
- Infra attacks → layered defense; drills; third‑party assessments
