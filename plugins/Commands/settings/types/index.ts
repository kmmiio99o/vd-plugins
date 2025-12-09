export interface FactSettings {
  sendAsReply: boolean;
  includeCitation: boolean;
}

export interface ListSettings {
  pluginListAlwaysDetailed: boolean;
  themeListAlwaysDetailed: boolean;
}

export interface GarySettings {
  imageSource: "gary" | "catapi" | "minker" | "goober";
}

export interface EnabledCommands {
  catfact: boolean;
  dogfact: boolean;
  useless: boolean;
  petpet: boolean;
  pluginList: boolean;
  themeList: boolean;
  konoself: boolean;
  konosend: boolean;
  firstmessage: boolean;
  sysinfo: boolean;
  spotifyTrack: boolean;
  spotifyAlbum: boolean;
  spotifyArtists: boolean;
  spotifyCover: boolean;
  gary: boolean;
  ip: boolean;
  lovefemboys: boolean;
  nekoslife: boolean;
  friendInviteCreate: boolean;
  friendInviteView: boolean;
  friendInviteRevoke: boolean;
}

export interface HiddenSettings {
  enabled: boolean;
  visible: boolean;
  konochanBypassNsfw: boolean;
}

export interface StorageType {
  factSettings: FactSettings;
  listSettings: ListSettings;
  garySettings: GarySettings;
  enabledCommands: EnabledCommands;
  pendingRestart: boolean;
  hiddenSettings: HiddenSettings;
}
