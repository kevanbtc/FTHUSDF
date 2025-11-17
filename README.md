# FTH XRPL Backbone – FTHUSD / USDF Infrastructure

This repo is the **authoritative reference** for Future Tech Holdings' XRPL-based
stablecoin and membership infrastructure.

It describes:

- The XRPL node fleet (core / treasury / member-api)
- FTHUSD (treasury stablecoin) and USDF (client rail)
- KYC/AML and sanctions controls
- Proof-of-Reserves policy and invariants
- Smart-contract control plane for mint/burn safety
- Service layout (XRPL Core API, Compliance, Treasury, Bank Gateway)
- Infrastructure and compliance test suites

> This repo is documentation + scaffolding. Production secrets, actual bank
> credentials, and private keys **must never** be committed here.

## High-Level Components

- **XRPL Layer**
  - 3-node fleet:
    - Core node – analytics and bots
    - Treasury node – issuer and treasury flows only
    - Member API node – external-facing reads
  - Issued currencies:
    - `FTHUSD` – USD-backed institutional stablecoin
    - `USDF` – client-facing payment / utility token
  - Membership NFTs:
    - KYC membership badge per wallet

- **EVM Control Plane (contracts/)**
  - `ComplianceRegistry` – who is allowed in
  - `MintGuard` – when and how much can be minted/burned
  - `ReserveRegistry` – what reserves we claim to have
  - `SystemGuard` – global pause / emergency controls
  - `MembershipNFTRegistry` – optional on-chain view of membership

- **Service Layer (services/)**
  - `xrpl-core-api` – internal XRPL gateway
  - `compliance-service` – KYC/AML + registry bridge
  - `membership-service` – NFTs + wallet/membership logic
  - `treasury-service` – runs mint/burn flows using the guards
  - `bank-gateway-service` – ingests US bank activity and updates reserves

- **Documentation (docs/)**
  - Architecture, system flows, KYC/AML, PoR, runbooks, legal outlines

- **Tests (tests/)**
  - Infra health + invariants
  - Compliance behavior
  - Contract-level invariants

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Open this repo in VS Code. Recommended extensions:

   * Solidity
   * ESLint
   * Prettier
   * YAML

3. Read `docs/ARCHITECTURE.md` and `docs/SYSTEM-FLOW-FTHUSD-USDF.md` before writing code.

4. Run smoke tests:

   ```bash
   pnpm test:infra
   pnpm test:contracts
   ```

## Directory Structure

```
fth-xrpl-backbone/
├─ contracts/          # EVM control plane (Solidity)
├─ services/           # Node.js/TypeScript services
├─ infra/              # Infrastructure docs and scripts
├─ docs/               # Architecture, policies, runbooks
└─ tests/              # Test suites (infra, compliance, contracts)
```

## Development Workflow

1. **Contracts**: Use Hardhat for compile/test/deploy
   ```bash
   pnpm compile
   pnpm test:contracts
   ```

2. **Services**: Each service has its own package.json
   ```bash
   cd services/xrpl-core-api
   pnpm install
   pnpm dev
   ```

3. **Tests**: Run all test suites
   ```bash
   pnpm test
   ```

## Security & Compliance

- All mint/burn operations must pass through `MintGuard` and `ComplianceRegistry`
- XRPL treasury node access is restricted to authorized services only
- KYC/AML checks are required before any customer onboarding
- Daily PoR reconciliation ensures reserves >= supply

See `docs/KYC-AML-POLICY-US.md` and `docs/STABLECOIN-POR-POLICY.md` for details.

## Contributing

1. Create a feature branch from `main`
2. Follow the existing code structure and naming conventions
3. Ensure all tests pass before submitting PR
4. Update documentation for any architectural changes

## License

Proprietary - Future Tech Holdings. All rights reserved.
