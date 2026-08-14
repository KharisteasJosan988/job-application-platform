import path from 'path';
import fs from 'fs';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import applicationsRoutes from './modules/applications/applications.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// CORS_ORIGIN can be a single URL or a comma-separated list (useful when the
// frontend has multiple URLs, e.g. Vercel's production + preview deployments).
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, server-to-server, health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'IndoKerja.id API is running' });
});

// Feature routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);

// 404 handler for unknown /api/* routes (defined before static/catch-all below)
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// --- Serve frontend build (single-service deployment) ---
// If `public/` (the copied `frontend/dist`) exists, this backend also serves
// the React app, so the whole platform is reachable from ONE URL — useful for
// deploying to Render/Railway/Heroku-like platforms where only one live link
// is expected.
const clientBuildPath = path.join(__dirname, '..', 'public');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // SPA fallback: any non-API GET request returns index.html so React Router
  // can handle client-side routing.
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Centralized error handler (must be registered last)
app.use(errorHandler as unknown as (err: unknown, req: Request, res: Response, next: NextFunction) => void);

export default app;
