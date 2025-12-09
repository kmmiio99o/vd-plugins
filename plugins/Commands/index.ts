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
  spotifyCoverCommand,
} from "./src/commands/spotify";
import { garyCommand } from "./src/commands/gary";
import { lovefemboysCommand } from "./src/commands/lovefemboys";
import { ipCommand } from "./src/commands/ip";
import { nekoslifeCommand } from "./src/commands/nekoslife";
import {
  friendInviteCreateCommand,
  friendInviteViewCommand,
  friendInviteRevokeCommand,
} from "./src/commands/friendinvites";
import settings from "./settings/settings";
import patchSidebar from "./sidebar";

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
    ip: true,
    lovefemboys: false,
    nekoslife: false,
    friendInviteCreate: true,
    friendInviteView: true,
    friendInviteRevoke: true,
  };
}
if (!storage.hiddenSettings) {
  storage.hiddenSettings = {
    enabled: false,
    visible: false,
    konochanBypassNsfw: false,
  };
}
// sidebar enabled setting
if (storage.sidebarEnabled === undefined) {
  storage.sidebarEnabled = true;
}

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
  ip: ipCommand,
  lovefemboys: lovefemboysCommand,
  nekoslife: nekoslifeCommand,
  friendInviteCreate: friendInviteCreateCommand,
  friendInviteView: friendInviteViewCommand,
  friendInviteRevoke: friendInviteRevokeCommand,
};

let commands: Array<() => void> = [];
let sidebarUnpatch: (() => void) | undefined;

export default {
  onLoad: () => {
    console.log("[Commands Plugin] Loading...");

    // Patch sidebar if enabled
    if (storage.sidebarEnabled !== false) {
      try {
        sidebarUnpatch = patchSidebar();
        console.log("[Commands Plugin] Sidebar patched successfully");
      } catch (error) {
        console.error("[Commands Plugin] Failed to patch sidebar:", error);
      }
    }

    // Register commands
    for (const [key, command] of Object.entries(commandMap)) {
      if (storage.enabledCommands[key]) {
        try {
          commands.push(registerCommand(command));
          console.log(`[Commands Plugin] Registered command: ${key}`);
        } catch (error) {
          console.error(
            `[Commands Plugin] Failed to register command ${key}:`,
            error,
          );
        }
      }
    }
  },
  onUnload: () => {
    console.log("[Commands Plugin] Unloading...");

    // Unregister commands
    commands.forEach((unregister) => {
      try {
        unregister();
      } catch (error) {
        // Ignore errors during cleanup
      }
    });
    commands = [];

    // Unpatch sidebar
    if (sidebarUnpatch) {
      try {
        sidebarUnpatch();
        sidebarUnpatch = undefined;
        console.log("[Commands Plugin] Sidebar unpatched");
      } catch (error) {
        console.error("[Commands Plugin] Failed to unpatch sidebar:", error);
      }
    }
  },
  settings,
};
