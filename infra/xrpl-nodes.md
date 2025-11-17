# XRPL Node Infrastructure

## Overview

The FTH XRPL backbone relies on a 3-node XRPL fleet with distinct roles and security profiles.

## Node Roles

### 1. Core Node

**Purpose**: Primary RPC/WS endpoint for internal operations

**Use Cases**:
- Trading bots
- Analytics and indexing
- Internal dashboards
- Non-issuer operations

**Access**:
- Internal network only
- No public internet exposure
- Rate limiting: generous for internal services

**Security**:
- No issuer keys
- Can be rotated without impacting mint/burn authority
- Standard node security hardening

---

### 2. Treasury Node

**Purpose**: Canonical node for issuer and treasury operations

**Use Cases**:
- FTHUSD/USDF mint and burn transactions
- Treasury wallet operations
- Issuer account management

**Access**:
- Restricted to treasury-service and compliance-service only
- IP whitelist enforced
- Admin VPN network only

**Security**:
- **Critical**: Issuer keys accessed via this node
- Multi-signature controls for sensitive operations
- HSM or secure vault for key storage
- Comprehensive audit logging
- No external API exposure

---

### 3. Member API Node

**Purpose**: External-facing read endpoint for members and partners

**Use Cases**:
- Member portal
- Mobile apps
- External dashboards
- Public blockchain queries

**Access**:
- Public internet (rate-limited)
- API key authentication for high-volume clients
- Geographic restrictions (US-only if required)

**Security**:
- Read-only operations
- No issuer keys ever used via this node
- DDoS protection
- Rate limiting per IP/API key

---

## Node Configuration

All nodes run:
- **XRPL Version**: Latest stable `rippled`
- **Network**: XRPL Mainnet
- **Sync Mode**: Full ledger history
- **Monitoring**: Prometheus + Grafana
- **Alerting**: PagerDuty for critical issues

### Connection Endpoints

See `xrpl.nodes.example.json` for routing configuration.

Services must use the routing layer to select the appropriate node based on operation type.

---

## Health Checks

Health checks run every 60 seconds:

- **Ledger sync status**: Ensure node is synced (lag < 5 seconds)
- **Peer count**: Minimum 7 peers
- **Memory usage**: < 80%
- **Disk I/O**: Monitor for bottlenecks
- **API responsiveness**: < 500ms for account_info

Scripts:
- `scripts/check-node-health.sh`
- `scripts/check-ledger-lag.sh`

---

## Failover Strategy

- **Core Node**: Can failover to member API node for read operations
- **Treasury Node**: No failover (critical path, must be restored)
- **Member API Node**: Can failover to secondary public node or core node (restricted rate)

---

## Maintenance Windows

- **Core Node**: Any time (non-critical)
- **Treasury Node**: Off-hours only, requires coordination with treasury ops
- **Member API Node**: Any time (brief downtime acceptable with failover)

---

## Terraform / IaC

See existing infrastructure repo for Terraform configs:

- `terraform-xrpl-nodes/`

Link: [Internal GitLab repo or path]

---

## Questions / Issues

Contact: devops@futuretech.holdings
