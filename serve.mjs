#!/usr/bin/env node

import { exec } from "child_process";
import { networkInterfaces } from "os";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get local IP address
function getLocalIP() {
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  // Return the first available IP
  const interfaces = Object.keys(results);
  if (interfaces.length > 0) {
    return results[interfaces[0]][0];
  }
  return "localhost";
}

const distPath = path.join(__dirname, "dist");
const port = process.env.PORT || 3000;
const host = "0.0.0.0"; // Bind to all interfaces
const localIP = getLocalIP();

console.log("🚀 Starting server...");
console.log(`📁 Serving files from: ${distPath}`);
console.log(`🌐 Server will be available at:`);
console.log(`   - Local:    http://localhost:${port}`);
console.log(`   - Network:  http://${localIP}:${port}`);
console.log(
  `   - Public:   http://0.0.0.0:${port} (accessible from any device on your network)`,
);
console.log("\n💡 Press Ctrl+C to stop the server\n");

// Use the serve package to start the server
const serveCommand = `npx serve -s "${distPath}" -l ${port}`;

const serverProcess = exec(serveCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error starting server: ${error.message}`);
    process.exit(1);
  }
});

// Forward output from serve command
serverProcess.stdout.on("data", (data) => {
  console.log(data.toString());
});

serverProcess.stderr.on("data", (data) => {
  console.error(data.toString());
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  serverProcess.kill("SIGTERM");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server...");
  serverProcess.kill("SIGTERM");
  process.exit(0);
});
