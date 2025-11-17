import { expect } from 'chai';
import { Client } from 'xrpl';

/**
 * XRPL Node Health Tests
 * 
 * Validates connectivity, sync status, and latency for all 3 FTH XRPL nodes.
 */

describe('XRPL Node Health', () => {
  const nodes = [
    { name: 'Core', url: process.env.XRPL_CORE_NODE || 'wss://core.xrpl.futuretech.internal' },
    { name: 'Treasury', url: process.env.XRPL_TREASURY_NODE || 'wss://treasury.xrpl.futuretech.internal' },
    { name: 'Member API', url: process.env.XRPL_MEMBER_API_NODE || 'wss://api.xrpl.futuretech.com' },
  ];

  nodes.forEach(node => {
    describe(`${node.name} Node`, () => {
      let client: Client;

      before(async () => {
        client = new Client(node.url);
      });

      after(async () => {
        if (client.isConnected()) {
          await client.disconnect();
        }
      });

      it('should connect successfully', async function() {
        this.timeout(5000);
        await client.connect();
        expect(client.isConnected()).to.be.true;
      });

      it('should be synced (validated ledger recent)', async function() {
        this.timeout(5000);
        
        if (!client.isConnected()) {
          await client.connect();
        }

        const serverInfo = await client.request({
          command: 'server_info',
        });

        const info = serverInfo.result.info;
        console.log(`    Validated Ledger: ${info.validated_ledger?.seq}`);
        console.log(`    Complete Ledgers: ${info.complete_ledgers}`);

        // Check if node is synced
        expect(info.server_state).to.be.oneOf([
          'full',
          'validating',
          'proposing',
        ], `Node not synced: ${info.server_state}`);

        // Check validated ledger exists
        expect(info.validated_ledger).to.not.be.undefined;
        expect(info.validated_ledger?.seq).to.be.greaterThan(0);
      });

      it('should have acceptable latency (<2s)', async function() {
        this.timeout(5000);

        if (!client.isConnected()) {
          await client.connect();
        }

        const start = Date.now();
        await client.request({
          command: 'ledger',
          ledger_index: 'validated',
        });
        const latency = Date.now() - start;

        console.log(`    Latency: ${latency}ms`);
        expect(latency).to.be.lessThan(2000);
      });

      it('should have sufficient peers', async function() {
        this.timeout(5000);

        if (!client.isConnected()) {
          await client.connect();
        }

        const serverInfo = await client.request({
          command: 'server_info',
        });

        const peers = serverInfo.result.info.peers || 0;
        console.log(`    Peers: ${peers}`);

        // Minimum 5 peers for healthy connectivity
        expect(peers).to.be.greaterThanOrEqual(5, 'Too few peers connected');
      });
    });
  });

  describe('Node Routing', () => {
    it('should have all nodes reachable', async function() {
      this.timeout(15000);

      const results = await Promise.allSettled(
        nodes.map(async node => {
          const client = new Client(node.url);
          await client.connect();
          const connected = client.isConnected();
          await client.disconnect();
          return { node: node.name, connected };
        })
      );

      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          console.log(`    ${nodes[i].name}: ✓ reachable`);
          expect(result.value.connected).to.be.true;
        } else {
          console.log(`    ${nodes[i].name}: ✗ unreachable`);
          expect.fail(`${nodes[i].name} node unreachable: ${result.reason}`);
        }
      });
    });
  });
});
