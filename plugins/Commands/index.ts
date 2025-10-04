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
import {
    spotifyTrackCommand,
    spotifyAlbumCommand,
    spotifyArtistsCommand,
    spotifyCoverCommand
} from "./src/commands/spotify";
import { garyCommand } from "./src/commands/gary";
import { lovefemboysCommand } from "./src/commands/lovefemboys";
import { ipCommand } from "./src/commands/ip";
import { nekoslifeCommand } from "./src/commands/nekoslife";
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

if (!storage.garySettings) {
    storage.garySettings = {
        imageSource: "gary",
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
        sysinfo: true,
        spotifyTrack: true,
        spotifyAlbum: true,
        spotifyArtists: true,
        spotifyCover: true,
        gary: true,
        ip: true, // IP command - enabled by default
        lovefemboys: false, // Hidden command - disabled by default
        nekoslife: false, // Hidden command - disabled by default
    };
}

// Initialize hidden settings storage
if (!storage.hiddenSettings) {
    storage.hiddenSettings = {
        enabled: false,
        visible: false,
        konochanBypassNsfw: false, // NSFW bypass option
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
    sysinfo: sysinfoCommand,
    spotifyTrack: spotifyTrackCommand,
    spotifyAlbum: spotifyAlbumCommand,
    spotifyArtists: spotifyArtistsCommand,
    spotifyCover: spotifyCoverCommand,
    gary: garyCommand,
    ip: ipCommand, // Add IP command
    lovefemboys: lovefemboysCommand, // Add hidden command to map
    nekoslife: nekoslifeCommand, // Add NekosLife command
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
                console.log(`[All-In-One Commands] Registered command: ${key}`);
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
