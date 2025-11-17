import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

/**
 * POST /customers
 * Start customer onboarding
 */
app.post('/customers', async (req, res) => {
  try {
    const { name, email, country, entityType } = req.body;

    // TODO: Implement KYC onboarding flow
    // 1. Create customer record
    // 2. Initiate KYC check with provider
    // 3. Return customer ID

    res.json({
      success: true,
      customerId: 'stub-customer-id',
      status: 'pending'
    });
  } catch (error) {
    res.status(500).json({ error: 'Onboarding failed', message: (error as Error).message });
  }
});

/**
 * POST /customers/:id/approve
 * Approve a customer after KYC completion
 */
app.post('/customers/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { riskTier } = req.body;

    // TODO: Implement approval flow
    // 1. Update customer status
    // 2. Write to ComplianceRegistry contract
    // 3. Notify membership service

    res.json({
      success: true,
      customerId: id,
      status: 'approved',
      riskTier
    });
  } catch (error) {
    res.status(500).json({ error: 'Approval failed', message: (error as Error).message });
  }
});

/**
 * GET /customers/:id/status
 * Get customer KYC status
 */
app.get('/customers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement status check
    // 1. Query customer record
    // 2. Check KYC provider status
    // 3. Return comprehensive status

    res.json({
      success: true,
      customerId: id,
      status: 'pending',
      kycStatus: 'in_progress',
      riskTier: null
    });
  } catch (error) {
    res.status(500).json({ error: 'Status check failed', message: (error as Error).message });
  }
});

/**
 * GET /health
 * Service health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'compliance-service',
    version: '0.1.0'
  });
});

app.listen(PORT, () => {
  console.log(`Compliance Service listening on port ${PORT}`);
});
