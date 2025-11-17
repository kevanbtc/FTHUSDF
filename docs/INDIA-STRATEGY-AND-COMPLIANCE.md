# India Strategy & Compliance Blueprint

Version: 1.0  
Date: 2025-11-17  
Owner: International Expansion; Compliance

---

## 1. Objectives

- Enable FTH verticals to settle domestically in India with instant rails
- Support cross‑border corridors to US in a compliant manner
- Align with RBI, PMLA, FEMA; use licensed partners for fiat on/off ramps

---

## 2. Regulatory Landscape (non‑exhaustive)

- **RBI**: Payments, KYC/KYB, data localization expectations
- **PMLA**: Anti‑money laundering requirements
- **FEMA**: Cross‑border flows, current account transactions
- **UIDAI/Aadhaar**: Authentication restricted to regulated entities
- **CKYC**: Central KYC registry for individuals; integrate via partner bank/KRA
- **Data Protection**: DPDP Act; data localization best practices

FTH posture: operate via partnerships with regulated entities (banks/PPIs),
keep crypto‑specific retail offerings out of scope; XRPL used for closed‑loop treasury rails and enterprise settlement with KYC.

---

## 3. Payment Interoperability

- **UPI**: Collections (VPA/QR) and payouts via partner bank APIs
- **BBPS**: Bill pay rails for utilities/rent when relevant to projects
- **AEPS**: Avoid unless via bank partner; subject to Aadhaar rules
- **RuPay**: Optional card issuance through partner; corporate use cases

---

## 4. Identity & Data Stack

- **CKYC**: Pull KYC artifacts where available; reduce friction
- **DigiLocker**: Consent‑backed document retrieval (PAN, DL, etc.)
- **Account Aggregator (AA)**: Cash‑flow underwriting and risk scoring with consent
- **PAN**: Mandatory for tax compliance
- **Aadhaar**: Do not directly use unless via bank/regulated FI per law

PII Residency: Store KYC artifacts within India region; encrypt at rest/in transit; minimize data export.

---

## 5. Technical Footprint (India)

- **XRPL Node (Mumbai)**: Low‑latency read node for member portals, analytics
- **API Edge**: Region‑local API gateway and WAF; Cloud HSM for keys where required
- **Observability**: Region dashboards; latency and ledger age SLOs

---

## 6. Treasury Patterns

- Domestic settlement in INR with UPI/NEFT/RTGS via partner bank
- Cross‑border corridor: INR→USD via regulated channels; FTHUSD as treasury rail where compliant
- Localized PoR: segregate India‑specific reserve tracking if needed; privacy preserving reports

---

## 7. Compliance Controls

- KYC/KYB mapped to Indian norms; sanctions (MEITY/UN/US lists)
- Risk tiers and transaction monitoring thresholds tuned to INR volumes
- Recordkeeping per PMLA and DPDP retention rules

---

## 8. Rollout Plan

1. Partner selection (bank/PPI; API‑friendly; UPI proficiency)
2. Legal review and sandbox scope definition
3. Local node and API edge deployment
4. Pilot with one vertical (e.g., Energy project payouts)
5. Expand to real estate tenant flows and education stipends

---

## 9. Communications & Positioning

- Focus on enterprise settlement, CSR payouts, and export services
- Avoid retail‑crypto positioning; highlight auditability and controls

---

## 10. Risks & Mitigations

- Regulatory uncertainty → partner‑first model; limited retail scope
- Bank dependency → multi‑partner strategy; failover rails
- Data sovereignty → strict residency; third‑party security reviews
