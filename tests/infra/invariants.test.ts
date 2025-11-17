import { expect } from 'chai';
import { Client } from 'xrpl';
import { ethers } from 'ethers';

/**
 * Invariant Tests: Supply ≤ Reserves
 * 
 * This test validates the core invariant of the FTHUSD stablecoin:
 * total_supply_on_xrpl <= total_reserves_in_banks
 * 
 * This is the #1 safety check for solvency.
 */

describe('Invariant: Supply ≤ Reserves', () => {
  let xrplClient: Client;
  let provider: ethers.JsonRpcProvider;
  let reserveRegistry: ethers.Contract;
  
  const FTHUSD_ISSUER = process.env.FTHUSD_ISSUER || 'rIssuerAddress...';
  const FTHUSD_CURRENCY = '465448555344000000000000000000000000'; // FTHUSD hex
  const RESERVE_REGISTRY_ADDRESS = process.env.RESERVE_REGISTRY_ADDRESS || '0x...';
  const RESERVE_REGISTRY_ABI = [
    'function totalReservesUsd() view returns (uint256)',
  ];

  before(async () => {
    // Connect to XRPL core node
    xrplClient = new Client(process.env.XRPL_CORE_NODE || 'wss://xrplcluster.com');
    await xrplClient.connect();

    // Connect to EVM provider
    provider = new ethers.JsonRpcProvider(process.env.EVM_RPC || 'http://localhost:8545');
    reserveRegistry = new ethers.Contract(
      RESERVE_REGISTRY_ADDRESS,
      RESERVE_REGISTRY_ABI,
      provider
    );
  });

  after(async () => {
    await xrplClient.disconnect();
  });

  it('should satisfy: XRPL supply <= EVM reserves', async function() {
    this.timeout(10000);

    // 1. Get total supply from XRPL
    const totalSupply = await getTotalSupplyFromXRPL();
    console.log(`  XRPL Total Supply: $${totalSupply.toFixed(2)}`);

    // 2. Get total reserves from EVM
    const totalReserves = await getTotalReservesFromEVM();
    console.log(`  EVM Total Reserves: $${totalReserves.toFixed(2)}`);

    // 3. Check invariant
    expect(totalSupply).to.be.lte(
      totalReserves,
      `Invariant violated: supply (${totalSupply}) > reserves (${totalReserves})`
    );

    // 4. Log buffer
    const buffer = totalReserves - totalSupply;
    const bufferPercent = (buffer / totalReserves) * 100;
    console.log(`  Buffer: $${buffer.toFixed(2)} (${bufferPercent.toFixed(2)}%)`);
  });

  /**
   * Calculate total FTHUSD supply on XRPL
   * Method: Query all trustlines for FTHUSD, sum balances
   */
  async function getTotalSupplyFromXRPL(): Promise<number> {
    // Get issuer account info
    const issuerInfo = await xrplClient.request({
      command: 'gateway_balances',
      account: FTHUSD_ISSUER,
      ledger_index: 'validated',
    });

    // Sum all balances (trustlines held by customers)
    let totalSupply = 0;
    if (issuerInfo.result.obligations) {
      const obligations = issuerInfo.result.obligations as Record<string, string>;
      if (obligations['FTHUSD']) {
        totalSupply = parseFloat(obligations['FTHUSD']);
      }
    }

    return totalSupply;
  }

  /**
   * Get total reserves from EVM ReserveRegistry
   */
  async function getTotalReservesFromEVM(): Promise<number> {
    const reservesWei = await reserveRegistry.totalReservesUsd();
    // Assumes 6 decimals (USDC-like)
    return parseFloat(ethers.formatUnits(reservesWei, 6));
  }
});

describe('Invariant: MintGuard.totalNetMinted matches XRPL supply', () => {
  let xrplClient: Client;
  let provider: ethers.JsonRpcProvider;
  let mintGuard: ethers.Contract;

  const FTHUSD_ISSUER = process.env.FTHUSD_ISSUER || 'rIssuerAddress...';
  const MINT_GUARD_ADDRESS = process.env.MINT_GUARD_ADDRESS || '0x...';
  const MINT_GUARD_ABI = [
    'function totalNetMinted() view returns (uint256)',
  ];

  before(async () => {
    xrplClient = new Client(process.env.XRPL_CORE_NODE || 'wss://xrplcluster.com');
    await xrplClient.connect();

    provider = new ethers.JsonRpcProvider(process.env.EVM_RPC || 'http://localhost:8545');
    mintGuard = new ethers.Contract(MINT_GUARD_ADDRESS, MINT_GUARD_ABI, provider);
  });

  after(async () => {
    await xrplClient.disconnect();
  });

  it('should have MintGuard.totalNetMinted == XRPL supply', async function() {
    this.timeout(10000);

    // Get supply from XRPL
    const xrplSupply = await getTotalSupplyFromXRPL();
    console.log(`  XRPL Supply: $${xrplSupply.toFixed(2)}`);

    // Get totalNetMinted from MintGuard
    const mintedWei = await mintGuard.totalNetMinted();
    const mintedAmount = parseFloat(ethers.formatUnits(mintedWei, 6));
    console.log(`  MintGuard totalNetMinted: $${mintedAmount.toFixed(2)}`);

    // Allow small discrepancy (e.g., 0.01 due to rounding)
    const diff = Math.abs(xrplSupply - mintedAmount);
    expect(diff).to.be.lte(0.01, `MintGuard mismatch: ${diff.toFixed(2)}`);
  });

  async function getTotalSupplyFromXRPL(): Promise<number> {
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
