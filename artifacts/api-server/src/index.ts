import { createServer } from "node:http";
import app from "./app";
import { logger } from "./lib/logger";
import { setupCollabWebSocket } from "./collab";
import { config } from "./lib/config";

if (config.adminEmails.length === 0) {
  logger.warn("ADMIN_EMAILS is not set — admin role auto-assignment will be disabled");
}

const port = config.port;

if (Number.isNaN(port) || port <= 0) {
  logger.error({ port }, "Invalid PORT value, exiting");
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
