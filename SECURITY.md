# Security Policy

## Supported Branches

| Branch | Status |
|--------|--------|
| main   | Active security support |

## Reporting a Vulnerability

Please email [security@fth.finance](mailto:security@fth.finance) with:

- Description of the issue
- Steps to reproduce / PoC
- Impact assessment
- Suggested remediation (optional)

We will acknowledge within 72 hours and provide a triage status within 7 days.

## Disclosure Process

1. Report received, internal ticket created.
2. Triage: severity scored (CVSS baseline + business impact).
3. Fix window:
   - Critical: 7 days
   - High: 14 days
   - Medium: 30 days
   - Low: 90 days / next scheduled release
4. Optional coordinated disclosure with researcher.
5. Public security advisory after patch release.

## Scope

In-scope components:

- Smart contracts in `contracts/`
- Treasury and compliance services in `services/`
- Proof-of-Reserves and mint/burn runbooks (process integrity)

Out-of-scope:

- Third-party upstream dependencies
- Social engineering attacks
- Issues requiring on-chain governance changes beyond code adjustments

## Key Invariants to Protect

- Minting restricted by global cap and reserves.
- Pause & emergency controls cannot be bypassed.
- Reserve balances never allow total minted > total reserves.
- Role-based access (ADMIN, TREASURY, GUARDIAN, RESERVE_ADMIN) enforced.

## Secure Development Guidelines

- Use least-privilege roles; avoid multi-purpose admin keys.
- Perform review for any external call additions.
- Document threat model deltas in PRs touching guard/registry contracts.

## Dependency Monitoring

Run `pnpm audit` monthly and after adding new dependencies.

## Contact

For general questions: [engineering@fth.finance](mailto:engineering@fth.finance)
For urgent escalation: [security@fth.finance](mailto:security@fth.finance) (Subject: URGENT)
