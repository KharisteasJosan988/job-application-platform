import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app';

// Vercel's @vercel/node runtime accepts any (req, res) => void handler.
// An Express app instance is itself a valid request handler, so we can
// export it directly — no app.listen() here (that's only for local dev,
// see src/index.ts). Each request is handled as its own serverless
// invocation instead of a long-running server process.
export default app;
