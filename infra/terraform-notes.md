# Terraform Infrastructure Notes

## Overview

This document links to existing Terraform configurations for XRPL nodes and related infrastructure.

## Repository

**Location**: [Internal GitLab/GitHub repo URL]

**Structure**:
```
terraform-xrpl-infra/
├─ modules/
│  ├─ xrpl-node/
│  ├─ monitoring/
│  └─ networking/
├─ environments/
│  ├─ production/
│  └─ staging/
└─ README.md
```

## Deployment

### Prerequisites

1. Terraform >= 1.5
2. AWS/Azure/GCP credentials configured
3. VPN access to internal network

### Apply Changes

```bash
cd terraform-xrpl-infra/environments/production
terraform init
terraform plan
terraform apply
```

### State Management

- State stored in: [S3 bucket / Azure Storage / Terraform Cloud]
- State locking enabled: Yes
- Backup frequency: Daily

## Modules

### xrpl-node

Provisions an XRPL `rippled` node with:
- Compute instance (c5.2xlarge or equivalent)
- SSD storage (1TB+)
- Networking (VPC, security groups)
- Monitoring (CloudWatch/Prometheus)

### monitoring

Sets up:
- Prometheus server
- Grafana dashboards
- PagerDuty integration
- Alert rules for node health

### networking

Configures:
- VPC and subnets
- Security groups
- Load balancers
- VPN gateway

## Node-Specific Configs

- **Core Node**: `environments/production/core-node.tf`
- **Treasury Node**: `environments/production/treasury-node.tf`
- **Member API Node**: `environments/production/member-api-node.tf`

## Secrets Management

Secrets (SSH keys, API tokens, etc.) stored in:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault

Never commit secrets to Git.

## Runbooks

See `docs/MINT-BURN-RUNBOOK.md` for operational procedures.

## Contacts

- Infrastructure Lead: devops@futuretech.holdings
- On-Call: PagerDuty rotation
