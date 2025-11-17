import { Router } from 'express';
import { getXrplClient } from '../xrplClient';

export const paymentsRouter = Router();

/**
 * POST /xrpl/payment
 * Send a payment on XRPL
 */
paymentsRouter.post('/', async (req, res) => {
  try {
    const { source, destination, amount, currency, issuer, role = 'core' } = req.body;

    // Validation
    if (!source || !destination || !amount) {
      return res.status(400).json({ error: 'Missing required fields: source, destination, amount' });
    }

    const client = await getXrplClient(role);

    // TODO: Implement payment transaction
    // This is a stub - actual implementation would:
    // 1. Prepare payment transaction
    // 2. Sign with appropriate wallet
    // 3. Submit and wait for validation
    // 4. Return transaction result

    res.json({
      success: true,
      message: 'Payment submitted (stub)',
      data: {
        source,
        destination,
        amount,
        currency,
        issuer
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment failed', message: (error as Error).message });
  }
});
