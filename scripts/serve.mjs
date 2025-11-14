#!/usr/bin/env node

import { exec, spawn } from "child_process";
import { networkInterfaces } from "os";
import path from "path";
import { fileURLToPath } from "url";
import { readdir, stat, access } from "fs/promises";
import { createHash } from "crypto";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 STYLING & ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",

  // Standard colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Bright colors
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",

  // Backgrounds
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
};

const symbols = {
  // Status indicators
  success: "✓",
  error: "✗",
  warning: "⚠",
  info: "ℹ",

  // Activities
  server: "🚀",
  folder: "📁",
  network: "🌐",
  local: "🏠",
  external: "📡",

  lightning: "⚡",
  fire: "🔥",
  sparkles: "✨",
  eyes: "👀",
  stop: "🛑",
  gear: "⚙",
  globe: "🌍",

  // UI elements
  arrow: "→",
  bullet: "•",
  star: "★",
  diamond: "◆",

  // Box drawing
  boxLight: "─",
  boxHeavy: "━",
  boxDouble: "═",
  cornerTL: "┌",
  cornerTR: "┐",
  cornerBL: "└",
  cornerBR: "┘",
  cross: "┼",
  teeLeft: "├",
  teeRight: "┤",
  vertical: "│",
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🛠 UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function createGradient(text, startColor, endColor) {
  return text
    .split("")
    .map((char, i) => {
      const color = i % 2 === 0 ? startColor : endColor;
      return `${color}${char}${colors.reset}`;
    })
    .join("");
}

function createBox(content, title = "", style = "light") {
  const lines = content.split("\n");
  const maxLength = Math.max(
    ...lines.map((line) => line.replace(/\x1b\[[0-9;]*m/g, "").length),
    title.length,
  );
  const width = maxLength + 4;

  const horizontal =
    style === "heavy"
      ? symbols.boxHeavy
      : style === "double"
        ? symbols.boxDouble
        : symbols.boxLight;

  let result = "";

  // Top border
  result += `${symbols.cornerTL}${horizontal.repeat(width - 2)}${symbols.cornerTR}\n`;

  // Title
  if (title) {
    const padding = Math.floor((width - title.length - 4) / 2);
    result += `${symbols.vertical} ${" ".repeat(padding)}${colors.bold}${title}${colors.reset}${" ".repeat(padding)} ${symbols.vertical}\n`;
    result += `${symbols.teeLeft}${horizontal.repeat(width - 2)}${symbols.teeRight}\n`;
  }

  // Content
  lines.forEach((line) => {
    const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, "");
    const padding = width - cleanLine.length - 4;
    result += `${symbols.vertical} ${line}${" ".repeat(padding)} ${symbols.vertical}\n`;
  });

  // Bottom border
  result += `${symbols.cornerBL}${horizontal.repeat(width - 2)}${symbols.cornerBR}`;

  return result;
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 NETWORK UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function getAllNetworkInterfaces() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        results.push({
          interface: name,
          address: net.address,
          netmask: net.netmask,
          mac: net.mac,
        });
      }
    }
  }

  return results;
}

function getPrimaryIP() {
  const interfaces = getAllNetworkInterfaces();

  // Prefer WiFi/Ethernet interfaces
  const preferred = interfaces.find(
    (iface) =>
      iface.interface.toLowerCase().includes("wlan") ||
      iface.interface.toLowerCase().includes("wifi") ||
      iface.interface.toLowerCase().includes("eth") ||
      iface.interface.toLowerCase().includes("en"),
  );

  return preferred ? preferred.address : interfaces[0]?.address || "localhost";
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 FILE SYSTEM UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

async function analyzeDistDirectory(distPath) {
  try {
    await access(distPath);
    const entries = await readdir(distPath);

    const plugins = [];
    let totalSize = 0;

    for (const entry of entries) {
      try {
        const entryPath = path.join(distPath, entry);
        const entryStats = await stat(entryPath);

        if (entryStats.isDirectory()) {
          // Analyze plugin directory
          const pluginFiles = await readdir(entryPath);
          let pluginSize = 0;

          for (const file of pluginFiles) {
            const filePath = path.join(entryPath, file);
            const fileStats = await stat(filePath);
            if (fileStats.isFile()) {
              pluginSize += fileStats.size;
            }
          }

          plugins.push({
            name: entry,
            size: pluginSize,
            files: pluginFiles.length,
          });

          totalSize += pluginSize;
        }
      } catch (error) {
        // Skip entries that can't be read
      }
    }

    return {
      plugins,
      totalSize,
      totalPlugins: plugins.length,
    };
  } catch (error) {
    return {
      plugins: [],
      totalSize: 0,
      totalPlugins: 0,
      error: error.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 LOGGER
// ═══════════════════════════════════════════════════════════════════════════════

const logger = {
  banner() {
    const title = createGradient(
      "VENDETTA DEV SERVER",
      colors.brightCyan,
      colors.brightMagenta,
    );
    const subtitle = `${colors.dim}Professional development server for Vendetta plugins${colors.reset}`;

    console.log();
    console.log(`  ${symbols.server} ${title}`);
    console.log(`  ${subtitle}`);
    console.log();
  },

  section(title) {
    const line = symbols.boxHeavy.repeat(60);
    console.log(`\n${colors.brightBlue}${line}${colors.reset}`);
    console.log(`${colors.bold}${colors.brightBlue}  ${title}${colors.reset}`);
    console.log(`${colors.brightBlue}${line}${colors.reset}\n`);
  },

  info(message, icon = symbols.info) {
    console.log(`${colors.brightBlue}${icon}${colors.reset} ${message}`);
  },

  success(message, icon = symbols.success) {
    console.log(`${colors.brightGreen}${icon}${colors.reset} ${message}`);
  },

  warning(message, icon = symbols.warning) {
    console.log(`${colors.brightYellow}${icon}${colors.reset} ${message}`);
  },

  error(message, icon = symbols.error) {
    console.log(`${colors.brightRed}${icon}${colors.reset} ${message}`);
  },

  table(headers, rows) {
    const colWidths = headers.map((header, i) =>
      Math.max(
        header.length,
        ...rows.map(
          (row) =>
            (row[i] || "").toString().replace(/\x1b\[[0-9;]*m/g, "").length,
        ),
      ),
    );

    // Header
    const headerRow = headers
      .map(
        (header, i) =>
          `${colors.bold}${header.padEnd(colWidths[i])}${colors.reset}`,
      )
      .join(` ${colors.dim}│${colors.reset} `);

    console.log(`  ${headerRow}`);

    // Separator
    const separator = colWidths
      .map((width) => symbols.boxLight.repeat(width))
      .join(`${colors.dim}─┼─${colors.reset}`);
    console.log(`  ${colors.dim}${separator}${colors.reset}`);

    // Rows
    rows.forEach((row) => {
      const formattedRow = row
        .map((cell, i) => {
          const cleanCell = (cell || "")
            .toString()
            .replace(/\x1b\[[0-9;]*m/g, "");
          const padding = colWidths[i] - cleanCell.length;
          return cell + " ".repeat(padding);
        })
        .join(` ${colors.dim}│${colors.reset} `);

      console.log(`  ${formattedRow}`);
    });
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.clear();

  // Configuration
  const distPath = path.join(__dirname, "..", "dist");
  const port = process.env.PORT || 1400;
  const host = "0.0.0.0";
  const primaryIP = getPrimaryIP();
  const allInterfaces = getAllNetworkInterfaces();

  // Display banner
  logger.banner();

  // Analyze distribution directory
  logger.section("Analyzing Distribution");

  const analysis = await analyzeDistDirectory(distPath);

  if (analysis.error) {
    logger.error(`Cannot access dist directory: ${analysis.error}`);
    logger.info(
      `Make sure to run ${colors.bold}npm run build${colors.reset} first`,
    );
    process.exit(1);
  }

  logger.info(
    `${colors.dim}Serving from${colors.reset} ${colors.bold}${distPath}${colors.reset}`,
  );
  logger.success(
    `Found ${colors.bold}${analysis.totalPlugins}${colors.reset} plugin(s) ${colors.dim}(${formatFileSize(analysis.totalSize)} total)${colors.reset}`,
  );

  // Plugin table
  if (analysis.plugins.length > 0) {
    console.log();
    const pluginRows = analysis.plugins.map((plugin) => [
      plugin.name,
      plugin.files.toString(),
      formatFileSize(plugin.size),
    ]);

    logger.table(["Plugin", "Files", "Size"], pluginRows);
  }

  // Network information
  logger.section("Network Configuration");

  const localUrl = `http://localhost:${port}`;
  const networkUrl = `http://${primaryIP}:${port}`;

  logger.info(
    `${colors.dim}Binding to${colors.reset} ${colors.bold}${host}:${port}${colors.reset}`,
  );

  // Network interfaces table
  if (allInterfaces.length > 0) {
    console.log();
    const networkRows = allInterfaces.map((iface) => [
      iface.interface,
      iface.address,
      `http://${iface.address}:${port}`,
    ]);

    logger.table(["Interface", "IP Address", "URL"], networkRows);
  }

  // Access URLs
  logger.section("Access Information");

  logger.success(
    `${symbols.local} Local:    ${colors.bold}${colors.underline}${localUrl}${colors.reset}`,
  );
  logger.success(
    `${symbols.network} Network:  ${colors.bold}${colors.underline}${networkUrl}${colors.reset}`,
  );
  logger.info(
    `${symbols.globe} External: ${colors.dim}Accessible from any device on your network${colors.reset}`,
  );

  // Server startup
  logger.section("Starting Server");

  logger.info(`${symbols.lightning} Initializing development server...`);

  // Check if serve is available
  try {
    await new Promise((resolve, reject) => {
      exec("npx serve --version", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    logger.warning("Installing serve package...");
  }

  const serverProcess = spawn(
    "npx",
    ["serve", "-s", distPath, "-l", port.toString()],
    {
      stdio: ["pipe", "pipe", "pipe"],
      shell: process.platform === "win32",
    },
  );

  // Handle server output
  let serverStarted = false;

  serverProcess.stdout.on("data", (data) => {
    const output = data.toString();

    if (
      !serverStarted &&
      (output.includes("Accepting connections") || output.includes("Local:"))
    ) {
      serverStarted = true;

      logger.success(`${symbols.fire} Server is running!`);
      console.log();

      // Instructions
      logger.info(
        `${symbols.eyes} ${colors.dim}Watching for file changes...${colors.reset}`,
      );
      logger.info(
        `${symbols.stop} ${colors.dim}Press ${colors.reset}${colors.bold}Ctrl+C${colors.reset}${colors.dim} to stop the server${colors.reset}`,
      );

      console.log();
      console.log(
        `${colors.brightGreen}${symbols.sparkles} Ready to develop! ${symbols.sparkles}${colors.reset}`,
      );
      console.log();
    }

    // Filter out serve's own output to avoid duplication
    if (
      !output.includes("Local:") &&
      !output.includes("On Your Network:") &&
      !output.includes("Copied local address") &&
      !output.includes("Accepting connections") &&
      output.trim()
    ) {
      console.log(`${colors.dim}[serve] ${output.trim()}${colors.reset}`);
    }
  });

  serverProcess.stderr.on("data", (data) => {
    const error = data.toString().trim();
    if (error && !error.includes("WARNING") && !error.includes("deprecated")) {
      logger.error(`Server error: ${error}`);
    }
  });

  serverProcess.on("error", (error) => {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });

  serverProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      logger.error(`Server exited with code ${code}`);
      process.exit(code);
    }
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(
      `\n${colors.brightYellow}${symbols.stop} Received ${signal}, shutting down gracefully...${colors.reset}`,
    );

    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill("SIGTERM");

      setTimeout(() => {
        if (!serverProcess.killed) {
          logger.warning("Force killing server process...");
          serverProcess.kill("SIGKILL");
        }
      }, 5000);
    }

    setTimeout(() => {
      logger.success("Server stopped successfully");
      process.exit(0);
    }, 1000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logger.error(`Uncaught exception: ${error.message}`);
    console.error(error.stack);
    shutdown("UNCAUGHT_EXCEPTION");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
    shutdown("UNHANDLED_REJECTION");
  });
}

// Start the server
main().catch((error) => {
  console.error(
    `${colors.brightRed}${symbols.error} Fatal error:${colors.reset}`,
    error.message,
  );
  console.error(error.stack);
  process.exit(1);
});
