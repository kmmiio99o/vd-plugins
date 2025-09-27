import { registerCommand } from "@vendetta/commands";
import { storage } from "@vendetta/plugin";
import {
  catFactCommand,
  dogFactCommand,
  uselessFactCommand,
} from "./src/commands/facts";
import { pluginListCommand, themeListCommand } from "./src/commands/lists";
import { petPetCommand } from "./src/commands/petpet";
import settings from "./settings";

// Initialize storage with default values
if (!storage.factSettings) {
  storage.factSettings = {
    sendAsReply: true,
    includeCitation: false,
  };
}

if (!storage.listSettings) {
  storage.listSettings = {
    pluginListAlwaysDetailed: false,
    themeListAlwaysDetailed: false,
  };
}

// Store registered commands for cleanup
let commands: Array<() => void> = [];

export default {
  onLoad: () => {
    console.log("[All-In-One Commands] Loading plugin...");

    // Register all commands
    commands = [
      registerCommand(catFactCommand),
      registerCommand(dogFactCommand),
      registerCommand(uselessFactCommand),
      registerCommand(petPetCommand),
      registerCommand(pluginListCommand),
      registerCommand(themeListCommand),
    ];

    console.log("[All-In-One Commands] Plugin loaded successfully!");
  },

  onUnload: () => {
    console.log("[All-In-One Commands] Unloading plugin...");
    commands.forEach((unregister) => unregister());
    commands = [];
    console.log("[All-In-One Commands] Plugin unloaded successfully!");
  },

  settings,
};
