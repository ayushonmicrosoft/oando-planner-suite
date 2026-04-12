import app from "./app";
import { logger } from "./lib/logger";

const DEFAULT_PORT = 8080;
const rawPort = process.env["PORT"] || String(DEFAULT_PORT);
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  logger.error({ rawPort }, "Invalid PORT value, exiting");
  process.exit(1);
}

const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err }, "Server failed to start");
  process.exit(1);
});
