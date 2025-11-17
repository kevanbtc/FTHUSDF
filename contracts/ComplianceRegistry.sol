// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IComplianceRegistry.sol";

/// @title ComplianceRegistry – KYC/AML whitelist and risk tier management
/// @notice Maintains a registry of approved entities and their risk tiers
contract ComplianceRegistry is IComplianceRegistry, AccessControl {
    bytes32 public constant COMPLIANCE_ADMIN_ROLE = keccak256("COMPLIANCE_ADMIN_ROLE");

    // Risk tiers
    uint8 public constant RISK_NONE = 0;
    uint8 public constant RISK_LOW = 1;
    uint8 public constant RISK_MEDIUM = 2;
    uint8 public constant RISK_HIGH = 3;
    uint8 public constant RISK_BLOCKED = 4;

    // Entity address => risk tier
    mapping(address => uint8) private _riskTiers;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ADMIN_ROLE, msg.sender);
    }

    /// @inheritdoc IComplianceRegistry
    function isWhitelisted(address entity) external view override returns (bool) {
        uint8 tier = _riskTiers[entity];
        return tier > RISK_NONE && tier < RISK_BLOCKED;
    }

    /// @inheritdoc IComplianceRegistry
    function riskTier(address entity) external view override returns (uint8) {
        return _riskTiers[entity];
    }

    /// @inheritdoc IComplianceRegistry
    function addEntity(address entity, uint8 tier) external override onlyRole(COMPLIANCE_ADMIN_ROLE) {
        require(entity != address(0), "ComplianceRegistry: zero address");
        require(tier <= RISK_BLOCKED, "ComplianceRegistry: invalid tier");
        require(_riskTiers[entity] == RISK_NONE, "ComplianceRegistry: entity already exists");

        _riskTiers[entity] = tier;
        emit EntityWhitelisted(entity, tier);
    }

    /// @inheritdoc IComplianceRegistry
    function removeEntity(address entity) external override onlyRole(COMPLIANCE_ADMIN_ROLE) {
        require(_riskTiers[entity] != RISK_NONE, "ComplianceRegistry: entity not found");

        _riskTiers[entity] = RISK_NONE;
        emit EntityRemoved(entity);
    }

    /// @inheritdoc IComplianceRegistry
    function updateRiskTier(address entity, uint8 newTier) external override onlyRole(COMPLIANCE_ADMIN_ROLE) {
        require(newTier <= RISK_BLOCKED, "ComplianceRegistry: invalid tier");
        uint8 oldTier = _riskTiers[entity];
        require(oldTier != RISK_NONE, "ComplianceRegistry: entity not found");

        _riskTiers[entity] = newTier;
        emit RiskTierUpdated(entity, oldTier, newTier);
    }
}
