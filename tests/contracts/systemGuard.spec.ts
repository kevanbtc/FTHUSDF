import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SystemGuard } from '../typechain-types';

/**
 * SystemGuard Smart Contract Tests
 * 
 * Tests emergency pause/unpause functionality, guardian controls
 */

describe('SystemGuard Contract', () => {
  let systemGuard: SystemGuard;
  let owner: ethers.SignerWithAddress;
  let guardian: ethers.SignerWithAddress;
  let user: ethers.SignerWithAddress;

  beforeEach(async () => {
    [owner, guardian, user] = await ethers.getSigners();

    const SystemGuardFactory = await ethers.getContractFactory('SystemGuard');
    systemGuard = await SystemGuardFactory.deploy();

    // Grant GUARDIAN_ROLE
    const GUARDIAN_ROLE = await systemGuard.GUARDIAN_ROLE();
    await systemGuard.grantRole(GUARDIAN_ROLE, guardian.address);
  });

  describe('Initialization', () => {
    it('should start unpaused', async () => {
      const paused = await systemGuard.isPaused();
      expect(paused).to.be.false;
    });

    it('should have empty pause reason', async () => {
      const reason = await systemGuard.pauseReason();
      expect(reason).to.equal('');
    });

    it('should grant DEFAULT_ADMIN_ROLE to deployer', async () => {
      const DEFAULT_ADMIN_ROLE = await systemGuard.DEFAULT_ADMIN_ROLE();
      const hasRole = await systemGuard.hasRole(DEFAULT_ADMIN_ROLE, owner.address);
      expect(hasRole).to.be.true;
    });
  });

  describe('Pause', () => {
    it('should allow guardian to pause', async () => {
      const reason = 'Security incident detected';

      await systemGuard.connect(guardian).pause(reason);

      const paused = await systemGuard.isPaused();
      expect(paused).to.be.true;
    });

    it('should store pause reason', async () => {
      const reason = 'Reserve shortfall';

      await systemGuard.connect(guardian).pause(reason);

      const storedReason = await systemGuard.pauseReason();
      expect(storedReason).to.equal(reason);
    });

    it('should emit Paused event', async () => {
      const reason = 'Emergency test';

      await expect(systemGuard.connect(guardian).pause(reason))
        .to.emit(systemGuard, 'Paused')
        .withArgs(guardian.address, reason);
    });

    it('should only allow GUARDIAN_ROLE', async () => {
      await expect(
        systemGuard.connect(user).pause('unauthorized pause')
      ).to.be.reverted;
    });

    it('should revert if already paused', async () => {
      await systemGuard.connect(guardian).pause('First pause');

      await expect(
        systemGuard.connect(guardian).pause('Second pause')
      ).to.be.reverted;
    });
  });

  describe('Unpause', () => {
    beforeEach(async () => {
      await systemGuard.connect(guardian).pause('Test pause');
    });

    it('should allow guardian to unpause', async () => {
      await systemGuard.connect(guardian).unpause();

      const paused = await systemGuard.isPaused();
      expect(paused).to.be.false;
    });

    it('should clear pause reason', async () => {
      await systemGuard.connect(guardian).unpause();

      const reason = await systemGuard.pauseReason();
      expect(reason).to.equal('');
    });

    it('should emit Unpaused event', async () => {
      await expect(systemGuard.connect(guardian).unpause())
        .to.emit(systemGuard, 'Unpaused')
        .withArgs(guardian.address);
    });

    it('should only allow GUARDIAN_ROLE', async () => {
      await expect(
        systemGuard.connect(user).unpause()
      ).to.be.reverted;
    });

    it('should revert if not paused', async () => {
      await systemGuard.connect(guardian).unpause();

      await expect(
        systemGuard.connect(guardian).unpause()
      ).to.be.reverted;
    });
  });

  describe('Pause Cycles', () => {
    it('should allow multiple pause/unpause cycles', async () => {
      // Cycle 1
      await systemGuard.connect(guardian).pause('Reason 1');
      expect(await systemGuard.isPaused()).to.be.true;
      await systemGuard.connect(guardian).unpause();
      expect(await systemGuard.isPaused()).to.be.false;

      // Cycle 2
      await systemGuard.connect(guardian).pause('Reason 2');
      expect(await systemGuard.isPaused()).to.be.true;
      await systemGuard.connect(guardian).unpause();
      expect(await systemGuard.isPaused()).to.be.false;
    });

    it('should update reason on each pause', async () => {
      await systemGuard.connect(guardian).pause('First reason');
      expect(await systemGuard.pauseReason()).to.equal('First reason');

      await systemGuard.connect(guardian).unpause();

      await systemGuard.connect(guardian).pause('Second reason');
      expect(await systemGuard.pauseReason()).to.equal('Second reason');
    });
  });

  describe('Access Control', () => {
    it('should allow owner to grant GUARDIAN_ROLE', async () => {
      const GUARDIAN_ROLE = await systemGuard.GUARDIAN_ROLE();

      await systemGuard.connect(owner).grantRole(GUARDIAN_ROLE, user.address);

      const hasRole = await systemGuard.hasRole(GUARDIAN_ROLE, user.address);
      expect(hasRole).to.be.true;
    });

    it('should allow owner to revoke GUARDIAN_ROLE', async () => {
      const GUARDIAN_ROLE = await systemGuard.GUARDIAN_ROLE();

      await systemGuard.connect(owner).revokeRole(GUARDIAN_ROLE, guardian.address);

      const hasRole = await systemGuard.hasRole(GUARDIAN_ROLE, guardian.address);
      expect(hasRole).to.be.false;

      // Guardian should no longer be able to pause
      await expect(
        systemGuard.connect(guardian).pause('test')
      ).to.be.reverted;
    });

    it('should not allow non-admin to grant roles', async () => {
      const GUARDIAN_ROLE = await systemGuard.GUARDIAN_ROLE();

      await expect(
        systemGuard.connect(user).grantRole(GUARDIAN_ROLE, user.address)
      ).to.be.reverted;
    });
  });

  describe('Multi-Guardian Scenario', () => {
    let guardian2: ethers.SignerWithAddress;

    beforeEach(async () => {
      [, , , guardian2] = await ethers.getSigners();

      const GUARDIAN_ROLE = await systemGuard.GUARDIAN_ROLE();
      await systemGuard.grantRole(GUARDIAN_ROLE, guardian2.address);
    });

    it('should allow any guardian to pause', async () => {
      await systemGuard.connect(guardian2).pause('Guardian 2 pause');

      expect(await systemGuard.isPaused()).to.be.true;
      expect(await systemGuard.pauseReason()).to.equal('Guardian 2 pause');
    });

    it('should allow any guardian to unpause', async () => {
      await systemGuard.connect(guardian).pause('Pause by guardian 1');

      // guardian2 can unpause
      await systemGuard.connect(guardian2).unpause();

      expect(await systemGuard.isPaused()).to.be.false;
    });
  });
});
