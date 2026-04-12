import { fileURLToPath } from 'node:url';
import path from 'node:path';

process.env.HOSTNAME = '0.0.0.0';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, '.next', 'standalone', 'artifacts', 'planner-suite', 'server.js');

console.log(`Starting planner-suite from: ${serverPath}`);
console.log(`PORT=${process.env.PORT}, HOSTNAME=${process.env.HOSTNAME}`);

try {
  await import(serverPath);
} catch (err) {
  console.error('Failed to start planner-suite:', err);
  process.exit(1);
}
