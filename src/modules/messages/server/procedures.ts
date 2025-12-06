import { inngest } from "@/app/inngest/client";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const messageRouter = createTRPCRouter({

    getMany: protectedProcedure
    .input(
        z.object({
            projectId : z.string().min(1,{message: "ProjectId is required"}),
        }),
    )
    .query(async ({input,ctx}) => {
        const messages = await prisma.message.findMany({
            where : {
                projectId: input.projectId,
                project:{
                    userId: ctx.auth.userId,
                }
            },
            include: {
                fragment: true,
            },
            orderBy: {
                updatedAt: 'asc',
            },
        });
        return messages;
    }),

    create: protectedProcedure
  .input(
    z.object({
      value: z.string()
        .min(1, { message: "Message is required" })
        .max(10000, { message: "Message is too long" }),
      projectId: z.string().min(1, { message: "ProjectId is required" }),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const existingProject = await prisma.project.findUnique({
      where: { id: input.projectId, userId: ctx.auth.userId },
    });

    if (!existingProject) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    try {
      await consumeCredits();
    } catch (error) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "You have run out of credits.",
      });
    }

    // 1️⃣ Immediately store user message
    const createdMessage = await prisma.message.create({
      data: {
        projectId: existingProject.id,
        content: input.value,
        role: "USER",
        type: "RESULT",
      },
    });

    // 2️⃣ Trigger Inngest by HTTP POST (self-hosted)
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/inngest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "code-agent/run",
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      }),
    });

    // 3️⃣ Return immediately (do NOT wait for agent)
    return createdMessage;
  }),

});