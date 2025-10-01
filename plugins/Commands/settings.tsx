import { plugin } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { NavigationNative } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { alerts } from "@vendetta/ui";

const { ScrollView } = findByProps("ScrollView");
const { FormRow, FormSwitchRow } = Forms;

// Better Table Row Group Component
function BetterTableRowGroup({
  title,
  icon,
  children,
  padding = false,
}: React.PropsWithChildren<{
  title?: string;
  icon?: number;
  padding?: boolean;
}>) {
  const styles = stylesheet.createThemedStyleSheet({
    main: {
      backgroundColor: semanticColors.CARD_PRIMARY_BG,
      borderColor: semanticColors.BORDER_FAINT,
      borderWidth: 1,
      borderRadius: 16,
      overflow: "hidden",
      flex: 1,
    },
    titleContainer: {
      marginBottom: 8,
      marginHorizontal: 0,
      marginTop: 8,
      gap: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      width: 16,
      height: 16,
      marginTop: 1.5,
      tintColor: semanticColors.TEXT_MUTED,
    },
    titleText: {
      fontSize: 14,
      fontWeight: "600",
      color: semanticColors.TEXT_MUTED,
    },
  });

  return (
    <RN.View style={{ marginHorizontal: 16, marginTop: 16 }}>
      {title && (
        <RN.View style={styles.titleContainer}>
          {icon && (
            <RN.Image
              style={styles.icon}
              source={icon}
              resizeMode="cover"
            />
          )}
          <RN.Text style={styles.titleText}>
            {title.toUpperCase()}
          </RN.Text>
        </RN.View>
      )}
      <RN.View style={styles.main}>
        {padding ? (
          <RN.View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            {children}
          </RN.View>
        ) : children}
      </RN.View>
    </RN.View>
  );
}

// Header Component
function Header() {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flexDirection: "column",
      alignItems: "center",
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: semanticColors.TEXT_NORMAL,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: "500",
      color: semanticColors.TEXT_MUTED,
    },
    iconContainer: {
      backgroundColor: semanticColors.BACKGROUND_SECONDARY,
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
    },
    icon: {
      width: 32,
      height: 32,
      tintColor: semanticColors.TEXT_NORMAL,
    },
  });

  return (
    <RN.View style={styles.container}>
      <RN.View style={styles.iconContainer}>
        <RN.Image
          source={getAssetIDByName("SettingsIcon")}
          style={styles.icon}
        />
      </RN.View>
      <RN.Text style={styles.title}>Commands</RN.Text>
      <RN.Text style={styles.subtitle}>A collection of useful commands</RN.Text>
    </RN.View>
  );
}

// Facts Commands Settings Page
function FactsSettingsPage({ forceRerender }: { forceRerender: () => void }) {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
  });

  return (
    <RN.View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}>
        <BetterTableRowGroup title="Fact Display Settings" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="Send as Reply"
            subLabel="Send facts as a reply to the command message"
            leading={<FormRow.Icon source={getAssetIDByName("ArrowAngleLeftUpIcon")} />}
            value={storage.factSettings?.sendAsReply ?? true}
            onValueChange={(v: boolean) => {
              storage.factSettings.sendAsReply = v;
              forceRerender();
            }}
          />
          <FormSwitchRow
            label="Include Source Citation"
            subLabel="Include the source of facts when available"
            leading={<FormRow.Icon source={getAssetIDByName("LinkIcon")} />}
            value={storage.factSettings?.includeCitation ?? false}
            onValueChange={(v: boolean) => {
              storage.factSettings.includeCitation = v;
              forceRerender();
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Available Fact Commands" icon={getAssetIDByName("BookmarkIcon")}>
          <FormSwitchRow
            label="/catfact"
            subLabel="Get random cat facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
            value={storage.enabledCommands?.catfact ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.catfact = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
          <FormSwitchRow
            label="/dogfact"
            subLabel="Get random dog facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
            value={storage.enabledCommands?.dogfact ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.dogfact = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
          <FormSwitchRow
            label="/useless"
            subLabel="Get random useless facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
            value={storage.enabledCommands?.useless ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.useless = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// Gary API Settings Page
function GaryAPIPage({ forceRerender }: { forceRerender: () => void }) {
  useProxy(storage);
  
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
    infoText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      marginBottom: 16,
      textAlign: "center",
    },
    currentText: {
      fontSize: 14,
      color: semanticColors.TEXT_NORMAL,
      textAlign: "center",
      fontWeight: "600",
    },
  });

  const currentSource = storage.garySettings?.imageSource || "gary";

  const handleSourceChange = (newSource: string) => {
    console.log(`[Gary Settings] Changing from ${currentSource} to ${newSource}`);
    storage.garySettings.imageSource = newSource;
    forceRerender();
  };

  return (
    <RN.View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}>
        <BetterTableRowGroup title="Gary Command Settings" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="/gary"
            subLabel="Send random Gary images to channel"
            leading={<FormRow.Icon source={getAssetIDByName("AttachmentIcon")} />}
            value={storage.enabledCommands?.gary ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.gary = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Image Source Selection" icon={getAssetIDByName("DownloadIcon")} padding={true}>
          <RN.Text style={styles.infoText}>
            Choose which API the /gary command should use to fetch images.
          </RN.Text>
        </BetterTableRowGroup>

        <BetterTableRowGroup title="API Options" icon={getAssetIDByName("CloudIcon")}>
          <FormSwitchRow
            label="Gary API"
            subLabel="Original Gary the cat images from api.garythe.cat"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={currentSource === "gary"}
            onValueChange={(v) => v && handleSourceChange("gary")}
          />
          <FormSwitchRow
            label="Cat API"
            subLabel="Random cat pictures from thecatapi.com"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={currentSource === "catapi"}
            onValueChange={(v) => v && handleSourceChange("catapi")}
          />
          <FormSwitchRow
            label="Minker API"
            subLabel="Minky images from minky.materii.dev"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={currentSource === "minker"}
            onValueChange={(v) => v && handleSourceChange("minker")}
          />
          <FormSwitchRow
            label="Goober API"
            subLabel="Goober images from api.garythe.cat/goober"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={currentSource === "goober"}
            onValueChange={(v) => v && handleSourceChange("goober")}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Current Selection" icon={getAssetIDByName("CheckmarkIcon")} padding={true}>
          <RN.Text style={styles.currentText}>
            Currently using: {
              currentSource === "gary" ? "Gary API" :
              currentSource === "catapi" ? "Cat API" :
              currentSource === "minker" ? "Minker API" :
              currentSource === "goober" ? "Goober API" : "Gary API"
            }
          </RN.Text>
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// List Commands Settings Page
function ListSettingsPage({ forceRerender }: { forceRerender: () => void }) {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
  });

  return (
    <RN.View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}>
        <BetterTableRowGroup title="List Display Settings" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="Always Send Detailed Plugin List"
            subLabel="Always use detailed mode when listing plugins"
            leading={<FormRow.Icon source={getAssetIDByName("PuzzlePieceIcon")} />}
            value={storage.listSettings?.pluginListAlwaysDetailed ?? false}
            onValueChange={(v: boolean) => {
              storage.listSettings.pluginListAlwaysDetailed = v;
              forceRerender();
            }}
          />
          <FormSwitchRow
            label="Always Send Detailed Theme List"
            subLabel="Always use detailed mode when listing themes"
            leading={<FormRow.Icon source={getAssetIDByName("PaintPaletteIcon")} />}
            value={storage.listSettings?.themeListAlwaysDetailed ?? false}
            onValueChange={(v: boolean) => {
              storage.listSettings.themeListAlwaysDetailed = v;
              forceRerender();
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Available List Commands" icon={getAssetIDByName("ListViewIcon")}>
          <FormSwitchRow
            label="/plugin-list"
            subLabel="List all installed plugins"
            leading={<FormRow.Icon source={getAssetIDByName("PuzzlePieceIcon")} />}
            value={storage.enabledCommands?.pluginList ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.pluginList = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
          <FormSwitchRow
            label="/theme-list"
            subLabel="List all installed themes"
            leading={<FormRow.Icon source={getAssetIDByName("PaintPaletteIcon")} />}
            value={storage.enabledCommands?.themeList ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.themeList = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// Image Commands Settings Page
function ImageSettingsPage({ forceRerender }: { forceRerender: () => void }) {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
  });

  return (
    <RN.View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}>
        <BetterTableRowGroup title="Image Commands" icon={getAssetIDByName("ImageIcon")}>
          <FormSwitchRow
            label="/petpet"
            subLabel="Create pet-pet GIF of a user"
            leading={<FormRow.Icon source={getAssetIDByName("HandRequestSpeakIcon")} />}
            value={storage.enabledCommands?.petpet ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.petpet = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="KonoChan Commands" icon={getAssetIDByName("ImageIcon")}>
          <FormSwitchRow
            label="/konoself"
            subLabel="Get random image from KonoChan (private)"
            leading={<FormRow.Icon source={getAssetIDByName("EyeIcon")} />}
            value={storage.enabledCommands?.konoself ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.konoself = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
          <FormSwitchRow
            label="/konosend"
            subLabel="Send random image from KonoChan to channel"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={storage.enabledCommands?.konosend ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.konosend = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// Spotify Commands Settings Page
function SpotifySettingsPage({ forceRerender }: { forceRerender: () => void }) {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
    infoText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      textAlign: "center",
      lineHeight: 20,
    },
  });

  return (
    <RN.View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}>
        <BetterTableRowGroup title="Spotify Commands" icon={getAssetIDByName("SpotifyNeutralIcon")}>
          <FormSwitchRow
            label="/spotify track"
            subLabel="Share your current Spotify track"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands?.spotifyTrack ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.spotifyTrack = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
          <FormSwitchRow
            label="/spotify album"
            subLabel="Share your current track's album"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands?.spotifyAlbum ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.spotifyAlbum = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
          <FormSwitchRow
            label="/spotify artists"
            subLabel="Share your current track's artists"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands?.spotifyArtists ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.spotifyArtists = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
          <FormSwitchRow
            label="/spotify cover"
            subLabel="Share your current track's cover"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands?.spotifyCover ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.spotifyCover = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="About Spotify Commands" icon={getAssetIDByName("InfoIcon")} padding={true}>
          <RN.Text style={styles.infoText}>
            These commands allow you to share your current Spotify activity in Discord. Make sure you have Spotify connected to Discord for these commands to work properly.
          </RN.Text>
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// Other Commands Settings Page
function OtherSettingsPage({ forceRerender }: { forceRerender: () => void }) {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
  });

  return (
    <RN.View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}>
        <BetterTableRowGroup title="Message Commands" icon={getAssetIDByName("ChatIcon")}>
          <FormSwitchRow
            label="/firstmessage"
            subLabel="Get the first message in a channel"
            leading={<FormRow.Icon source={getAssetIDByName("ChatIcon")} />}
            value={storage.enabledCommands?.firstmessage ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.firstmessage = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="System Commands" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="/sysinfo"
            subLabel="Display system information"
            leading={<FormRow.Icon source={getAssetIDByName("SettingsIcon")} />}
            value={storage.enabledCommands?.sysinfo ?? true}
            onValueChange={(v) => {
              storage.enabledCommands.sysinfo = v;
              storage.pendingRestart = true;
              forceRerender();
            }}
          />
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// Credits Page
function CreditsPage() {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
    creditItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: semanticColors.CARD_PRIMARY_BG,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 4,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    commandText: {
      fontSize: 16,
      fontWeight: "600",
      color: semanticColors.TEXT_NORMAL,
    },
    authorText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      marginTop: 2,
    },
    infoText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      marginBottom: 16,
      textAlign: "center",
    },
    versionText: {
      fontSize: 14,
      color: semanticColors.TEXT_NORMAL,
      textAlign: "center",
      fontWeight: "600",
      lineHeight: 20,
    },
  });

  const credits = [
    { command: "Facts Commands", author: "jdev082", avatar: "https://github.com/jdev082.png" },
    { command: "List Commands", author: "Kitomanari", avatar: "https://github.com/kitomanari.png" },
    { command: "PetPet Command", author: "wolfieeee", avatar: "https://github.com/wolfieeee.png" },
    { command: "KonoChan Commands", author: "btmc727 & Rico040", avatar: "https://github.com/btmc727.png" },
    { command: "FirstMessage Command", author: "sapphire", avatar: "https://github.com/sapphiredevs.png" },
    { command: "Sysinfo Command", author: "mugman", avatar: "https://github.com/mugmandev.png" },
    { command: "Spotify Commands", author: "Kitomanari", avatar: "https://github.com/kitomanari.png" },
    { command: "Gary Command", author: "Zach Orange", avatar: "https://github.com/zachorange.png" },
  ];

  return (
    <RN.View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}>
        <BetterTableRowGroup title="Plugin Authors" icon={getAssetIDByName("HeartIcon")} padding={true}>
          <RN.Text style={styles.infoText}>
            Thanks to all the amazing developers who contributed to this plugin collection!
          </RN.Text>
        </BetterTableRowGroup>

        {credits.map((credit, index) => (
          <RN.View key={index} style={styles.creditItem}>
            <RN.Image
              source={{ uri: credit.avatar }}
              style={styles.avatar}
            />
            <RN.View style={styles.textContainer}>
              <RN.Text style={styles.commandText}>{credit.command}</RN.Text>
              <RN.Text style={styles.authorText}>by {credit.author}</RN.Text>
            </RN.View>
          </RN.View>
        ))}

        <BetterTableRowGroup title="About" icon={getAssetIDByName("InfoIcon")} padding={true}>
          <RN.Text style={styles.versionText}>
            Commands Plugin Collection{'\n'}
            Version 1.0.0{'\n'}
            Made with ❤️ for the community
          </RN.Text>
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

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
  };
}

if (!storage.pendingRestart) {
  storage.pendingRestart = false;
}

// Main Settings Component
export default function Settings() {
  useProxy(storage);
  const [rerender, forceRerender] = React.useReducer((x) => x + 1, 0);
  const navigation = NavigationNative.useNavigation();

  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
  });

  // Check for pending restart when unmounting
  React.useEffect(() => {
    return () => {
      if (storage.pendingRestart) {
        storage.pendingRestart = false;
        alerts.showConfirmationAlert({
          title: "Restart Required",
          content:
            "You have made changes to commands. Please restart Discord to apply these changes.",
          confirmText: "Okay",
          cancelText: null,
        });
      }
    };
  }, []);

  const navigateToPage = (title: string, component: React.ComponentType<any>) => {
    navigation.push("VendettaCustomPage", {
      title,
      render: () => React.createElement(component, { forceRerender }),
    });
  };

  return (
    <RN.View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 38 }}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        {/* Command Categories */}
        <BetterTableRowGroup title="Command Categories" icon={getAssetIDByName("ChannelListIcon")}>
          <FormRow
            label="Facts Commands"
            subLabel="Cat facts, dog facts, and useless facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookmarkIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() => navigateToPage("Facts Commands", FactsSettingsPage)}
          />
          <FormRow
            label="List Commands"
            subLabel="Plugin lists and theme lists"
            leading={<FormRow.Icon source={getAssetIDByName("ListViewIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() => navigateToPage("List Commands", ListSettingsPage)}
          />
          <FormRow
            label="Image Commands"
            subLabel="PetPet, KonoChan, and image utilities"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() => navigateToPage("Image Commands", ImageSettingsPage)}
          />
          <FormRow
            label="Gary Commands"
            subLabel={`Gary images - Current: ${storage.garySettings?.imageSource === "gary" ? "Gary API" : 
              storage.garySettings?.imageSource === "catapi" ? "Cat API" : 
              storage.garySettings?.imageSource === "minker" ? "Minker API" : 
              storage.garySettings?.imageSource === "goober" ? "Goober API" : "Gary API"}`}
            leading={<FormRow.Icon source={getAssetIDByName("CameraIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() => navigateToPage("Gary Commands", GaryAPIPage)}
          />
          <FormRow
            label="Spotify Commands"
            subLabel="Share your Spotify activity"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() => navigateToPage("Spotify Commands", SpotifySettingsPage)}
          />
          <FormRow
            label="Other Commands"
            subLabel="System info and miscellaneous"
            leading={<FormRow.Icon source={getAssetIDByName("MoreHorizontalIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() => navigateToPage("Other Commands", OtherSettingsPage)}
          />
        </BetterTableRowGroup>

        {/* More Options */}
        <BetterTableRowGroup title="More Options" icon={getAssetIDByName("SettingsIcon")}>
          <FormRow
            label="Credits"
            subLabel="View plugin authors and contributors"
            leading={<FormRow.Icon source={getAssetIDByName("HeartIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() => navigateToPage("Credits", CreditsPage)}
          />
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}
