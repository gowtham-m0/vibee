import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/app/inngest/client';
export const appRouter = createTRPCRouter({
  invoke: baseProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({input}) => {
      await inngest.send({
        name: "test/hello.world",
        data: {
          email: input.name,
        },
      });
      }),
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;