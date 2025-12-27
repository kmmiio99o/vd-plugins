import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { createHash } from "crypto";
import { readFile, readdir, writeFile } from "fs/promises";
import { argv } from "process";
import { rollup, watch } from "rollup";
import swc from "@swc/core";
import esbuild from "rollup-plugin-esbuild";

const args = argv.slice(2);
const isWatch = args.includes("--watch") || args.includes("-w");
const pluginsToBuild = args.filter((x) => !x.startsWith("-")).length
  ? args.filter((x) => !x.startsWith("-"))
  : await readdir("./plugins");

const successfulPlugins = [];

async function buildPlugin(plugin) {
  if (plugin.endsWith(".ts")) return;

  try {
    const manifest = Object.assign(
      JSON.parse(await readFile("./base_manifest.json")),
      JSON.parse(await readFile(`./plugins/${plugin}/manifest.json`)),
    );

    const entry = "index.js";
    const outPath = `./dist/${plugin}/${entry}`;

    const options = {
      input: `./plugins/${plugin}/${manifest.main}`,
      external: (id) =>
        id.startsWith("@vendetta") || ["react", "react-native"].includes(id),
      output: {
        file: outPath,
        format: "iife",
        compact: true,
        exports: "named",
        name: "plugin",
        globals: (id) => {
          if (id.startsWith("@vendetta"))
            return id.substring(1).replace(/\//g, ".");
          if (id === "react") return "window.React";
          if (id === "react-native") return "vendetta.metro.common.ReactNative";
          return null;
        },
      },
      onwarn: () => {},
      plugins: [
        nodeResolve(),
        commonjs(),
        {
          name: "swc",
          transform: (code, id) =>
            swc.transform(code, {
              filename: id,
              jsc: {
                parser: { syntax: "typescript", tsx: true },
                externalHelpers: true,
              },
              env: { targets: "defaults" },
            }),
        },
        esbuild({ minify: true }),
      ],
    };

    const finalize = async () => {
      const content = await readFile(outPath);
      manifest.hash = createHash("sha256").update(content).digest("hex");
      manifest.main = entry;
      await writeFile(
        `./dist/${plugin}/manifest.json`,
        JSON.stringify(manifest),
      );
    };

    if (isWatch) {
      const watcher = watch(options);
      watcher.on("event", async (event) => {
        if (event.code === "BUNDLE_END") {
          await finalize();
          event.result.close();
          console.log(`[WATCH] Rebuilt ${plugin}`);
        } else if (event.code === "ERROR") {
          console.error(`[ERROR] ${plugin}: ${event.error.message}`);
        }
      });
    } else {
      const bundle = await rollup(options);
      await bundle.write(options.output);
      await bundle.close();
      await finalize();
      successfulPlugins.push(plugin);
    }
  } catch (e) {
    console.error(`[ERROR] ${plugin}: ${e.message}`);
  }
}

// Start processing
const buildPromises = pluginsToBuild.map((p) => buildPlugin(p));

if (!isWatch) {
  await Promise.all(buildPromises);
  if (successfulPlugins.length > 0) {
    console.log(`Successfully built: ${successfulPlugins.join(", ")}`);
  }
}
