# Information Security Policy – Outline

**Purpose**: Establish security standards for FTH infrastructure and operations.

---

## 1. Scope

Applies to:
- All FTH employees, contractors, partners
- All systems handling customer data, wallets, or financial operations
- XRPL nodes, services, EVM contracts, databases

---

## 2. Access Control

- **Principle of Least Privilege**: Users granted minimum access needed
- **Role-Based Access Control (RBAC)**: Access by role (treasury, compliance, eng, etc.)
- **Multi-Factor Authentication (MFA)**: Required for all admin access
- **VPN**: Required for access to internal networks

---

## 3. Key Management

- **Issuer Keys**: Stored in HSM or secure vault (e.g., AWS KMS, HashiCorp Vault)
- **No Plaintext Keys**: Never commit keys to Git, logs, or config files
- **Key Rotation**: Annually or after any suspected compromise
- **Multi-Signature**: Treasury operations require 2-of-3 approval

---

## 4. Data Protection

- **Encryption at Rest**: All databases encrypted (AES-256)
- **Encryption in Transit**: TLS 1.3 for all API calls
- **PII Handling**: Customer data encrypted, access logged
- **Data Retention**: Per KYC/AML requirements (5 years)

---

## 5. Network Security

- **Firewalls**: All nodes behind firewalls
- **IP Whitelisting**: Treasury node restricted to known IPs
- **DDoS Protection**: Member API node behind Cloudflare or equivalent
- **Intrusion Detection**: Monitor for suspicious activity

---

## 6. Monitoring and Logging

- **All Actions Logged**: Who, what, when, where
- **Centralized Logging**: Splunk / ELK / CloudWatch
- **Alert Thresholds**: Failed logins, unusual activity, errors
- **Audit Trail**: 7-year retention for financial operations

---

## 7. Incident Response

### 7.1 Incident Types

- Security breach (unauthorized access)
- Data leak (PII exposure)
- System compromise (malware, hack)
- Key compromise (issuer keys stolen)

### 7.2 Response Steps

1. Detect: Monitoring alerts
2. Contain: Isolate affected systems
3. Investigate: Root cause analysis
4. Remediate: Fix vulnerability
5. Notify: Customers, regulators (if required)
6. Post-Mortem: Document and improve

---

## 8. Third-Party Vendors

- **Due Diligence**: Vet all vendors for security
- **SOC 2 / ISO 27001**: Prefer certified vendors
- **Data Processing Agreements**: Required for PII handling
- **Regular Reviews**: Annual vendor security audits

---

## 9. Employee Training

- **Security Awareness**: Annual training for all staff
- **Phishing Tests**: Quarterly simulated phishing
- **Incident Drills**: Semi-annual tabletop exercises

---

## 10. Compliance

- **SOC 2 Type II**: Target certification
- **GDPR / CCPA**: Compliance if serving EU/CA customers
- **PCI-DSS**: If handling card data (N/A for crypto-only)

---

## 11. Penalties

Violations may result in:
- Termination of employment/contract
- Legal action
- Regulatory penalties

---

**Next Steps**: Full security audit, penetration testing, SOC 2 preparation.
