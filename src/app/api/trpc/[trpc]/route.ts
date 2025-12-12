export const runtime = 'nodejs';

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';


const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({req}),
  });
export { handler as GET, handler as POST };