# Glossary

| Term | Definition |
|------|------------|
| FTHUSD | USD-backed institutional token managed via MintGuard and ReserveRegistry. |
| USDF | Client/member transactional rail backed by FTHUSD vault reserves. |
| MintGuard | Contract enforcing supply caps and reserve-backed minting logic. |
| ReserveRegistry | Contract tracking USD-equivalent reserves backing issued tokens. |
| SystemGuard | Contract providing global pause and emergency controls. |
| Treasury Role | Privileged role allowed to request/confirm mints and record burns. |
| Guardian Role | Role that can pause/unpause and toggle emergency mode. |
| Proof-of-Reserves (PoR) | Process and attestations validating on-chain supply ≤ off-chain reserves. |
| KYC/AML | Compliance processes for identity verification and anti-money laundering checks. |
| CBDC Bridge | Interoperability layer connecting FTH ecosystem to central bank digital currency rails. |
| Emergency Mode | Elevated control state restricting sensitive operations during crises. |
| Global Cap | Maximum net minted supply allowed by governance policies. |
| Net Minted | Total minted minus burned amount tracked by MintGuard. |
| Invariant | Condition that must always hold (e.g., net minted ≤ total reserves). |
