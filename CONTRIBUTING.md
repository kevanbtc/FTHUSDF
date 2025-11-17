# Contributing Guide 🤝

Thanks for helping build the FTH Digital Finance Backbone.

## Scope
This repo contains stablecoin / membership doctrine, smart contracts (Solidity), services (TypeScript), infra scripts, and compliance/runbook documents.

## Principles
- Security first (no secrets, keys, PII in repo)
- Deterministic builds (pin dependencies where practical)
- Invariants protected (supply ≤ reserves) – never bypass guard contracts in code or tests
- Documentation parity (diagrams reflect current reality)

## Branching / Workflow
1. Create branch from `main`: `feat/*`, `fix/*`, `docs/*`, `chore/*`
2. Keep commits atomic; follow Conventional Commits at top-level: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
3. Rebase before PR to maintain a linear history
4. Squash if > 10 small commits

## Commit Message Examples
- `feat(treasury-service): add mint preflight retry backoff`
- `fix(mint-guard): correct cap calculation overflow edge case`
- `docs(readme): add new CBDC diagram`

## Code Style
- TypeScript: strict mode, prefer interfaces over types for public shapes
- Solidity: 0.8.20; SPDX + NatSpec comments on external/public functions; custom errors over require strings
- Avoid magic numbers; centralize constants

## Testing
- Unit tests for contract logic under `tests/contracts` (Hardhat)
- Invariant tests under `tests/infra`
- Compliance scenario YAML under `tests/compliance`
- Ensure new guards have at least one negative test (rejection path)

## Diagrams
Update `README.md` and `docs/README-HQ.md` Mermaid diagrams if flows change (mint/burn, onboarding, CBDC gateway).

## Security
- Never commit .env or secrets
- Report vulnerabilities privately (see SECURITY.md if present or email security@futuretech.example)
- Use minimal privileges for service keys

## PR Checklist
- [ ] Code compiles (pnpm build / Hardhat compile)
- [ ] Tests added or updated
- [ ] All tests pass (pnpm test)
- [ ] Lint passes (if configured)
- [ ] Diagrams/docs updated
- [ ] No secrets/keys included

## Review Expectations
- Two reviewer approvals for contract changes
- One reviewer approval for docs-only changes
- Mandatory security review for new mint/burn logic paths

## Release / Deployment Notes
Tag releases with `vX.Y.Z`. Include changelog summary (features, fixes, risks). Keep contract deployment addresses documented separately (not in this public repo if sensitive).

## Getting Help
Open an issue with the appropriate template (Bug or Feature). For architectural discussions, start with a Discussion (if enabled) or a draft PR.

---
Thank you for contributing! 🚀
