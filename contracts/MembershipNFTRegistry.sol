// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IMembershipNFTRegistry.sol";

/// @title MembershipNFTRegistry – optional on-chain view of membership entitlements
/// @notice Tracks XRPL membership NFTs and their associated metadata
contract MembershipNFTRegistry is IMembershipNFTRegistry, AccessControl {
    bytes32 public constant MEMBERSHIP_ADMIN_ROLE = keccak256("MEMBERSHIP_ADMIN_ROLE");

    // Wallet address => Membership data
    mapping(address => Membership) private _memberships;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MEMBERSHIP_ADMIN_ROLE, msg.sender);
    }

    /// @inheritdoc IMembershipNFTRegistry
    function getMembership(address wallet) external view override returns (Membership memory) {
        return _memberships[wallet];
    }

    /// @inheritdoc IMembershipNFTRegistry
    function isActiveMember(address wallet) public view override returns (bool) {
        Membership memory membership = _memberships[wallet];
        
        if (!membership.active) {
            return false;
        }

        // Check expiry if set
        if (membership.expiresAt > 0 && block.timestamp >= membership.expiresAt) {
            return false;
        }

        return true;
    }

    /// @inheritdoc IMembershipNFTRegistry
    function registerMembership(
        address wallet,
        string calldata xrplNftId,
        string calldata tier,
        uint256 expiresAt
    ) external override onlyRole(MEMBERSHIP_ADMIN_ROLE) {
        require(wallet != address(0), "MembershipNFTRegistry: zero address");
        require(bytes(xrplNftId).length > 0, "MembershipNFTRegistry: empty NFT ID");
        require(!_memberships[wallet].active, "MembershipNFTRegistry: membership already exists");

        _memberships[wallet] = Membership({
            xrplNftId: xrplNftId,
            tier: tier,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            active: true
        });

        emit MembershipRegistered(wallet, xrplNftId, tier);
    }

    /// @inheritdoc IMembershipNFTRegistry
    function revokeMembership(address wallet) external override onlyRole(MEMBERSHIP_ADMIN_ROLE) {
        require(_memberships[wallet].active, "MembershipNFTRegistry: membership not active");

        string memory xrplNftId = _memberships[wallet].xrplNftId;
        _memberships[wallet].active = false;

        emit MembershipRevoked(wallet, xrplNftId);
    }

    /// @inheritdoc IMembershipNFTRegistry
    function updateMembershipTier(address wallet, string calldata newTier) external override onlyRole(MEMBERSHIP_ADMIN_ROLE) {
        require(_memberships[wallet].active, "MembershipNFTRegistry: membership not active");

        string memory oldTier = _memberships[wallet].tier;
        _memberships[wallet].tier = newTier;

        emit MembershipTierUpdated(wallet, oldTier, newTier);
    }
}
