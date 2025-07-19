// Simple daemon wrapper for the chatbot server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverProcess = null;
let restartCount = 0;
const maxRestarts = 10;
const restartDelay = 5000; // 5 seconds

function startServer() {
  console.log(`[${new Date().toISOString()}] Starting chatbot server...`);
  
  serverProcess = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env }
  });

  serverProcess.on('close', (code) => {
    console.log(`[${new Date().toISOString()}] Server process exited with code ${code}`);

    // Always restart unless explicitly stopped (code 0 means normal exit, but we want to keep running)
    if (restartCount < maxRestarts) {
      restartCount++;
      console.log(`[${new Date().toISOString()}] Restarting server (attempt ${restartCount}/${maxRestarts})...`);

      setTimeout(() => {
        startServer();
      }, restartDelay);
    } else if (restartCount >= maxRestarts) {
      console.log(`[${new Date().toISOString()}] Max restart attempts reached. Stopping daemon.`);
      process.exit(1);
    }
  });

  serverProcess.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Server process error:`, err);
  });

  // Reset restart count on successful start
  setTimeout(() => {
    restartCount = 0;
  }, 30000); // Reset after 30 seconds of successful running
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] Received SIGINT. Shutting down gracefully...`);
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] Received SIGTERM. Shutting down gracefully...`);
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

console.log(`[${new Date().toISOString()}] Chatbot Server Daemon starting...`);
startServer();
