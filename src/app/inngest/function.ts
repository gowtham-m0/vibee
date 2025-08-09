import { gemini, createAgent } from '@inngest/agent-kit'
import 'dotenv/config';

import { inngest } from "./client";
import { create } from 'domain';
import { success } from 'zod';

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert in next.js developer. you write readable, maintainable code. you write simple next.js and react snippets.",
      model: gemini({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
      }),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.value}`
    );
    return { output };
  },
);