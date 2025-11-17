// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IMintGuard.sol";
import "./interfaces/IReserveRegistry.sol";
import "./interfaces/ISystemGuard.sol";

/// @title MintGuard – supply and mint control for FTHUSD / USDF
/// @notice Enforces supply caps, reserve backing, and pause controls for mint/burn operations
contract MintGuard is IMintGuard, AccessControl {
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    uint256 private _globalCap;
    uint256 private _totalNetMinted;

    IReserveRegistry public reserveRegistry;
    ISystemGuard public systemGuard;

    constructor(
        address _reserveRegistry,
        address _systemGuard,
        uint256 initialGlobalCap
    ) {
        require(_reserveRegistry != address(0), "MintGuard: invalid reserve registry");
        require(_systemGuard != address(0), "MintGuard: invalid system guard");

        reserveRegistry = IReserveRegistry(_reserveRegistry);
        systemGuard = ISystemGuard(_systemGuard);
        _globalCap = initialGlobalCap;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, msg.sender);
    }

    /// @inheritdoc IMintGuard
    function globalCap() external view override returns (uint256) {
        return _globalCap;
    }

    /// @inheritdoc IMintGuard
    function totalNetMinted() external view override returns (uint256) {
        return _totalNetMinted;
    }

    /// @inheritdoc IMintGuard
    function canMint(uint256 amount) public view override returns (bool ok, string memory reason) {
        if (systemGuard.isPaused()) {
            return (false, "System is paused");
        }

        uint256 newTotal = _totalNetMinted + amount;

        if (newTotal > _globalCap) {
            return (false, "Exceeds global cap");
        }

        uint256 totalReserves = reserveRegistry.totalReservesUsd();
        if (newTotal > totalReserves) {
            return (false, "Insufficient reserves");
        }

        return (true, "");
    }

    /// @inheritdoc IMintGuard
    function requestMint(uint256 amount, bytes32 reasonCode) external override onlyRole(TREASURY_ROLE) {
        (bool ok, string memory reason) = canMint(amount);
        require(ok, reason);

        emit MintApproved(msg.sender, amount, reasonCode);
    }

    /// @inheritdoc IMintGuard
    function confirmMint(uint256 amount, string calldata xrplTxHash) external override onlyRole(TREASURY_ROLE) {
        _totalNetMinted += amount;
        emit MintExecuted(amount, xrplTxHash);
    }

    /// @inheritdoc IMintGuard
    function recordBurn(uint256 amount, string calldata xrplTxHash) external override onlyRole(TREASURY_ROLE) {
        require(_totalNetMinted >= amount, "MintGuard: burn exceeds minted supply");
        _totalNetMinted -= amount;
        emit BurnRecorded(amount, xrplTxHash);
    }

    /// @notice Update the global cap (admin only)
    /// @param newCap The new global cap
    function setGlobalCap(uint256 newCap) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _globalCap = newCap;
    }
}
