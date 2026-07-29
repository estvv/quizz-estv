import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { initDatabase } from './db/index.js';
import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import questionsRoutes from './routes/questions.js';

dotenv.config();

if (!process.env.AUTH_PASSWORD || !process.env.JWT_SECRET) {
  console.error('Missing required environment variables: AUTH_PASSWORD and JWT_SECRET must be set.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3012;

app.set('trust proxy', 2);

initDatabase();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10000,
  message: { success: false, error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many login attempts' }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/questions', questionsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
