import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { createHash } from "crypto";
import { readFile, readdir, writeFile, stat } from "fs/promises";
import { argv } from "process";
import { rollup, watch } from "rollup";

import swc from "@swc/core";
import esbuild from "rollup-plugin-esbuild";

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
  // Build status
  success: "✓",
  error: "✗",
  warning: "⚠",
  info: "ℹ",

  // Activities
  building: "🔨",
  watching: "👁",
  rocket: "🚀",
  gear: "⚙",
  lightning: "⚡",
  fire: "🔥",
  sparkles: "✨",

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

const spinners = {
  dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  line: ["│", "╱", "─", "╲"],
  bounce: ["⠁", "⠂", "⠄", "⠂"],
  pulse: ["●", "◐", "◑", "◒", "◓", "◔", "◕", "◖", "◗"],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🛠 UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function formatSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function createGradient(text, startColor, endColor) {
  // Simple gradient effect by alternating colors
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

class Spinner {
  constructor(text = "", spinnerType = "dots") {
    this.text = text;
    this.frames = spinners[spinnerType];
    this.current = 0;
    this.isSpinning = false;
    this.interval = null;
  }

  start() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    this.interval = setInterval(() => {
      process.stdout.write(
        `\r${colors.cyan}${this.frames[this.current]}${colors.reset} ${this.text}`,
      );
      this.current = (this.current + 1) % this.frames.length;
    }, 100);
  }

  succeed(text) {
    this.stop();
    console.log(
      `${colors.green}${symbols.success}${colors.reset} ${text || this.text}`,
    );
  }

  fail(text) {
    this.stop();
    console.log(
      `${colors.red}${symbols.error}${colors.reset} ${text || this.text}`,
    );
  }

  stop() {
    if (!this.isSpinning) return;
    this.isSpinning = false;
    clearInterval(this.interval);
    process.stdout.write("\r\x1b[K"); // Clear line
  }
}

function createProgressBar(current, total, width = 40, showPercentage = true) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;

  const filledBar = `${colors.brightCyan}${"█".repeat(filled)}${colors.reset}`;
  const emptyBar = `${colors.dim}${"░".repeat(empty)}${colors.reset}`;

  let result = `${filledBar}${emptyBar}`;

  if (showPercentage) {
    result += ` ${colors.bold}${percentage.toString().padStart(3)}%${colors.reset}`;
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 LOGGER
// ═══════════════════════════════════════════════════════════════════════════════

const logger = {
  banner() {
    const title = createGradient(
      "VENDETTA PLUGIN BUILDER",
      colors.brightCyan,
      colors.brightMagenta,
    );
    const subtitle = `${colors.dim}Professional-grade TypeScript plugin compilation${colors.reset}`;

    console.log();
    console.log(`  ${symbols.rocket} ${title}`);
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

  plugin: {
    building(name) {
      return new Spinner(
        `${colors.bold}${name}${colors.reset} ${colors.dim}Building...${colors.reset}`,
        "pulse",
      );
    },

    success(name, time, size) {
      const timeStr = `${colors.dim}${time}${colors.reset}`;
      const sizeStr = size ? `${colors.dim}${size}${colors.reset}` : "";
      console.log(
        `${colors.brightGreen}${symbols.success}${colors.reset} ${colors.bold}${name}${colors.reset} ${timeStr} ${sizeStr}`,
      );
    },

    error(name, error) {
      console.log(
        `${colors.brightRed}${symbols.error}${colors.reset} ${colors.bold}${name}${colors.reset}`,
      );
      if (error) {
        console.log(`${colors.red}${colors.dim}  ${error}${colors.reset}`);
      }
    },

    watching(name, time) {
      const timeStr = `${colors.dim}${time}${colors.reset}`;
      console.log(
        `${colors.brightCyan}${symbols.lightning}${colors.reset} ${colors.bold}${name}${colors.reset} ${colors.dim}rebuilt${colors.reset} ${timeStr}`,
      );
    },
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

  summary(stats) {
    const { built, failed, total, totalTime, watchMode } = stats;

    const rows = [
      ["Total Plugins", total.toString()],
      ["Built Successfully", `${colors.brightGreen}${built}${colors.reset}`],
      [
        "Failed",
        failed > 0
          ? `${colors.brightRed}${failed}${colors.reset}`
          : `${colors.dim}0${colors.reset}`,
      ],
      ["Total Time", formatTime(totalTime)],
      [
        "Mode",
        watchMode
          ? `${colors.brightCyan}Watch${colors.reset}`
          : `${colors.dim}Build${colors.reset}`,
      ],
    ];

    this.table(["Metric", "Value"], rows);
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

const args = argv.slice(2);
console.clear();

// Parse arguments
const inputPlugins = args.filter((x) => !x.startsWith("-"));
const flags = args.map((x) => x.toLowerCase()).filter((x) => x.startsWith("-"));

const isWatch = flags.includes("--watch") || flags.includes("-w");
const isVerbose = flags.includes("--verbose") || flags.includes("-v");
const toBuild = inputPlugins.length ? inputPlugins : await readdir("./plugins");

// Display banner
logger.banner();

// Build configuration
const config = {
  plugins: toBuild.length,
  mode: isWatch ? "Watch" : "Build",
  verbose: isVerbose,
  startTime: Date.now(),
};

logger.info(
  `${colors.dim}Found ${colors.reset}${colors.bold}${config.plugins}${colors.reset}${colors.dim} plugin(s) to ${config.mode.toLowerCase()}${colors.reset}`,
);
if (isWatch) {
  logger.info(
    `${colors.dim}Running in watch mode - changes will trigger rebuilds${colors.reset}`,
  );
}

// Build statistics
let built = 0;
let failed = 0;
const buildResults = [];
const startTime = Date.now();

// Build all plugins
logger.section("Building Plugins");

for (let i = 0; i < toBuild.length; i++) {
  const plugin = toBuild[i];

  if (!isWatch) {
    console.log(
      `\n  ${createProgressBar(i, toBuild.length)} ${colors.dim}(${i}/${toBuild.length})${colors.reset}`,
    );
  }

  const pluginStartTime = Date.now();
  let spinner;

  try {
    if (!plugin.endsWith(".ts")) {
      spinner = logger.plugin.building(plugin);
      spinner.start();

      const result = await buildPlugin(plugin);
      const buildTime = Date.now() - pluginStartTime;

      spinner.stop();
      logger.plugin.success(
        plugin,
        formatTime(buildTime),
        result.size ? formatSize(result.size) : "",
      );

      buildResults.push({
        name: plugin,
        status: "success",
        time: buildTime,
        size: result.size || 0,
      });

      built++;
    }
  } catch (e) {
    if (spinner) spinner.stop();

    logger.plugin.error(plugin, isVerbose ? e.stack : e.message);

    buildResults.push({
      name: plugin,
      status: "error",
      time: Date.now() - pluginStartTime,
      error: e.message,
    });

    failed++;
  }
}

// Final progress
if (!isWatch) {
  console.log(
    `\n  ${createProgressBar(toBuild.length, toBuild.length)} ${colors.dim}(${toBuild.length}/${toBuild.length})${colors.reset}`,
  );
}

// Summary
logger.section("Build Summary");

const totalTime = Date.now() - startTime;
logger.summary({
  built,
  failed,
  total: toBuild.length,
  totalTime,
  watchMode: isWatch,
});

// Results table
if (buildResults.length > 0 && !isWatch) {
  console.log();
  const tableRows = buildResults.map((result) => [
    result.name,
    result.status === "success"
      ? `${colors.brightGreen}${symbols.success} Success${colors.reset}`
      : `${colors.brightRed}${symbols.error} Failed${colors.reset}`,
    formatTime(result.time),
    result.size ? formatSize(result.size) : `${colors.dim}N/A${colors.reset}`,
  ]);

  logger.table(["Plugin", "Status", "Time", "Size"], tableRows);
}

// Final status
console.log();
if (failed > 0) {
  logger.error(
    `Build completed with ${failed} error(s) ${symbols.bullet} ${built} succeeded`,
    symbols.warning,
  );
} else {
  logger.success(
    `All plugins built successfully! ${symbols.sparkles}`,
    symbols.fire,
  );
}

// Watch mode notification
if (isWatch) {
  console.log();
  logger.info(
    `Watching for changes... ${colors.dim}Press ${colors.reset}${colors.bold}Ctrl+C${colors.reset}${colors.dim} to exit${colors.reset}`,
    symbols.watching,
  );
}

console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 BUILD FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function buildPlugin(plugin) {
  if (plugin.endsWith(".ts")) return {};

  const manifest = Object.assign(
    JSON.parse(await readFile("./base_manifest.json")),
    JSON.parse(await readFile(`./plugins/${plugin}/manifest.json`)),
  );

  const entry = "index.js";
  const outPath = `./dist/${plugin}/${entry}`;

  /** @type {import("rollup").RollupOptions} */
  const options = {
    input: `./plugins/${plugin}/${manifest.main}`,
    output: {
      file: outPath,
      globals(id) {
        if (id.startsWith("@vendetta"))
          return id.substring(1).replace(/\//g, ".");

        const map = {
          react: "window.React",
          "react-native": "vendetta.metro.common.ReactNative",
        };

        return map[id] || null;
      },
      format: "iife",
      compact: true,
      exports: "named",
      inlineDynamicImports: true,
    },
    onwarn: (warning) => {
      if (
        ![
          "UNRESOLVED_IMPORT",
          "MISSING_NAME_OPTION_FOR_IIFE_EXPORT",
          "CIRCULAR_DEPENDENCY",
        ].includes(warning.code) &&
        isVerbose
      ) {
        logger.warning(`${plugin}: ${warning.message}`);
      }
    },
    plugins: [
      nodeResolve({
        resolveOnly: (id) => !["react", "react-native"].includes(id),
      }),
      commonjs(),
      {
        name: "swc",
        transform(code, id) {
          return swc.transform(code, {
            filename: id,
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
              },
              externalHelpers: true,
            },
            env: {
              targets: "defaults",
              include: ["transform-classes", "transform-arrow-functions"],
            },
          });
        },
      },
      esbuild({ minify: true }),
    ],
  };

  const applyHash = async () => {
    const content = await readFile(outPath);
    return Object.assign(manifest, {
      hash: createHash("sha256").update(content).digest("hex"),
      main: entry,
    });
  };

  if (!isWatch) {
    const bundle = await rollup(options);
    await bundle.write(options.output);
    await bundle.close();

    await applyHash();
    await writeFile(`./dist/${plugin}/manifest.json`, JSON.stringify(manifest));

    // Get file size
    const stats = await stat(outPath);
    return { size: stats.size };
  }

  const watcher = watch(options);

  return await new Promise((resolve, reject) => {
    watcher.on("event", async (event) => {
      switch (event.code) {
        case "BUNDLE_START":
          // Silent in watch mode, spinner handles this
          break;

        case "BUNDLE_END": {
          event.result.close();

          await applyHash();
          await writeFile(
            `./dist/${plugin}/manifest.json`,
            JSON.stringify(manifest),
          );

          const buildTime = formatTime(event.duration || 0);
          logger.plugin.watching(plugin, buildTime);
          resolve({ size: 0 });
          break;
        }
        case "ERROR":
        case "FATAL":
          logger.plugin.error(
            plugin,
            isVerbose ? event.error.stack : event.error.message,
          );
          reject(event.error);
          break;
      }
    });
  });
}
