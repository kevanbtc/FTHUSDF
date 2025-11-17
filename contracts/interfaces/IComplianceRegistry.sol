// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IComplianceRegistry – KYC/AML whitelist and risk tier management
interface IComplianceRegistry {
    event EntityWhitelisted(address indexed entity, uint8 riskTier);
    event EntityRemoved(address indexed entity);
    event RiskTierUpdated(address indexed entity, uint8 oldTier, uint8 newTier);

    /// @notice Check if an entity is whitelisted and approved for operations
    /// @param entity The address to check
    /// @return approved True if the entity is whitelisted
    function isWhitelisted(address entity) external view returns (bool approved);

    /// @notice Get the risk tier for an entity
    /// @param entity The address to query
    /// @return tier Risk tier (0=NONE, 1=LOW, 2=MEDIUM, 3=HIGH, 4=BLOCKED)
    function riskTier(address entity) external view returns (uint8 tier);

    /// @notice Add an entity to the whitelist
    /// @param entity The address to whitelist
    /// @param tier The risk tier to assign
    function addEntity(address entity, uint8 tier) external;

    /// @notice Remove an entity from the whitelist
    /// @param entity The address to remove
    function removeEntity(address entity) external;

    /// @notice Update the risk tier for an existing entity
    /// @param entity The address to update
    /// @param newTier The new risk tier
    function updateRiskTier(address entity, uint8 newTier) external;
}
