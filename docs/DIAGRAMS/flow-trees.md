# FTH XRPL Backbone — System Flow Trees & Diagrams

This page consolidates the key senior-level diagrams for architecture reviews, onboarding new engineers, and audit preparation. All flows are aligned with invariants and control-plane enforcement.

---

## High-Level Architecture

```mermaid
flowchart TB
  subgraph XRPL[XRPL Network]
    CORE[Core Node\n(analytics/routing)]
    TREAS[Treasury Node\n(issuer rail)]
    MEMAPI[Member API Node\n(client reads)]
  end

  subgraph Services[Service Layer]
    XAPI[xrpl-core-api\n(routes & ledger ops)]
    COMP[compliance-service\n(KYC/sanctions)]
    MEMB[membership-service\n(NFT + registry)]
    TREA[treasury-service\n(mint/burn orchestration)]
    BANK[bank-gateway-service\n(reserve importer)]
  end

  subgraph EVM[Control Plane (EVM)]
    SYS[SystemGuard\n(pause)]
    MINT[MintGuard\n(caps & canMint)]
    RSV[ReserveRegistry\n(bank balances)]
    KYC[ComplianceRegistry\n(whitelist/risk)]
  end

  BANKS[(Bank Accounts)]

  BANKS -- balances --> RSV
  COMP -- writes/reads --> KYC
  TREA -- checks --> MINT
  TREA -- checks --> SYS
  XAPI <---> CORE
  XAPI <---> TREAS
  XAPI <---> MEMAPI
  TREA --> TREAS
```

---

## Onboarding / Compliance Flow

```mermaid
flowchart LR
  A[Submit KYC] --> B[Provider Check]
  B -->|Approved| C[ComplianceRegistry.whitelist]
  C --> D[Membership NFT Issue]
  D --> E[Wallet Eligible]
  B -->|Denied| F[Manual Review]
```

---

## Mint Sequence (XRPL + EVM Guard)

```mermaid
sequenceDiagram
  participant BG as Bank Gateway
  participant RSV as ReserveRegistry
  participant M as MintGuard
  participant TS as Treasury Service
  participant TN as XRPL Treasury Node
  participant W as Wallet
  BG->>RSV: updateReserve(bankId, amount)
  TS->>M: canMint(amount)
  M-->>TS: ok
  TS->>TN: Issue IOU
  TS->>M: confirmMint(amount, xrplTxHash)
```

---

## Reserves Update Pipeline

```mermaid
flowchart LR
  CSV[(Bank CSV/API)] --> PARSE[bank-gateway-service\nparse/import]
  PARSE --> AGG[Aggregate balances]
  AGG --> CALL[ReserveRegistry.updateReserve()]
  CALL --> RSV[ReserveRegistry]
  RSV --> MINTCHK[MintGuard.canMint()]
```

---

## FTHUSD → USDF Conversion

```mermaid
flowchart LR
  REQ[Member Request USDF] --> VAULT[Move FTHUSD to USDF_Vault]
  VAULT --> ISSUE[Issue USDF]
  ISSUE --> WAL[Member Wallet]
  NOTE[Invariant: USDF_supply ≤ FTHUSD_in_vault] --> ISSUE
```

---

## Redemption to USD

```mermaid
flowchart LR
  REDEEM[Member Redeem] --> BURNUSDF[Burn/Lock USDF]
  BURNUSDF --> BURNF[Burn FTHUSD]
  BURNF --> RECORD[MintGuard.recordBurn()]
  RECORD --> PAYOUT[Bank Gateway Payout]
```

---

## Emergency Pause

```mermaid
flowchart LR
  TRIG[Trigger: shortfall / sanctions / keys] --> PAUSE[SystemGuard.pause()]
  PAUSE --> BLOCK[MintGuard.canMint() = false]
  BLOCK --> HALT[All mints halt]
```

---

## Node Routing Logic

```mermaid
flowchart TD
  OP[Operation] -->|mint/burn| T[Treasury Node]
  OP -->|public_query| M[Member API Node]
  OP -->|other| C[Core Node]
```

---

## CBDC Gateway (Two-Phase Commit)

```mermaid
flowchart TB
  subgraph CBDC[CBDC Realm]
    L[Lock/Hold]
  end
  subgraph XRPL[XRPL]
    I[Issue IOU]
    B[Burn/Reversal]
  end
  L --> I
  I -->|confirm| L
  I -->|failure| B
```
