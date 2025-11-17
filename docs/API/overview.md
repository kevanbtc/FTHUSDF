# Service API Overview

Index of internal services and purpose. Detailed endpoints to follow.

## xrpl-core-api (8080)
- POST /xrpl/payment — routed submits
- POST /xrpl/trustline
- GET /xrpl/account/:address
- GET /xrpl/account/:address/balances
- GET /health

## compliance-service (8081)
- POST /customers/onboard — KYC + sanctions + registry write
- POST /sanctions/check — optional direct check

## membership-service (TBD)
- POST /nft/mint
- POST /nft/burn
- POST /wallets/link

## treasury-service (8082)
- POST /mint/fthusd
- POST /burn/fthusd
- POST /mint/usdf
- POST /burn/usdf

## bank-gateway-service (TBD)
- POST /reserves/update — push balances to ReserveRegistry
- POST /payouts/initiate — wire/ACH payouts
