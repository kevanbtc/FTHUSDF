# FTH System Flow – FTHUSD and USDF

## Overview

This document describes the **operational flow** of FTHUSD (institutional stablecoin) and USDF (client-facing payment token) within the FTH XRPL backbone.

---

## 1. FTHUSD Flow (Institutional)

### 1.1 Customer Onboarding

1. Customer submits KYC information via compliance portal
2. `compliance-service` initiates KYC check with provider
3. Upon approval:
   - Customer added to `ComplianceRegistry` with risk tier
   - Membership NFT minted via `membership-service`
   - Customer can now receive FTHUSD

### 1.2 Minting FTHUSD (Customer Deposit)

**Trigger**: Customer wires USD to FTH bank account

**Flow**:

1. Bank wire received → recorded in bank account
2. `bank-gateway-service` imports transaction
3. `bank-gateway-service` updates `ReserveRegistry` with new balance
4. Compliance officer approves mint request
5. `treasury-service` initiates mint:
   - Check `MintGuard.canMint(amount)`
   - Check `SystemGuard.isPaused()` → must be false
   - Check customer compliance status
   - Call `MintGuard.requestMint(amount, reasonCode)`
6. `treasury-service` executes XRPL payment from FTHUSD issuer to customer wallet (via `treasury` node)
7. `treasury-service` calls `MintGuard.confirmMint(amount, xrplTxHash)`
8. Customer receives FTHUSD in their wallet

**Invariants Enforced**:
- `totalNetMinted + amount <= totalReservesUsd`
- `totalNetMinted + amount <= globalCap`
- Customer wallet has active membership NFT

### 1.3 Burning FTHUSD (Customer Redemption)

**Trigger**: Customer requests USD redemption

**Flow**:

1. Customer sends FTHUSD to redemption wallet
2. `treasury-service` detects incoming FTHUSD
3. `treasury-service` verifies:
   - Customer KYC status
   - Bank account on file
   - No compliance holds
4. `treasury-service` executes XRPL payment from redemption wallet to FTHUSD issuer (burns tokens)
5. `treasury-service` calls `MintGuard.recordBurn(amount, xrplTxHash)`
6. `bank-gateway-service` initiates wire/ACH to customer bank account
7. Upon bank payout clearing:
   - `bank-gateway-service` updates `ReserveRegistry`
   - Customer receives USD

**Invariants Enforced**:
- Supply decreases by burn amount
- Reserves decrease by payout amount
- Supply always <= Reserves

---

## 2. USDF Flow (Client-Facing)

### 2.1 Minting USDF (Internal Distribution)

**Trigger**: Internal allocation or customer conversion from FTHUSD

**Flow**:

1. Treasury approves USDF mint
2. `treasury-service` checks:
   - Sufficient FTHUSD in backing vault wallet
   - `USDF_supply + amount <= FTHUSD_backing_balance`
3. `treasury-service` executes XRPL payment from USDF issuer to destination wallet
4. Internal ledger updated to track USDF supply vs FTHUSD backing

**Invariants Enforced**:
- `USDF_supply <= FTHUSD_backing_balance` at all times

### 2.2 Burning USDF (Conversion or Withdrawal)

**Trigger**: Customer requests conversion to FTHUSD or redemption

**Flow**:

1. Customer sends USDF to designated burn wallet
2. `treasury-service` detects incoming USDF
3. Options:
   - **Convert to FTHUSD**: Mint equivalent FTHUSD to customer
   - **Redeem to USD**: Follow FTHUSD burn flow (step 1.3)
4. `treasury-service` burns USDF (payment to issuer)
5. Internal ledger updated

**Invariants Enforced**:
- USDF supply decreases
- FTHUSD backing can be released if appropriate

### 2.3 USDF Transfers (Peer-to-Peer)

**Trigger**: Customer sends USDF to another customer

**Flow**:

1. Customer A sends USDF to Customer B via XRPL
2. No FTH services involved (native XRPL transfer)
3. Both wallets must have active membership NFTs
4. Compliance monitoring logs transaction for AML review

---

## 3. System Flows Diagram

```
[Customer] --wire USD--> [US Bank] --import--> [Bank Gateway]
                                                      |
                                                      v
                                              [ReserveRegistry]
                                                      |
                                                      v
[Customer] <--FTHUSD mint-- [Treasury Node] <-- [Treasury Service]
                                                      |
                                                      v
                                                [MintGuard] checks reserves

[Customer] --FTHUSD redeem--> [Redemption Wallet]
                                      |
                                      v
                              [Treasury Service]
                                      |
                                      v
                              [MintGuard.recordBurn]
                                      |
                                      v
                              [Bank Gateway] --wire USD--> [Customer Bank]
```

---

## 4. Emergency Scenarios

### 4.1 System Pause

**Trigger**: Critical security issue detected

**Flow**:
1. Guardian calls `SystemGuard.pause(reason)`
2. All mint operations halt
3. Existing tokens remain valid but no new mints
4. Redemptions may continue (configurable)
5. After resolution: Guardian calls `SystemGuard.unpause()`

### 4.2 Reserve Shortfall

**Trigger**: `USD_reserves < FTHUSD_supply`

**Flow**:
1. Daily reconciliation detects shortfall
2. Alerts triggered to treasury and compliance
3. `SystemGuard.pause()` automatically called
4. Investigation initiated
5. Options:
   - Wire additional USD to bank account
   - Burn excess FTHUSD
   - Resolve accounting error
6. Once resolved and reserves >= supply: Unpause

### 4.3 Compliance Hold

**Trigger**: Customer flagged for AML review

**Flow**:
1. Compliance service updates customer status
2. Customer wallet marked in `ComplianceRegistry` as BLOCKED
3. No new mints to customer wallet
4. Existing balance frozen (if required)
5. Review completed → status updated → customer can resume operations

---

## 5. Audit and Logging

All flows logged to:
- Internal audit database
- On-chain events (EVM contracts)
- XRPL transaction history

Logs include:
- Timestamps
- Operator/service identity
- Amounts
- Transaction hashes
- Reason codes
- Customer IDs (hashed for privacy)

---

## 6. Related Documents

- `ARCHITECTURE.md` – System architecture
- `KYC-AML-POLICY-US.md` – Compliance policies
- `STABLECOIN-POR-POLICY.md` – Proof of reserves
- `MINT-BURN-RUNBOOK.md` – Operational runbook
