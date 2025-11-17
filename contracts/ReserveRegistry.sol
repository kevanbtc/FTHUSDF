// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IReserveRegistry.sol";

/// @title ReserveRegistry – tracks USD reserves backing FTHUSD/USDF
/// @notice Maintains a registry of reserve assets and their USD-equivalent balances
contract ReserveRegistry is IReserveRegistry, AccessControl {
    bytes32 public constant RESERVE_ADMIN_ROLE = keccak256("RESERVE_ADMIN_ROLE");

    // Asset ID => USD balance
    mapping(string => uint256) private _reserves;
    string[] private _assetIds;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RESERVE_ADMIN_ROLE, msg.sender);
    }

    /// @inheritdoc IReserveRegistry
    function getReserveBalance(string calldata assetId) external view override returns (uint256) {
        return _reserves[assetId];
    }

    /// @inheritdoc IReserveRegistry
    function totalReservesUsd() public view override returns (uint256 total) {
        for (uint256 i = 0; i < _assetIds.length; i++) {
            total += _reserves[_assetIds[i]];
        }
    }

    /// @inheritdoc IReserveRegistry
    function updateReserve(string calldata assetId, uint256 newBalance) external override onlyRole(RESERVE_ADMIN_ROLE) {
        require(_reserves[assetId] > 0 || bytes(assetId).length > 0, "ReserveRegistry: asset not found");
        
        _reserves[assetId] = newBalance;
        emit ReserveUpdated(assetId, newBalance);
    }

    /// @inheritdoc IReserveRegistry
    function addReserve(string calldata assetId, uint256 initialBalance) external override onlyRole(RESERVE_ADMIN_ROLE) {
        require(bytes(assetId).length > 0, "ReserveRegistry: empty asset ID");
        require(_reserves[assetId] == 0, "ReserveRegistry: asset already exists");

        _reserves[assetId] = initialBalance;
        _assetIds.push(assetId);
        emit ReserveAdded(assetId, initialBalance);
    }

    /// @inheritdoc IReserveRegistry
    function removeReserve(string calldata assetId) external override onlyRole(RESERVE_ADMIN_ROLE) {
        require(_reserves[assetId] > 0, "ReserveRegistry: asset not found");

        delete _reserves[assetId];

        // Remove from array
        for (uint256 i = 0; i < _assetIds.length; i++) {
            if (keccak256(bytes(_assetIds[i])) == keccak256(bytes(assetId))) {
                _assetIds[i] = _assetIds[_assetIds.length - 1];
                _assetIds.pop();
                break;
            }
        }

        emit ReserveRemoved(assetId);
    }

    /// @notice Get all asset IDs
    /// @return List of asset IDs
    function getAllAssetIds() external view returns (string[] memory) {
        return _assetIds;
    }
}
