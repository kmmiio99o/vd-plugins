import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { createHash } from "crypto";
import { readFile, readdir, writeFile, stat } from "fs/promises";
import { argv } from "process";
import { rollup, watch } from "rollup";

import swc from "@swc/core";
import esbuild from "rollup-plugin-esbuild";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

const args = argv.slice(2);
console.clear();

// Parse arguments
const inputPlugins = args.filter((x) => !x.startsWith("-"));
const flags = args.map((x) => x.toLowerCase()).filter((x) => x.startsWith("-"));

const isWatch = flags.includes("--watch") || flags.includes("-w");
const isVerbose = flags.includes("--verbose") || flags.includes("-v");
const toBuild = inputPlugins.length ? inputPlugins : await readdir("./plugins");

console.log(`Found ${toBuild.length} plugin(s) to build`);

if (isWatch) {
  console.log("Running in watch mode\n");
}

// Build statistics
let built = 0;
let failed = 0;
const startTime = Date.now();

// Build all plugins
for (const plugin of toBuild) {
  if (plugin.endsWith(".ts")) continue;

  const pluginStartTime = Date.now();

  try {
    console.log(`Building ${plugin}...`);

    const result = await buildPlugin(plugin);
    const buildTime = Date.now() - pluginStartTime;

    console.log(`✓ ${plugin} (${buildTime}ms)`);
    built++;
  } catch (e) {
    console.log(`✗ ${plugin}`);
    if (isVerbose) {
      console.error(e);
    } else {
      console.error(e.message);
    }
    failed++;
  }
}

// Summary
const totalTime = Date.now() - startTime;
console.log(`\nBuild completed in ${totalTime}ms`);
console.log(`Success: ${built}, Failed: ${failed}\n`);

if (isWatch) {
  console.log("Watching for changes... (Press Ctrl+C to exit)\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD FUNCTION
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
        console.warn(`${plugin}: ${warning.message}`);
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

    const stats = await stat(outPath);
    return { size: stats.size };
  }

  const watcher = watch(options);

  return await new Promise((resolve, reject) => {
    watcher.on("event", async (event) => {
      switch (event.code) {
        case "BUNDLE_START":
          break;

        case "BUNDLE_END": {
          event.result.close();

          await applyHash();
          await writeFile(
            `./dist/${plugin}/manifest.json`,
            JSON.stringify(manifest),
          );

          console.log(`⚡ ${plugin} rebuilt (${event.duration}ms)`);
          resolve({ size: 0 });
          break;
        }
        case "ERROR":
        case "FATAL":
          console.error(`✗ ${plugin}`);
          if (isVerbose) {
            console.error(event.error);
          } else {
            console.error(event.error.message);
          }
          reject(event.error);
          break;
      }
    });
  });
}
