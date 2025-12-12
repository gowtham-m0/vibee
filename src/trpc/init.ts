import { getAuth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { NextRequest } from 'next/server';
import superjson from 'superjson';


export async function createTRPCContext(opts: {req: NextRequest}) {
  const {req} = opts;
  return { auth:  getAuth(req) };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

const isAuthed = t.middleware(({next, ctx})=>{
  if(!ctx.auth.userId){
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not Authroized"
    });
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});


// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);