import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { loadTrelloEnv, TrelloClient } from "./trello.js";
import { errorText } from "./mcp/codec.js";
import { HANDLERS } from "./mcp/handlers.js";
import { TOOLS } from "./mcp/tools.js";

export async function runStdioServer(): Promise<void> {
  const env = loadTrelloEnv(process.env);
  const trello = new TrelloClient(env.TRELLO_KEY, env.TRELLO_TOKEN);

  const server = new Server(
    { name: "mcp-server-trello", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;

    try {
      const handler = HANDLERS[toolName];
      if (!handler) throw new Error(`Unknown tool: ${toolName}`);
      return await handler(args, { env, trello });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return errorText(message);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

