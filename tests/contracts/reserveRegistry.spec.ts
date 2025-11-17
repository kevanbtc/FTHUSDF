// @ts-nocheck
import { expect } from 'chai';
import { ethers } from 'hardhat';

/**
 * ReserveRegistry Smart Contract Tests
 * 
 * Tests reserve management, USD totals, bank account tracking
 */

describe('ReserveRegistry Contract', () => {
  let reserveRegistry: any;
  let owner: ethers.SignerWithAddress;
  let admin: ethers.SignerWithAddress;
  let user: ethers.SignerWithAddress;

  beforeEach(async () => {
    [owner, admin, user] = await ethers.getSigners();

    const ReserveRegistryFactory = await ethers.getContractFactory('ReserveRegistry');
    reserveRegistry = await ReserveRegistryFactory.deploy();

    // Grant RESERVE_ADMIN_ROLE to admin
    const RESERVE_ADMIN_ROLE = await reserveRegistry.RESERVE_ADMIN_ROLE();
    await reserveRegistry.grantRole(RESERVE_ADMIN_ROLE, admin.address);
  });

  describe('Initialization', () => {
    it('should start with zero reserves', async () => {
      const total = await reserveRegistry.totalReservesUsd();
      expect(total).to.equal(0);
    });

    it('should grant DEFAULT_ADMIN_ROLE to deployer', async () => {
      const DEFAULT_ADMIN_ROLE = await reserveRegistry.DEFAULT_ADMIN_ROLE();
      const hasRole = await reserveRegistry.hasRole(DEFAULT_ADMIN_ROLE, owner.address);
      expect(hasRole).to.be.true;
    });
  });

  describe('Add Reserve', () => {
    it('should add new bank account reserve', async () => {
      const bankId = 'bank_001';
      const amount = ethers.parseUnits('1000000', 6); // 1M USD

      await reserveRegistry.connect(admin).addReserve(bankId, amount);

  const bankReserve = await reserveRegistry.getReserveBalance(bankId);
      expect(bankReserve).to.equal(amount);
    });

    it('should emit ReserveAdded event', async () => {
      const bankId = 'bank_002';
      const amount = ethers.parseUnits('500000', 6);

      await expect(reserveRegistry.connect(admin).addReserve(bankId, amount))
        .to.emit(reserveRegistry, 'ReserveAdded')
        .withArgs(bankId, amount);
    });

    it('should update totalReservesUsd', async () => {
      await reserveRegistry.connect(admin).addReserve('bank_001', ethers.parseUnits('1000000', 6));
      await reserveRegistry.connect(admin).addReserve('bank_002', ethers.parseUnits('500000', 6));

      const total = await reserveRegistry.totalReservesUsd();
      expect(total).to.equal(ethers.parseUnits('1500000', 6));
    });

    it('should revert if adding duplicate bank ID', async () => {
      const bankId = 'bank_003';
      await reserveRegistry.connect(admin).addReserve(bankId, ethers.parseUnits('100000', 6));

      await expect(
        reserveRegistry.connect(admin).addReserve(bankId, ethers.parseUnits('200000', 6))
      ).to.be.reverted;
    });

    it('should only allow RESERVE_ADMIN_ROLE', async () => {
      await expect(
        reserveRegistry.connect(user).addReserve('bank_004', ethers.parseUnits('100000', 6))
      ).to.be.reverted;
    });
  });

  describe('Update Reserve', () => {
    beforeEach(async () => {
      await reserveRegistry.connect(admin).addReserve('bank_001', ethers.parseUnits('1000000', 6));
    });

    it('should update existing reserve balance', async () => {
      const newAmount = ethers.parseUnits('1500000', 6);

      await reserveRegistry.connect(admin).updateReserve('bank_001', newAmount);

  const balance = await reserveRegistry.getReserveBalance('bank_001');
      expect(balance).to.equal(newAmount);
    });

    it('should emit ReserveUpdated event', async () => {
      const newAmount = ethers.parseUnits('1500000', 6);
      await expect(reserveRegistry.connect(admin).updateReserve('bank_001', newAmount))
        .to.emit(reserveRegistry, 'ReserveUpdated')
        .withArgs('bank_001', newAmount);
    });

    it('should correctly update totalReservesUsd', async () => {
      await reserveRegistry.connect(admin).addReserve('bank_002', ethers.parseUnits('500000', 6));

      // Update bank_001 from 1M to 2M
      await reserveRegistry.connect(admin).updateReserve('bank_001', ethers.parseUnits('2000000', 6));

      const total = await reserveRegistry.totalReservesUsd();
      expect(total).to.equal(ethers.parseUnits('2500000', 6)); // 2M + 500k
    });

    it('should revert if bank not found', async () => {
      await expect(
        reserveRegistry.connect(admin).updateReserve('nonexistent_bank', ethers.parseUnits('100000', 6))
      ).to.be.reverted;
    });
  });

  describe('Remove Reserve', () => {
    beforeEach(async () => {
      await reserveRegistry.connect(admin).addReserve('bank_001', ethers.parseUnits('1000000', 6));
      await reserveRegistry.connect(admin).addReserve('bank_002', ethers.parseUnits('500000', 6));
    });

    it('should remove bank account', async () => {
      await reserveRegistry.connect(admin).removeReserve('bank_001');

  const balance = await reserveRegistry.getReserveBalance('bank_001');
      expect(balance).to.equal(0);
    });

    it('should emit ReserveRemoved event', async () => {
      await expect(reserveRegistry.connect(admin).removeReserve('bank_001'))
        .to.emit(reserveRegistry, 'ReserveRemoved')
        .withArgs('bank_001');
    });

    it('should update totalReservesUsd', async () => {
      await reserveRegistry.connect(admin).removeReserve('bank_001');

      const total = await reserveRegistry.totalReservesUsd();
      expect(total).to.equal(ethers.parseUnits('500000', 6)); // Only bank_002 remains
    });
  });

  describe('Get Reserve', () => {
    it('should return correct balance for existing bank', async () => {
      const amount = ethers.parseUnits('750000', 6);
      await reserveRegistry.connect(admin).addReserve('bank_005', amount);

  const balance = await reserveRegistry.getReserveBalance('bank_005');
      expect(balance).to.equal(amount);
    });

    it('should return 0 for non-existent bank', async () => {
  const balance = await reserveRegistry.getReserveBalance('nonexistent');
      expect(balance).to.equal(0);
    });
  });

  describe('Total Reserves', () => {
    it('should correctly sum multiple banks', async () => {
      await reserveRegistry.connect(admin).addReserve('bank_001', ethers.parseUnits('1000000', 6));
      await reserveRegistry.connect(admin).addReserve('bank_002', ethers.parseUnits('2000000', 6));
      await reserveRegistry.connect(admin).addReserve('bank_003', ethers.parseUnits('500000', 6));

      const total = await reserveRegistry.totalReservesUsd();
      expect(total).to.equal(ethers.parseUnits('3500000', 6));
    });

    it('should handle updates correctly', async () => {
      await reserveRegistry.connect(admin).addReserve('bank_001', ethers.parseUnits('1000000', 6));
      
      // Update to higher
      await reserveRegistry.connect(admin).updateReserve('bank_001', ethers.parseUnits('1500000', 6));
      expect(await reserveRegistry.totalReservesUsd()).to.equal(ethers.parseUnits('1500000', 6));

      // Update to lower
      await reserveRegistry.connect(admin).updateReserve('bank_001', ethers.parseUnits('800000', 6));
      expect(await reserveRegistry.totalReservesUsd()).to.equal(ethers.parseUnits('800000', 6));
    });
  });
});
