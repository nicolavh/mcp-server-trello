import { runStdioServer } from "./server.js";

runStdioServer().catch((err) => {
  console.error(err);
  process.exit(1);
});

