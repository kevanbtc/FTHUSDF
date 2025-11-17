# Mint/Burn Operational Runbook

## Purpose

This runbook provides step-by-step procedures for treasury operations team to execute FTHUSD/USDF mint and burn operations safely and compliantly.

---

## 1. Pre-Flight Checklist

Before any mint or burn operation:

- [ ] Verify system is not paused (`SystemGuard.isPaused()` = false)
- [ ] Confirm no active incidents or alerts
- [ ] Verify all services are healthy (check `/health` endpoints)
- [ ] Confirm XRPL nodes are synced (lag < 5 seconds)
- [ ] Ensure compliance officer is available for approvals

---

## 2. FTHUSD Mint Procedure

### 2.1 Prerequisites

- Customer has completed KYC and been approved
- Customer has active membership NFT
- USD wire received and recorded in bank account
- Bank balance imported into `ReserveRegistry`

### 2.2 Steps

1. **Verify Customer Status**
   ```bash
   curl https://compliance-service/customers/{customer_id}/status
   ```
   - Confirm `status: approved`
   - Confirm `riskTier: LOW | MEDIUM | HIGH` (not BLOCKED)

2. **Verify Bank Receipt**
   ```bash
   curl https://bank-gateway-service/transactions?customerId={customer_id}
   ```
   - Confirm wire received for correct amount
   - Note transaction ID for audit trail

3. **Check Mint Allowance**
   ```bash
   curl -X POST https://treasury-service/mint/fthusd/check \
     -d '{"amount": 10000, "destination": "rWalletAddress..."}'
   ```
   - Confirm `canMint: true`
   - If false, review reason and remediate

4. **Execute Mint**
   ```bash
   curl -X POST https://treasury-service/mint/fthusd \
     -d '{
       "amount": 10000,
       "destination": "rWalletAddress...",
       "reason": "customer_deposit",
       "customerId": "cust_123",
       "bankTransactionId": "wire_456"
     }'
   ```

5. **Verify Mint**
   - Wait for XRPL transaction to validate (3-5 seconds)
   - Confirm transaction hash returned
   - Check customer wallet balance on XRPL
   - Verify `MintGuard.totalNetMinted()` increased

6. **Notify Customer**
   - Email: "Your FTHUSD has been minted"
   - Include transaction hash for transparency

7. **Record in Audit Log**
   - Log all details (amount, customer, tx hash, operator, timestamp)

---

## 3. FTHUSD Burn Procedure (Redemption)

### 3.1 Prerequisites

- Customer has submitted redemption request
- Customer FTHUSD balance >= redemption amount
- Customer bank account on file and verified
- No compliance holds on customer account

### 3.2 Steps

1. **Verify Customer Request**
   - Confirm redemption amount
   - Confirm destination bank account (ACH/wire details)

2. **Check Customer Wallet Balance**
   ```bash
   curl https://xrpl-core-api/account/rWalletAddress.../balances
   ```
   - Confirm FTHUSD balance >= redemption amount

3. **Execute Burn**
   ```bash
   curl -X POST https://treasury-service/burn/fthusd \
     -d '{
       "amount": 10000,
       "source": "rWalletAddress...",
       "bankAccountId": "bank_acct_789",
       "customerId": "cust_123",
       "reason": "redemption"
     }'
   ```

4. **Verify Burn**
   - Confirm XRPL transaction hash
   - Verify tokens burned (balance reduced)
   - Confirm `MintGuard.totalNetMinted()` decreased

5. **Initiate Fiat Payout**
   - `bank-gateway-service` automatically initiates wire/ACH
   - Confirm payout ID returned

6. **Monitor Payout**
   - Track wire status (pending → clearing → completed)
   - Typically 1-3 business days for ACH, same-day for wire

7. **Update Reserves**
   - After payout clears, reserves updated automatically
   - Verify `ReserveRegistry.totalReservesUsd()` decreased

8. **Notify Customer**
   - Email: "Your redemption is complete, USD sent to bank account"

---

## 4. USDF Mint Procedure

### 4.1 Prerequisites

- Sufficient FTHUSD in backing vault wallet
- `USDF_supply + mint_amount <= FTHUSD_backing_balance`

### 4.2 Steps

1. **Check Backing Balance**
   ```bash
   curl https://treasury-service/usdf/backing-status
   ```
   - Confirm `healthy: true`

2. **Execute USDF Mint**
   ```bash
   curl -X POST https://treasury-service/mint/usdf \
     -d '{
       "amount": 5000,
       "destination": "rWalletAddress...",
       "purpose": "internal_allocation",
       "reason": "loyalty_reward"
     }'
   ```

3. **Verify Mint**
   - Confirm XRPL tx hash
   - Verify customer USDF balance increased

---

## 5. Emergency Procedures

### 5.1 System Pause

**When to Use**: Critical security issue, reserve shortfall, regulatory order

**Steps**:
1. Contact guardian (multi-sig holder)
2. Execute: `SystemGuard.pause("reason: [describe issue]")`
3. Verify all mint operations halted
4. Notify all stakeholders (treasury, compliance, executive, customers)
5. Investigate issue
6. Remediate
7. Unpause only after full resolution and approval

### 5.2 Reserve Shortfall

**Detection**: Automated alert from daily reconciliation

**Steps**:
1. System automatically pauses
2. Treasury team verifies bank balances (manual check)
3. Identify discrepancy source:
   - Bank error: Contact bank, request correction
   - Accounting error: Correct records, update registry
   - Unauthorized mint: Investigate security breach, burn excess
4. Once resolved: Update `ReserveRegistry`, unpause
5. Post-mortem report required

### 5.3 Compliance Hold

**Trigger**: Customer flagged for AML review

**Steps**:
1. Compliance officer updates customer status to BLOCKED
2. No new mints to customer wallet
3. Existing balance frozen (if required by law enforcement)
4. Coordinate with legal team
5. File SAR if required
6. After resolution: Update customer status, unfreeze if appropriate

---

## 6. Contacts

- **Treasury Lead**: treasury@futuretech.holdings
- **Compliance Officer**: compliance@futuretech.holdings
- **On-Call Engineer**: PagerDuty rotation
- **Executive Escalation**: CFO / CEO

---

## 7. Related Documents

- `ARCHITECTURE.md`
- `SYSTEM-FLOW-FTHUSD-USDF.md`
- `KYC-AML-POLICY-US.md`
- `STABLECOIN-POR-POLICY.md`
