import { expect } from 'chai';
import { ethers } from 'hardhat';
// @ts-ignore

describe('ReserveRegistry', () => {
  it('adds and updates reserves correctly', async () => {
  // @ts-ignore
  const ReserveRegistry = await ethers.getContractFactory('ReserveRegistry');
    const registry = await ReserveRegistry.deploy();
    await registry.waitForDeployment();

    await registry.addReserve('USD_BANK_1', 500_000n);
    let total = await registry.totalReservesUsd();
    expect(total).to.equal(500_000n);

    await registry.updateReserve('USD_BANK_1', 750_000n);
    total = await registry.totalReservesUsd();
    expect(total).to.equal(750_000n);
  });
});
