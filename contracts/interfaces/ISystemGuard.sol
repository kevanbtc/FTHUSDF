// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ISystemGuard – global pause and emergency controls
interface ISystemGuard {
    event SystemPaused(address indexed by, string reason);
    event SystemUnpaused(address indexed by);
    event EmergencyModeActivated(address indexed by, string reason);
    event EmergencyModeDeactivated(address indexed by);

    /// @notice Check if the system is paused
    /// @return paused True if the system is paused
    function isPaused() external view returns (bool paused);

    /// @notice Check if emergency mode is active
    /// @return active True if emergency mode is active
    function isEmergencyMode() external view returns (bool active);

    /// @notice Pause the system (stops mint/burn operations)
    /// @param reason Human-readable reason for the pause
    function pause(string calldata reason) external;

    /// @notice Unpause the system
    function unpause() external;

    /// @notice Activate emergency mode (additional restrictions)
    /// @param reason Human-readable reason for emergency mode
    function activateEmergencyMode(string calldata reason) external;

    /// @notice Deactivate emergency mode
    function deactivateEmergencyMode() external;
}
