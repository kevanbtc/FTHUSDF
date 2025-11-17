import { Router } from 'express';
import { getXrplClient } from '../xrplClient';

export const healthRouter = Router();

/**
 * GET /health
 * Service health check
 */
healthRouter.get('/', async (req, res) => {
  try {
    const client = await getXrplClient('core');
    
    const serverInfo = await client.request({
      command: 'server_info'
    });

    const isHealthy = client.isConnected() && serverInfo.result.info.server_state === 'full';

    res.json({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'xrpl-core-api',
      version: '0.1.0',
      xrpl: {
        connected: client.isConnected(),
        serverState: serverInfo.result.info.server_state,
        ledgerIndex: serverInfo.result.info.validated_ledger?.seq
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'xrpl-core-api',
      error: (error as Error).message
    });
  }
});
