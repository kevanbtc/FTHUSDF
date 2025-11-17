import { expect } from 'chai';
import { ethers } from 'hardhat';
// Hardhat v2.19 toolbox exposes ethers via hardhat runtime; TS type may complain.
// @ts-ignore

describe('MintGuard (core invariants)', () => {
  async function deploy() {
  // @ts-ignore
  const ReserveRegistry = await ethers.getContractFactory('ReserveRegistry');
    const reserveRegistry = await ReserveRegistry.deploy();
    await reserveRegistry.waitForDeployment();
    await reserveRegistry.addReserve('USD_BANK_1', 1_000_000n);

  // @ts-ignore
  const SystemGuard = await ethers.getContractFactory('SystemGuard');
    const systemGuard = await SystemGuard.deploy();
    await systemGuard.waitForDeployment();

  // @ts-ignore
  const MintGuard = await ethers.getContractFactory('MintGuard');
    const mintGuard = await MintGuard.deploy(
      await reserveRegistry.getAddress(),
      await systemGuard.getAddress(),
      1_000_000n
    );
    await mintGuard.waitForDeployment();
    return { reserveRegistry, systemGuard, mintGuard };
  }

  it('canMint under cap and reserves', async () => {
    const { mintGuard } = await deploy();
    const [ok] = await mintGuard.canMint(100_000);
    expect(ok).to.be.true;
  });

  it('rejects over cap', async () => {
    const { mintGuard } = await deploy();
    const [ok, reason] = await mintGuard.canMint(2_000_000);
    expect(ok).to.be.false;
    expect(reason).to.equal('Exceeds global cap');
  });

  it('rejects over reserves', async () => {
    const { mintGuard } = await deploy();
    const [ok, reason] = await mintGuard.canMint(1_100_000);
    expect(ok).to.be.false;
    expect(reason).to.equal('Insufficient reserves');
  });

  it('tracks net minted and burns', async () => {
    const { mintGuard } = await deploy();
    await mintGuard.requestMint(50_000, ethers.encodeBytes32String('BATCH'));
    await mintGuard.confirmMint(50_000, 'XRPL_TX_HASH_A');
    expect(await mintGuard.totalNetMinted()).to.equal(50_000);
    await mintGuard.recordBurn(10_000, 'XRPL_TX_HASH_B');
    expect(await mintGuard.totalNetMinted()).to.equal(40_000);
  });

  it('rejects mint when paused', async () => {
    const { mintGuard, systemGuard } = await deploy();
    await systemGuard.pause('maintenance');
    const [ok, reason] = await mintGuard.canMint(10_000);
    expect(ok).to.be.false;
    expect(reason).to.equal('System is paused');
  });
});
