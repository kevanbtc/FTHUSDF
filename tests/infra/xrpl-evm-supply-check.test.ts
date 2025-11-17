import { expect } from 'chai';
import { Client } from 'xrpl';
import { ethers } from 'ethers';

// Skip live XRPL↔EVM supply checks unless explicitly enabled.
const XRPL_SUPPLY_CHECK_ENABLED = process.env.XRPL_SUPPLY_CHECK_ENABLED === '1';

/**
 * Cross-Chain Supply Verification
 * 
 * Validates that XRPL supply matches EVM MintGuard records
 * This catches discrepancies from failed mint/burn operations
 */

describe('XRPL ↔ EVM Supply Check', () => {
  if (!XRPL_SUPPLY_CHECK_ENABLED) {
    it('skips live XRPL↔EVM supply checks (set XRPL_SUPPLY_CHECK_ENABLED=1 to enable)', () => {
      expect(true).to.be.true;
    });
    return;
  }
  let xrplClient: Client;
  let provider: ethers.JsonRpcProvider;
  let mintGuard: ethers.Contract;
  let reserveRegistry: ethers.Contract;

  const FTHUSD_ISSUER = process.env.FTHUSD_ISSUER || 'rIssuerAddress...';
  const MINT_GUARD_ADDRESS = process.env.MINT_GUARD_ADDRESS || '0x...';
  const RESERVE_REGISTRY_ADDRESS = process.env.RESERVE_REGISTRY_ADDRESS || '0x...';

  const MINT_GUARD_ABI = [
    'function totalNetMinted() view returns (uint256)',
  ];

  const RESERVE_REGISTRY_ABI = [
    'function totalReservesUsd() view returns (uint256)',
  ];

  before(async () => {
    // Connect to XRPL
    xrplClient = new Client(process.env.XRPL_CORE_NODE || 'wss://xrplcluster.com');
    await xrplClient.connect();

    // Connect to EVM
    provider = new ethers.JsonRpcProvider(process.env.EVM_RPC || 'http://localhost:8545');
    mintGuard = new ethers.Contract(MINT_GUARD_ADDRESS, MINT_GUARD_ABI, provider);
    reserveRegistry = new ethers.Contract(RESERVE_REGISTRY_ADDRESS, RESERVE_REGISTRY_ABI, provider);
  });

  after(async () => {
    await xrplClient.disconnect();
  });

  it('should have matching supply between XRPL and EVM', async function() {
    this.timeout(10000);

    // Get XRPL supply
    const xrplSupply = await getXRPLSupply();
    console.log(`  XRPL Supply: ${xrplSupply.toFixed(2)} FTHUSD`);

    // Get EVM MintGuard totalNetMinted
    const evmSupplyWei = await mintGuard.totalNetMinted();
    const evmSupply = parseFloat(ethers.formatUnits(evmSupplyWei, 6));
    console.log(`  EVM MintGuard: ${evmSupply.toFixed(2)} FTHUSD`);

    // Allow small discrepancy (0.01 for rounding)
    const discrepancy = Math.abs(xrplSupply - evmSupply);
    expect(discrepancy).to.be.lte(
      0.01,
      `Supply mismatch: XRPL=${xrplSupply}, EVM=${evmSupply}, diff=${discrepancy}`
    );
  });

  it('should have supply <= reserves', async function() {
    this.timeout(10000);

    const xrplSupply = await getXRPLSupply();
    const reservesWei = await reserveRegistry.totalReservesUsd();
    const reserves = parseFloat(ethers.formatUnits(reservesWei, 6));

    console.log(`  Supply: ${xrplSupply.toFixed(2)} FTHUSD`);
    console.log(`  Reserves: ${reserves.toFixed(2)} USD`);

    expect(xrplSupply).to.be.lte(
      reserves,
      `Invariant violated: supply (${xrplSupply}) > reserves (${reserves})`
    );

    const buffer = reserves - xrplSupply;
    const bufferPercent = (buffer / reserves) * 100;
    console.log(`  Reserve Buffer: ${buffer.toFixed(2)} (${bufferPercent.toFixed(2)}%)`);
  });

  it('should detect if supply exceeds cap', async function() {
    this.timeout(10000);

    const xrplSupply = await getXRPLSupply();

    // Example cap: 100M
    const SUPPLY_CAP = 100_000_000;

    expect(xrplSupply).to.be.lte(
      SUPPLY_CAP,
      `Supply exceeds cap: ${xrplSupply} > ${SUPPLY_CAP}`
    );

    const utilization = (xrplSupply / SUPPLY_CAP) * 100;
    console.log(`  Supply Cap Utilization: ${utilization.toFixed(2)}%`);
  });

  async function getXRPLSupply(): Promise<number> {
    const issuerInfo = await xrplClient.request({
      command: 'gateway_balances',
      account: FTHUSD_ISSUER,
      ledger_index: 'validated',
    });

    let totalSupply = 0;
    if (issuerInfo.result.obligations) {
      const obligations = issuerInfo.result.obligations as Record<string, string>;
      if (obligations['FTHUSD']) {
        totalSupply = parseFloat(obligations['FTHUSD']);
      }
    }

    return totalSupply;
  }
});
