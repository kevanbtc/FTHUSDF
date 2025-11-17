import { Client } from 'xrpl';

// Node role types
export type NodeRole = 'core' | 'treasury' | 'member_api';

// Node routing configuration
interface NodeConfig {
  url: string;
  role: NodeRole;
}

// TODO: Load from infra/xrpl.nodes.json
const NODE_CONFIG: Record<NodeRole, NodeConfig> = {
  core: {
    url: process.env.XRPL_CORE_NODE_URL || 'wss://xrplcluster.com',
    role: 'core'
  },
  treasury: {
    url: process.env.XRPL_TREASURY_NODE_URL || 'wss://xrplcluster.com',
    role: 'treasury'
  },
  member_api: {
    url: process.env.XRPL_MEMBER_API_NODE_URL || 'wss://xrplcluster.com',
    role: 'member_api'
  }
};

// Client cache
const clients: Map<NodeRole, Client> = new Map();

/**
 * Get an XRPL client for a specific node role
 * @param role The node role to connect to
 * @returns Connected XRPL client
 */
export async function getXrplClient(role: NodeRole = 'core'): Promise<Client> {
  // Check cache
  let client = clients.get(role);
  
  if (client && client.isConnected()) {
    return client;
  }

  // Create new client
  const config = NODE_CONFIG[role];
  client = new Client(config.url);
  
  await client.connect();
  clients.set(role, client);
  
  console.log(`Connected to XRPL ${role} node: ${config.url}`);
  
  return client;
}

/**
 * Disconnect all XRPL clients
 */
export async function disconnectAll(): Promise<void> {
  for (const [role, client] of clients.entries()) {
    if (client.isConnected()) {
      await client.disconnect();
      console.log(`Disconnected from XRPL ${role} node`);
    }
  }
  clients.clear();
}
