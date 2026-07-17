import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AppContext } from '../services/context.js';
import type { User } from '../domain/types.js';
import { sessionUser } from '../services/users.js';

export const SESSION_COOKIE = 'dnc_session';

declare module 'fastify' {
  interface FastifyRequest {
    user: User;
  }
}

/** Session authentication for every /api route except login. Roles are enforced server-side per route. */
export function makeAuthHook(ctx: AppContext) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.url.startsWith('/api') || req.url.startsWith('/api/auth/login')) return;
    const token = req.cookies[SESSION_COOKIE];
    const user = token ? sessionUser(ctx, token) : null;
    if (!user) {
      await reply.code(401).send({ error: 'unauthenticated' });
      return reply;
    }
    req.user = user;
  };
}

/** The UI greys out engineer-only actions; this is the actual control. */
export async function requireEngineer(req: FastifyRequest, reply: FastifyReply): Promise<unknown> {
  if (req.user?.role !== 'engineer') {
    await reply.code(403).send({ error: 'forbidden', explanation: 'This action requires the Engineer role.' });
    return reply;
  }
  return undefined;
}
