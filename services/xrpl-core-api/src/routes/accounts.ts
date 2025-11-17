import { Router } from 'express';
import { getXrplClient } from '../xrplClient';

export const accountsRouter = Router();

/**
 * GET /xrpl/account/:address
 * Get account information
 */
accountsRouter.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { role = 'core' } = req.query;

    const client = await getXrplClient(role as any);

    const response = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });

    res.json({
      success: true,
      data: response.result
    });
  } catch (error) {
    console.error('Account info error:', error);
    res.status(500).json({ error: 'Failed to fetch account info', message: (error as Error).message });
  }
});

/**
 * GET /xrpl/account/:address/balances
 * Get account balances including trustlines
 */
accountsRouter.get('/:address/balances', async (req, res) => {
  try {
    const { address } = req.params;
    const { role = 'core' } = req.query;

    const client = await getXrplClient(role as any);

    const response = await client.request({
      command: 'account_lines',
      account: address,
      ledger_index: 'validated'
    });

    res.json({
      success: true,
      data: response.result
    });
  } catch (error) {
    console.error('Account balances error:', error);
    res.status(500).json({ error: 'Failed to fetch account balances', message: (error as Error).message });
  }
});
