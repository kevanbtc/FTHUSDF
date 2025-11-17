// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IMintGuard – supply and mint control for FTHUSD / USDF
interface IMintGuard {
    event MintApproved(address indexed operator, uint256 amount, bytes32 reason);
    event MintExecuted(uint256 amount, string xrplTxHash);
    event BurnRecorded(uint256 amount, string xrplTxHash);

    /// @notice Global supply cap
    function globalCap() external view returns (uint256);

    /// @notice Total net minted (minted - burned)
    function totalNetMinted() external view returns (uint256);

    /// @notice Check if a mint operation is allowed
    /// @param amount The amount to mint
    /// @return ok True if the mint is allowed
    /// @return reason Human-readable reason if not allowed
    function canMint(uint256 amount) external view returns (bool ok, string memory reason);

    /// @notice Request a mint operation (pre-check and approve)
    /// @param amount The amount to mint
    /// @param reasonCode A code explaining the mint reason
    function requestMint(uint256 amount, bytes32 reasonCode) external;

    /// @notice Confirm a mint operation with XRPL transaction hash
    /// @param amount The amount minted
    /// @param xrplTxHash The XRPL transaction hash
    function confirmMint(uint256 amount, string calldata xrplTxHash) external;

    /// @notice Record a burn operation with XRPL transaction hash
    /// @param amount The amount burned
    /// @param xrplTxHash The XRPL transaction hash
    function recordBurn(uint256 amount, string calldata xrplTxHash) external;
}
