// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/ISystemGuard.sol";

/// @title SystemGuard – global pause and emergency controls
/// @notice Provides system-wide pause and emergency mode functionality
contract SystemGuard is ISystemGuard, AccessControl {
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    bool private _paused;
    bool private _emergencyMode;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
    }

    /// @inheritdoc ISystemGuard
    function isPaused() external view override returns (bool) {
        return _paused;
    }

    /// @inheritdoc ISystemGuard
    function isEmergencyMode() external view override returns (bool) {
        return _emergencyMode;
    }

    /// @inheritdoc ISystemGuard
    function pause(string calldata reason) external override onlyRole(GUARDIAN_ROLE) {
        require(!_paused, "SystemGuard: already paused");
        _paused = true;
        emit SystemPaused(msg.sender, reason);
    }

    /// @inheritdoc ISystemGuard
    function unpause() external override onlyRole(GUARDIAN_ROLE) {
        require(_paused, "SystemGuard: not paused");
        _paused = false;
        emit SystemUnpaused(msg.sender);
    }

    /// @inheritdoc ISystemGuard
    function activateEmergencyMode(string calldata reason) external override onlyRole(GUARDIAN_ROLE) {
        require(!_emergencyMode, "SystemGuard: emergency mode already active");
        _emergencyMode = true;
        emit EmergencyModeActivated(msg.sender, reason);
    }

    /// @inheritdoc ISystemGuard
    function deactivateEmergencyMode() external override onlyRole(GUARDIAN_ROLE) {
        require(_emergencyMode, "SystemGuard: emergency mode not active");
        _emergencyMode = false;
        emit EmergencyModeDeactivated(msg.sender);
    }
}
