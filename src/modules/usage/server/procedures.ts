import { getUsageStatus } from "@/lib/usage";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { create } from "domain";

export const usageRouter = createTRPCRouter({

    status: protectedProcedure.query(async()=>{
        try {
            const usageStatus = await getUsageStatus();
            return usageStatus;
        } catch (error) {
            return null;
        }
    })

});