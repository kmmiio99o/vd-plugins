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
import settings from "./settings";

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

export default {
  onLoad: () => {
    for (const [key, command] of Object.entries(commandMap)) {
      if (storage.enabledCommands[key]) {
        commands.push(registerCommand(command));
      }
    }
  },
  onUnload: () => {
    commands.forEach((unregister) => unregister());
    commands = [];
  },
  settings,
};
