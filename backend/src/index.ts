import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { initDatabase } from './db/index.js';
import categoriesRoutes from './routes/categories.js';
import questionsRoutes from './routes/questions.js';
import flashcardsRoutes from './routes/flashcards.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3012;

// The API is read-only and public. It is reached through Caddy -> nginx -> here
// (two proxies), so `req.ip` is taken from the client-facing end of the
// X-Forwarded-For chain that nginx appends to. Any change to that proxy chain
// must be reflected here, otherwise the rate limiter buckets every visitor
// together.
app.set('trust proxy', 2);
app.disable('x-powered-by');

initDatabase();

// Security headers. The API only ever returns JSON, so the CSP is locked all the
// way down; the HTML/JS/CSS is served by nginx, which sets its own headers.
app.use(helmet({
  contentSecurityPolicy: {
    directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

app.use(compression());

// One global limiter. Every route is a cheap indexed read and a human browsing
// the site fires only a handful of requests per page, so this is generous for a
// person and tight for a scraper or a flood. nginx has its own limit in front.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, slow down' },
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', limiter);
app.use('/api/categories', categoriesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/flashcards', flashcardsRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Last-resort handler: log the detail server-side, never ship it to the client.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Slowloris / idle-socket protection: drop connections that dribble or stall.
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;
