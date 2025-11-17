// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IMembershipNFTRegistry – optional on-chain view of membership entitlements
interface IMembershipNFTRegistry {
    event MembershipRegistered(address indexed wallet, string indexed xrplNftId, string tier);
    event MembershipRevoked(address indexed wallet, string indexed xrplNftId);
    event MembershipTierUpdated(address indexed wallet, string oldTier, string newTier);

    struct Membership {
        string xrplNftId;     // XRPL NFT ID
        string tier;          // e.g., "basic", "pro", "otc", "internal"
        uint256 issuedAt;     // Timestamp when issued
        uint256 expiresAt;    // Expiry timestamp (0 = no expiry)
        bool active;          // True if membership is active
    }

    /// @notice Get membership details for a wallet
    /// @param wallet The wallet address
    /// @return membership The membership details
    function getMembership(address wallet) external view returns (Membership memory membership);

    /// @notice Check if a wallet has an active membership
    /// @param wallet The wallet address
    /// @return active True if the wallet has an active membership
    function isActiveMember(address wallet) external view returns (bool active);

    /// @notice Register a new membership
    /// @param wallet The wallet address
    /// @param xrplNftId The XRPL NFT ID
    /// @param tier The membership tier
    /// @param expiresAt The expiry timestamp
    function registerMembership(
        address wallet,
        string calldata xrplNftId,
        string calldata tier,
        uint256 expiresAt
    ) external;

    /// @notice Revoke a membership
    /// @param wallet The wallet address
    function revokeMembership(address wallet) external;

    /// @notice Update membership tier
    /// @param wallet The wallet address
    /// @param newTier The new tier
    function updateMembershipTier(address wallet, string calldata newTier) external;
}
