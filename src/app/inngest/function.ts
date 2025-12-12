import {
  gemini,
  createAgent,
  createTool,
  AnyZodType,
  createNetwork,
  type Tool,
  type Message,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import "dotenv/config";
import { inngest } from "./client";
import z from "zod";
import { getSandbox } from "./utils";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { lastAssistantTextMessageContent } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { SANDBOX_TIMEOUT } from "./types";
import type { Message as PrismaMessage } from "@/generated/prisma";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    //
    // SANDBOX CREATE
    //
    const sandboxId = await step!.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-testt2");
      await sandbox.setTimeout(SANDBOX_TIMEOUT);
      return sandbox.sandboxId;
    });

    //
    // LOAD PREVIOUS MESSAGES
    //
    const previousMessages = await step!.run(
      "get-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];

        const messages: PrismaMessage[] = await prisma.message.findMany({
          where: { projectId: event.data.projectId },
          orderBy: { createdAt: "desc" },
          take: 5,
        });

        for (const msg of messages) {
          formattedMessages.push({
            type: "text",
            role: msg.role === "ASSISTANT" ? "assistant" : "user",
            content: msg.content,
          });
        }

        return formattedMessages.reverse();
      }
    );

    //
    // INITIAL AGENT STATE
    //
    const state = createState<AgentState>(
      { summary: "", files: {} },
      { messages: previousMessages }
    );

    //
    // CODE AGENT DEFINITION
    //
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "an expert coding agent",
      system: PROMPT,
      model: gemini({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
      }),

      tools: [
        // TERMINAL TOOL
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands.",
          parameters: z.object({
            command: z.string(),
          }) as unknown as AnyZodType,

          handler: async ({ command }, ctx) => {
            const { step } = ctx;
            return await step!.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });

                return result.stdout;
              } catch (e) {
                console.error(
                  `Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
                );
                return `Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),

        // CREATE OR UPDATE FILES TOOL
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox.",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }) as unknown as AnyZodType,

          handler: async ({ files }, ctx: Tool.Options<AgentState>) => {
            const { step, network } = ctx;
            const updatedFiles = await step!.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const fileMap = (network!.state.data.files as {
                    [k: string]: string;
                  }) || {};
                  const sandbox = await getSandbox(sandboxId);

                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    fileMap[file.path] = file.content;
                  }

                  return fileMap;
                } catch (e) {
                  return { error: String(e) };
                }
              }
            );

            if (
              updatedFiles &&
              typeof updatedFiles === "object" &&
              !(updatedFiles as any).error
            ) {
              network!.state.data.files = updatedFiles as {
                [k: string]: string;
              };
            }
          },
        }),

        // READ FILES TOOL
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox.",
          parameters: z.object({
            files: z.array(z.string()),
          }) as unknown as AnyZodType,

          handler: async ({ files }, ctx) => {
            const { step } = ctx;
            return await step!.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents: { path: string; content: string }[] = [];

                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }

                return JSON.stringify(contents);
              } catch (e) {
                console.error(`Error reading files: ${e}`);
                return `Error reading files: ${e}`;
              }
            });
          },
        }),
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastMsg = lastAssistantTextMessageContent(result);

          if (lastMsg && network) {
            if (lastMsg.includes("<task_summary>")) {
              network.state.data.summary = lastMsg;
            }
          }

          return result;
        },
      },
    });

    //
    // NETWORK SETUP
    //
    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,

      router: async ({ network }) => {
        if (network.state.data.summary) return;
        return codeAgent;
      },
    });

    //
    // RUN MAIN AGENT LOOP (guard inputs)
    //
    const inputValue = event?.data?.value ?? "";
    const result = await network.run(inputValue, { state });

    //
    // SECONDARY AGENTS: TITLE + RESPONSE MAKER
    //
    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: gemini({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
      }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: gemini({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
      }),
    });

    const safeSummary = result?.state?.data?.summary ?? "";

    const { output: fragmentTitleOutput = [] } =
      (await fragmentTitleGenerator.run(safeSummary)) || {};
    const { output: responseOutput = [] } =
      (await responseGenerator.run(safeSummary)) || {};

    //
    // FORMAT TITLE + RESPONSE (safe guards)
    //
    const generateFragmentTitle = () => {
      const first = fragmentTitleOutput[0] as any;
      if (!first) return "Fragment";
      if (first.type === "text") return "Fragment";
      if (Array.isArray(first.content)) {
        return first.content.map(String).join("");
      }
      return first.content || "Fragment";
    };

    const generateResponse = () => {
      const first = responseOutput[0] as any;
      if (!first) return "Here you go.";
      if (first.type === "text") return "Here you go.";
      if (Array.isArray(first.content)) {
        return first.content.map(String).join("");
      }
      return first.content || "Here you go.";
    };

    //
    // DETECT ERROR STATE
    //
    const isError =
      !result?.state?.data?.summary ||
      Object.keys(result?.state?.data?.files || {}).length === 0;

    //
    // SANDBOX HOST URL
    //
    const sandboxUrl = await step!.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = await sandbox.getHost(3000);
      return `https://${host}`;
    });

    //
    // SAVE RESULTS
    //
    await step!.run("save-results", async () => {
      if (isError) {
        return prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      return prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            },
          },
        },
      });
    });

    //
    // RETURN FINAL RESPONSE
    //
    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
