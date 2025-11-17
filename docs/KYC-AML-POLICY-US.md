# KYC/AML Policy – US Jurisdiction

## 1. Purpose

This policy establishes the Know Your Customer (KYC) and Anti-Money Laundering (AML) requirements for Future Tech Holdings' FTHUSD and USDF stablecoin operations in the United States.

---

## 2. Regulatory Framework

FTH operates under:

- Bank Secrecy Act (BSA)
- USA PATRIOT Act
- FinCEN regulations for money services businesses (if applicable)
- OFAC sanctions programs
- State money transmitter laws (as applicable)

---

## 3. Customer Onboarding

### 3.1 Customer Types

- **Individual**: Natural persons (retail customers)
- **Business**: Corporations, LLCs, partnerships
- **Institutional**: Banks, broker-dealers, registered investment advisers

### 3.2 Required Information

#### Individuals

- Full legal name
- Date of birth
- Residential address (no PO boxes)
- Government-issued ID (driver's license, passport)
- Social Security Number (SSN) or Tax ID
- Source of funds
- Intended use of FTHUSD/USDF

#### Businesses

- Legal entity name
- EIN (Employer Identification Number)
- Business address
- Incorporation documents
- Beneficial ownership information (individuals owning ≥25%)
- Authorized signers
- Business purpose and expected transaction volume

### 3.3 KYC Verification

**Provider**: [Jumio / Onfido / Chainalysis / Sumsub]

**Process**:
1. Customer submits information via compliance portal
2. Document verification (ID authenticity, liveness check)
3. Data validation (SSN/EIN verification, address validation)
4. Sanctions screening (OFAC, UN, EU lists)
5. PEP (Politically Exposed Person) screening
6. Adverse media screening
7. Risk scoring

**Outcome**:
- **Approved**: Customer added to `ComplianceRegistry`, membership NFT minted
- **Rejected**: Customer notified, no account created
- **Manual Review**: Escalated to compliance officer

### 3.4 Enhanced Due Diligence (EDD)

Required for:
- High-risk customers (risk tier: HIGH)
- PEPs
- Customers from high-risk jurisdictions
- Large transaction volumes (>$10,000/day)

**Additional Requirements**:
- Source of wealth documentation
- Enhanced background checks
- Senior management approval

---

## 4. Sanctions Screening

### 4.1 Lists

- OFAC SDN (Specially Designated Nationals)
- OFAC Sectoral Sanctions
- UN Security Council Sanctions
- EU Consolidated Sanctions
- UK HM Treasury Sanctions

### 4.2 Screening Frequency

- **Onboarding**: 100% of customers
- **Ongoing**: Daily batch screening of all active customers
- **Transaction**: Real-time screening for all mint/burn operations

### 4.3 Hits and Escalation

**True Positive**:
- Customer account blocked immediately
- Funds frozen
- SAR (Suspicious Activity Report) filed with FinCEN (within 30 days)
- OFAC report filed (within 10 days if required)
- Legal review

**False Positive**:
- Manual review by compliance officer
- If cleared: Customer approved
- If unclear: Additional documentation requested

---

## 5. Transaction Monitoring

### 5.1 Thresholds

- **$3,000+**: Automated review
- **$10,000+**: Enhanced monitoring
- **$50,000+**: Manual approval required

### 5.2 Red Flags

- Structuring (multiple transactions just under reporting threshold)
- Rapid movement of funds (mint → transfer → burn within hours)
- Transactions with known high-risk wallets
- Unusual transaction patterns
- Transactions inconsistent with customer profile

### 5.3 Suspicious Activity Reporting (SAR)

**Triggers**:
- Suspected money laundering
- Terrorist financing
- Fraud
- Structuring
- Transactions with sanctioned entities

**Process**:
1. Compliance officer reviews flagged transaction
2. If suspicious: Gather supporting documentation
3. File SAR with FinCEN (within 30 days)
4. Do NOT notify customer (Tipping Off prohibition)
5. Maintain records for 5 years

---

## 6. Record Keeping

### 6.1 Retention Periods

- **Customer records**: 5 years after account closure
- **Transaction records**: 5 years from transaction date
- **SARs**: 5 years from filing date
- **Sanctions screening logs**: 5 years

### 6.2 Storage

- Secure internal database (encrypted at rest)
- Access controls (role-based)
- Audit logging (who accessed what, when)
- Backup and disaster recovery

---

## 7. Ongoing Monitoring

### 7.1 Customer Refresh

- **Annual**: Re-screen all customers for sanctions, PEP status
- **Risk-based**: High-risk customers reviewed every 6 months

### 7.2 Wallet Monitoring

- Monitor all XRPL wallets associated with FTH customers
- Flag interactions with known high-risk addresses
- Use blockchain analytics (Chainalysis, Elliptic, TRM Labs)

---

## 8. Risk-Based Approach

### 8.1 Risk Tiers

| Tier | Criteria | Due Diligence |
|------|----------|---------------|
| LOW | US individual, low volume, no red flags | Standard KYC |
| MEDIUM | US business, moderate volume | Standard KYC + ongoing monitoring |
| HIGH | PEPs, high volume, complex structures | Enhanced Due Diligence (EDD) |
| BLOCKED | Sanctions hit, fraud | Account blocked, SAR filed |

### 8.2 Risk-Based Controls

- **LOW**: Automated approval, standard monitoring
- **MEDIUM**: Automated approval, enhanced monitoring
- **HIGH**: Manual approval, continuous monitoring, periodic reviews
- **BLOCKED**: No access, law enforcement coordination

---

## 9. Training

### 9.1 Frequency

- **Initial**: All employees handling customer data
- **Annual**: Refresher training for all staff
- **Ad-hoc**: When regulations change

### 9.2 Topics

- BSA/AML regulations
- KYC procedures
- Sanctions screening
- Red flags and suspicious activity
- SAR filing
- Record keeping

---

## 10. Independent Testing

### 10.1 Frequency

- Annual independent audit of AML program

### 10.2 Scope

- Policies and procedures review
- Transaction monitoring effectiveness
- Sanctions screening accuracy
- Record keeping compliance
- Training completeness

---

## 11. Compliance Officer

### 11.1 Responsibilities

- Oversee AML program
- Review and approve high-risk customers
- Investigate suspicious activity
- File SARs and OFAC reports
- Coordinate with regulators and law enforcement
- Ensure staff training
- Manage independent testing

### 11.2 Contact

- Name: [Compliance Officer Name]
- Email: compliance@futuretech.holdings
- Phone: [Phone Number]

---

## 12. Prohibited Customers

FTH will not onboard or serve:

- Individuals or entities on OFAC SDN or other sanctions lists
- Residents of embargoed countries (Cuba, Iran, North Korea, Syria, Crimea)
- Unlicensed money services businesses
- Shell banks
- Customers refusing to provide required information
- Customers with known ties to terrorist organizations

---

## 13. Related Documents

- `ARCHITECTURE.md` – System architecture
- `SYSTEM-FLOW-FTHUSD-USDF.md` – Token flows
- `STABLECOIN-POR-POLICY.md` – Proof of reserves

## 14. Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-17 | 0.1.0 | Initial draft | FTH Compliance |
