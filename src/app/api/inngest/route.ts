import { serve } from "inngest/next";
import { inngest } from "@/app/inngest/client";
import { helloWorld } from "@/app/inngest/function";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld
  ],
});