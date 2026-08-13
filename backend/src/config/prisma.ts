import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient to avoid exhausting DB connections in dev (hot-reload)
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
