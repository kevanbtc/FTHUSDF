# XRPL Node Role Mapping

## Overview

This document maps XRPL node roles to their specific responsibilities and access patterns.

---

## Node Roles

### Core Node

**Endpoint**: `wss://core.xrpl.futuretech.internal`

**Services Using**:
- Analytics bots
- Trading bots
- Internal dashboards
- Indexers

**Operations**:
- Account queries
- Orderbook reads
- Ledger history
- Non-issuer transactions

**Access Level**: Internal network only

---

### Treasury Node

**Endpoint**: `wss://treasury.xrpl.futuretech.internal`

**Services Using**:
- `treasury-service`
- `compliance-service` (for issuer checks)

**Operations**:
- FTHUSD mint (issuer → customer)
- FTHUSD burn (customer → issuer)
- USDF mint/burn
- Treasury wallet management

**Access Level**: Restricted IP whitelist, admin VPN only

**Critical**: Issuer keys accessed via this node

---

### Member API Node

**Endpoint**: `wss://api.xrpl.futuretech.com`

**Services Using**:
- Member portal
- Mobile apps
- External dashboards
- `membership-service` (read-only)

**Operations**:
- Account balance queries
- Transaction history reads
- NFT queries
- Public blockchain data

**Access Level**: Public internet (rate-limited, API keys for high volume)

---

## Routing Logic

**Rule**: Services select node based on operation type

```
if (operation === 'mint' || operation === 'burn') {
  node = 'treasury'
} else if (operation === 'public_query') {
  node = 'member_api'
} else {
  node = 'core'
}
```

---

## Security Boundaries

| Node | Issuer Keys | Public Access | Critical Path |
|------|-------------|---------------|---------------|
| Core | No | No | No |
| Treasury | **Yes** | No | **Yes** |
| Member API | No | Yes | No |

---

## Failover Strategy

- **Core Node Down**: Fallback to member API node (with rate limits)
- **Treasury Node Down**: **No failover** – operations halt until restored
- **Member API Node Down**: Fallback to core node (restricted rate)

---

## Monitoring

All nodes monitored for:
- Sync status
- Peer count
- API latency
- Error rates
- Disk/memory usage

Alerts sent to: `ops@futuretech.holdings`
