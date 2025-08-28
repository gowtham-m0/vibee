import { serve } from "inngest/next";
import { inngest } from "@/app/inngest/client";
import { codeAgentFunction } from "@/app/inngest/function";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    codeAgentFunction
  ],
});