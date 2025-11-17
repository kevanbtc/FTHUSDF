import { expect } from 'chai';
import { ethers } from 'hardhat';
import { MintGuard, ReserveRegistry, SystemGuard } from '../typechain-types';

/**
 * MintGuard Smart Contract Tests
 * 
 * Tests canMint logic, supply caps, reserve checks, pause functionality
 */

describe('MintGuard Contract', () => {
  let mintGuard: MintGuard;
  let reserveRegistry: ReserveRegistry;
  let systemGuard: SystemGuard;
  let owner: ethers.SignerWithAddress;
  let treasury: ethers.SignerWithAddress;
  let admin: ethers.SignerWithAddress;

  const INITIAL_CAP = ethers.parseUnits('100000000', 6); // 100M FTHUSD cap

  beforeEach(async () => {
    [owner, treasury, admin] = await ethers.getSigners();

    // Deploy contracts
    const ReserveRegistryFactory = await ethers.getContractFactory('ReserveRegistry');
    reserveRegistry = await ReserveRegistryFactory.deploy();

    const SystemGuardFactory = await ethers.getContractFactory('SystemGuard');
    systemGuard = await SystemGuardFactory.deploy();

    const MintGuardFactory = await ethers.getContractFactory('MintGuard');
    mintGuard = await MintGuardFactory.deploy(
      await reserveRegistry.getAddress(),
      await systemGuard.getAddress(),
      INITIAL_CAP
    );

    // Grant roles
    const TREASURY_ROLE = await mintGuard.TREASURY_ROLE();
    await mintGuard.grantRole(TREASURY_ROLE, treasury.address);

    const RESERVE_ADMIN_ROLE = await reserveRegistry.RESERVE_ADMIN_ROLE();
    await reserveRegistry.grantRole(RESERVE_ADMIN_ROLE, admin.address);
  });

  describe('Initialization', () => {
    it('should set correct initial cap', async () => {
      const cap = await mintGuard.supplyCap();
      expect(cap).to.equal(INITIAL_CAP);
    });

    it('should start with zero minted', async () => {
      const minted = await mintGuard.totalNetMinted();
      expect(minted).to.equal(0);
    });

    it('should reference correct ReserveRegistry', async () => {
      const registryAddr = await mintGuard.reserveRegistry();
      expect(registryAddr).to.equal(await reserveRegistry.getAddress());
    });

    it('should reference correct SystemGuard', async () => {
      const guardAddr = await mintGuard.systemGuard();
      expect(guardAddr).to.equal(await systemGuard.getAddress());
    });
  });

  describe('canMint', () => {
    it('should allow mint when reserves >= amount and cap not exceeded', async () => {
      // Add reserves
      await reserveRegistry.connect(admin).addReserve(
        'bank_001',
        ethers.parseUnits('1000000', 6) // 1M USD
      );

      // Try to mint 100k
      const amount = ethers.parseUnits('100000', 6);
      const canMint = await mintGuard.canMint(amount);

      expect(canMint).to.be.true;
    });

    it('should reject mint if reserves insufficient', async () => {
      // Add only 50k reserves
      await reserveRegistry.connect(admin).addReserve(
        'bank_001',
        ethers.parseUnits('50000', 6)
      );

      // Try to mint 100k (exceeds reserves)
      const amount = ethers.parseUnits('100000', 6);
      const canMint = await mintGuard.canMint(amount);

      expect(canMint).to.be.false;
    });

    it('should reject mint if cap exceeded', async () => {
      // Add large reserves (200M)
      await reserveRegistry.connect(admin).addReserve(
        'bank_001',
        ethers.parseUnits('200000000', 6)
      );

      // Mint up to just below cap
      const firstMint = ethers.parseUnits('99000000', 6);
      await mintGuard.connect(treasury).confirmMint(firstMint);

      // Try to mint another 2M (would exceed 100M cap)
      const secondMint = ethers.parseUnits('2000000', 6);
      const canMint = await mintGuard.canMint(secondMint);

      expect(canMint).to.be.false;
    });

    it('should reject mint if system paused', async () => {
      // Add reserves
      await reserveRegistry.connect(admin).addReserve(
        'bank_001',
        ethers.parseUnits('1000000', 6)
      );

      // Pause system
      const GUARDIAN_ROLE = await systemGuard.GUARDIAN_ROLE();
      await systemGuard.grantRole(GUARDIAN_ROLE, owner.address);
      await systemGuard.pause('test pause');

      // Try to mint
      const amount = ethers.parseUnits('100000', 6);
      const canMint = await mintGuard.canMint(amount);

      expect(canMint).to.be.false;
    });
  });

  describe('confirmMint', () => {
    beforeEach(async () => {
      // Add sufficient reserves
      await reserveRegistry.connect(admin).addReserve(
        'bank_001',
        ethers.parseUnits('10000000', 6) // 10M USD
      );
    });

    it('should increase totalNetMinted', async () => {
      const amount = ethers.parseUnits('100000', 6);
      
      await mintGuard.connect(treasury).confirmMint(amount);

      const minted = await mintGuard.totalNetMinted();
      expect(minted).to.equal(amount);
    });

    it('should emit MintConfirmed event', async () => {
      const amount = ethers.parseUnits('100000', 6);

      await expect(mintGuard.connect(treasury).confirmMint(amount))
        .to.emit(mintGuard, 'MintConfirmed')
        .withArgs(treasury.address, amount);
    });

    it('should only allow TREASURY_ROLE', async () => {
      const amount = ethers.parseUnits('100000', 6);

      await expect(
        mintGuard.connect(admin).confirmMint(amount)
      ).to.be.reverted;
    });
  });

  describe('confirmBurn', () => {
    beforeEach(async () => {
      // Add reserves and mint first
      await reserveRegistry.connect(admin).addReserve(
        'bank_001',
        ethers.parseUnits('10000000', 6)
      );

      await mintGuard.connect(treasury).confirmMint(
        ethers.parseUnits('1000000', 6) // Mint 1M
      );
    });

    it('should decrease totalNetMinted', async () => {
      const burnAmount = ethers.parseUnits('500000', 6);

      await mintGuard.connect(treasury).confirmBurn(burnAmount);

      const minted = await mintGuard.totalNetMinted();
      expect(minted).to.equal(ethers.parseUnits('500000', 6));
    });

    it('should emit BurnConfirmed event', async () => {
      const burnAmount = ethers.parseUnits('500000', 6);

      await expect(mintGuard.connect(treasury).confirmBurn(burnAmount))
        .to.emit(mintGuard, 'BurnConfirmed')
        .withArgs(treasury.address, burnAmount);
    });

    it('should not underflow below zero', async () => {
      const overBurn = ethers.parseUnits('2000000', 6); // More than minted

      await expect(
        mintGuard.connect(treasury).confirmBurn(overBurn)
      ).to.be.reverted;
    });
  });

  describe('Supply Cap Management', () => {
    it('should allow admin to update cap', async () => {
      const newCap = ethers.parseUnits('200000000', 6); // 200M

      await mintGuard.updateSupplyCap(newCap);

      const cap = await mintGuard.supplyCap();
      expect(cap).to.equal(newCap);
    });

    it('should emit SupplyCapUpdated event', async () => {
      const newCap = ethers.parseUnits('200000000', 6);

      await expect(mintGuard.updateSupplyCap(newCap))
        .to.emit(mintGuard, 'SupplyCapUpdated')
        .withArgs(INITIAL_CAP, newCap);
    });

    it('should not allow cap below current minted amount', async () => {
      // Add reserves and mint 5M
      await reserveRegistry.connect(admin).addReserve(
        'bank_001',
        ethers.parseUnits('10000000', 6)
      );
      await mintGuard.connect(treasury).confirmMint(
        ethers.parseUnits('5000000', 6)
      );

      // Try to set cap to 1M (below minted amount)
      const lowCap = ethers.parseUnits('1000000', 6);

      await expect(mintGuard.updateSupplyCap(lowCap)).to.be.reverted;
    });
  });
});
