import express from 'express';
import { paymentsRouter } from './routes/payments';
import { trustlinesRouter } from './routes/trustlines';
import { accountsRouter } from './routes/accounts';
import { healthRouter } from './routes/health';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/xrpl/payment', paymentsRouter);
app.use('/xrpl/trustline', trustlinesRouter);
app.use('/xrpl/account', accountsRouter);
app.use('/health', healthRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`XRPL Core API listening on port ${PORT}`);
});
