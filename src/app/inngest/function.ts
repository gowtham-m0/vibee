import { gemini, createAgent } from '@inngest/agent-kit'
import { Sandbox } from "@e2b/code-interpreter"
import 'dotenv/config';

import { inngest } from "./client";
import { create } from 'domain';
import { success } from 'zod';
import { getSandbox } from './utils';

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event,step }) => {
    
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-testt2");
      return sandbox.sandboxId;
    });
    
    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert in next.js developer. you write readable, maintainable code. you write simple next.js and react snippets.",
      model: gemini({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
      }),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet in next.js: ${event.data.value}`
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = await sandbox.getHost(3000);
      return `https://${host}`;
    });
    return { output, sandboxUrl };
  },
);