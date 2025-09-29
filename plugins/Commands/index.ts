import { registerCommand } from "@vendetta/commands";
import { storage } from "@vendetta/plugin";
import {
  catFactCommand,
  dogFactCommand,
  uselessFactCommand,
} from "./src/commands/facts";
import { pluginListCommand, themeListCommand } from "./src/commands/lists";
import { petPetCommand } from "./src/commands/petpet";
import { konoSelfCommand, konoSendCommand } from "./src/commands/konochan";
import { firstMessageCommand } from "./src/commands/firstmessage";
import { sysinfoCommand } from "./src/commands/sysinfo"; 
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

if (!storage.enabledCommands) {
  storage.enabledCommands = {
    catfact: true,
    dogfact: true,
    useless: true,
    petpet: true,
    pluginList: true,
    themeList: true,
    konoself: true,
    konosend: true,
    firstmessage: true,
    sysinfo: true, // Add sysinfo to enabled commands
  };
}

// Map commands to their storage keys
const commandMap = {
  catfact: catFactCommand,
  dogfact: dogFactCommand,
  useless: uselessFactCommand,
  petpet: petPetCommand,
  pluginList: pluginListCommand,
  themeList: themeListCommand,
  konoself: konoSelfCommand,
  konosend: konoSendCommand,
  firstmessage: firstMessageCommand,
  sysinfo: sysinfoCommand, // Add sysinfo to command map
};

// Store registered commands for cleanup
let commands: Array<() => void> = [];

export default {
  onLoad: () => {
    console.log("[All-In-One Commands] Loading plugin...");

    // Register only enabled commands
    for (const [key, command] of Object.entries(commandMap)) {
      if (storage.enabledCommands[key]) {
        commands.push(registerCommand(command));
      }
    }

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
