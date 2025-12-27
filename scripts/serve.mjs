#!/usr/bin/env node
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "..", "dist");
const port = process.env.PORT || 1400;

const server = spawn("npx", ["serve", "-s", distPath, "-l", port.toString()], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.on("SIGINT", () => {
  server.kill();
  process.exit();
});
