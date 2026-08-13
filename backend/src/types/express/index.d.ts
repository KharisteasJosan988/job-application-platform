import { Role } from '@prisma/client';

// Extend Express's Request type so `req.user` is typed everywhere
// after the auth middleware attaches it.
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
      };
    }
  }
}

export {};
