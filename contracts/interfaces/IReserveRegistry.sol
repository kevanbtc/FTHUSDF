// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IReserveRegistry – tracks USD reserves backing FTHUSD/USDF
interface IReserveRegistry {
    event ReserveUpdated(string indexed assetId, uint256 newBalance);
    event ReserveAdded(string indexed assetId, uint256 initialBalance);
    event ReserveRemoved(string indexed assetId);

    /// @notice Get the USD-equivalent balance for a specific reserve asset
    /// @param assetId The identifier for the reserve (e.g., "bank_account_1")
    /// @return balance The USD balance
    function getReserveBalance(string calldata assetId) external view returns (uint256 balance);

    /// @notice Get the total USD reserves across all assets
    /// @return total The total USD reserves
    function totalReservesUsd() external view returns (uint256 total);

    /// @notice Update the balance for a specific reserve asset
    /// @param assetId The identifier for the reserve
    /// @param newBalance The new USD balance
    function updateReserve(string calldata assetId, uint256 newBalance) external;

    /// @notice Add a new reserve asset
    /// @param assetId The identifier for the reserve
    /// @param initialBalance The initial USD balance
    function addReserve(string calldata assetId, uint256 initialBalance) external;

    /// @notice Remove a reserve asset
    /// @param assetId The identifier for the reserve
    function removeReserve(string calldata assetId) external;
}
