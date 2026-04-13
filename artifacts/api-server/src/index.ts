import { createServer } from "node:http";
import app from "./app";
import { logger } from "./lib/logger";
import { setupCollabWebSocket } from "./collab";

if (!process.env.ADMIN_EMAILS) {
  logger.warn("ADMIN_EMAILS is not set — admin role auto-assignment will be disabled");
}

const DEFAULT_PORT = 8080;
const rawPort = process.env["PORT"] || String(DEFAULT_PORT);
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  logger.error({ rawPort }, "Invalid PORT value, exiting");
  process.exit(1);
}

const server = createServer(app);

setupCollabWebSocket(server);

server.listen(port, () => {
  logger.info({ port }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err }, "Server failed to start");
  process.exit(1);
});
