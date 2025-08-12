import { gemini, createAgent, createTool, AnyZodType, openai, anthropic, createNetwork } from '@inngest/agent-kit'
import { Sandbox } from "@e2b/code-interpreter"
import 'dotenv/config';

import { inngest } from "./client";
import z from 'zod';
import { getSandbox } from './utils';
import { PROMPT } from '@/prompt';
import { lastAssistantTextMessageContent } from '@/lib/utils';


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {

    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-testt2");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-agent",
      description: "an expert coding agent",
      system: PROMPT,
      model: gemini({
        model: "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY,
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands.",
          parameters: z.object({
            command: z.string(),
          }) as unknown as AnyZodType,
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
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
                  `Command failed: ${e} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`
                );
                return `Command failed: ${e} \n stdout: ${buffers.stdout} \n stderr: ${buffers.stderr}`;
              }
            });
          },
        }),

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
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }
                return updatedFiles
              } catch (e) {
                return "Error : " + e;
              }
            });
            if(typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox.",
          parameters: z.object({
            files: z.array(z.string()),
          }) as unknown as AnyZodType ,
          handler: async({files},{step}) =>{
            return await step?.run("readFiles", async () => {
            try{
              const sandbox = await getSandbox(sandboxId);
              const contents = [];
              for(const file of files){
                const content  = await sandbox.files.read(file);
                contents.push({path:file, content});
              }
              return JSON.stringify(contents);
            }
            catch(e){
              console.error(`Error reading files: ${e}`);
              return `Error reading files: ${e}`;
            }
          });
        },
        }),        
      ],
      lifecycle: {
        onResponse: async ({result,network })=>{
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);

          if(lastAssistantMessageText  && network){
            if(lastAssistantMessageText.includes("<task_summary>")){
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      }
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async({network}) => {
        const summary = network.state.data.summary;
        if(summary){
          return;
        }
        return codeAgent;
      }
    });

    const result = await network.run(event.data.value);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = await sandbox.getHost(3000);
      return `https://${host}`;
    });
    return { 
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary };
  },
);