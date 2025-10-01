import { plugin } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { alerts } from "@vendetta/ui";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableSwitchRow, Stack, TableRow } = findByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "Stack",
  "TableRow",
);

const { FormRow, FormSwitchRow } = Forms;

// Better Table Row Group Component (inspired by nexpid's styling)
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

export default function Settings() {
  useProxy(storage);
  const [rerender, forceRerender] = React.useReducer((x) => x + 1, 0);

  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
    spacing: {
      height: 16,
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

  const handleCommandToggle = (commandName: string, value: boolean) => {
    storage.enabledCommands[commandName] = value;
    storage.pendingRestart = true;
    forceRerender();
  };

  const showGarySourceSelection = () => {
    alerts.showConfirmationAlert({
      title: "Choose Gary Image Source",
      content: "Select an image source for the Gary command:",
      confirmText: "Gary API",
      cancelText: "Other Options",
      confirmColor: "brand",
      onConfirm: () => {
        storage.garySettings.imageSource = "gary";
        forceRerender();
      },
      onCancel: () => {
        alerts.showConfirmationAlert({
          title: "Choose Image Source",
          content: "Select from remaining options:",
          confirmText: "Cat API",
          cancelText: "More Options",
          confirmColor: "brand",
          onConfirm: () => {
            storage.garySettings.imageSource = "catapi";
            forceRerender();
          },
          onCancel: () => {
            alerts.showConfirmationAlert({
              title: "Choose Image Source",
              content: "Select from final options:",
              confirmText: "Minker API",
              cancelText: "Goober API",
              confirmColor: "brand",
              onConfirm: () => {
                storage.garySettings.imageSource = "minker";
                forceRerender();
              },
              onCancel: () => {
                storage.garySettings.imageSource = "goober";
                forceRerender();
              },
            });
          },
        });
      },
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
        
        {/* Facts Commands */}
        <BetterTableRowGroup 
          title="Facts Commands" 
          icon={getAssetIDByName("BookIcon")}
        >
          <FormSwitchRow
            label="Send as Reply"
            subLabel="Send facts as a reply to the command message"
            leading={<FormRow.Icon source={getAssetIDByName("ReplyIcon")} />}
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
          <FormSwitchRow
            label="/catfact"
            subLabel="Get random cat facts"
            leading={<FormRow.Icon source={getAssetIDByName("ic_cat")} />}
            value={storage.enabledCommands?.catfact ?? true}
            onValueChange={(v) => handleCommandToggle("catfact", v)}
          />
          <FormSwitchRow
            label="/dogfact"
            subLabel="Get random dog facts"
            leading={<FormRow.Icon source={getAssetIDByName("ic_dog")} />}
            value={storage.enabledCommands?.dogfact ?? true}
            onValueChange={(v) => handleCommandToggle("dogfact", v)}
          />
          <FormSwitchRow
            label="/useless"
            subLabel="Get random useless facts"
            leading={<FormRow.Icon source={getAssetIDByName("QuestionMarkIcon")} />}
            value={storage.enabledCommands?.useless ?? true}
            onValueChange={(v) => handleCommandToggle("useless", v)}
          />
        </BetterTableRowGroup>

        {/* List Commands */}
        <BetterTableRowGroup 
          title="List Commands" 
          icon={getAssetIDByName("ListIcon")}
        >
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
          <FormSwitchRow
            label="/plugin-list"
            subLabel="List all installed plugins"
            leading={<FormRow.Icon source={getAssetIDByName("PuzzlePieceIcon")} />}
            value={storage.enabledCommands?.pluginList ?? true}
            onValueChange={(v) => handleCommandToggle("pluginList", v)}
          />
          <FormSwitchRow
            label="/theme-list"
            subLabel="List all installed themes"
            leading={<FormRow.Icon source={getAssetIDByName("PaintPaletteIcon")} />}
            value={storage.enabledCommands?.themeList ?? true}
            onValueChange={(v) => handleCommandToggle("themeList", v)}
          />
        </BetterTableRowGroup>

        {/* Image Commands */}
        <BetterTableRowGroup 
          title="Image Commands" 
          icon={getAssetIDByName("ImageIcon")}
        >
          <FormSwitchRow
            label="/petpet"
            subLabel="Create pet-pet GIF of a user"
            leading={<FormRow.Icon source={getAssetIDByName("HandIcon")} />}
            value={storage.enabledCommands?.petpet ?? true}
            onValueChange={(v) => handleCommandToggle("petpet", v)}
          />
        </BetterTableRowGroup>

        {/* Gary Commands */}
        <BetterTableRowGroup 
          title="Gary Commands" 
          icon={getAssetIDByName("ic_cat")}
        >
          <FormSwitchRow
            label="/gary"
            subLabel="Send random Gary images to channel"
            leading={<FormRow.Icon source={getAssetIDByName("ic_cat")} />}
            value={storage.enabledCommands?.gary ?? true}
            onValueChange={(v) => handleCommandToggle("gary", v)}
          />
          <FormRow
            label="Gary Image Source"
            subLabel={`Current: ${storage.garySettings?.imageSource === "gary" ? "Gary API" : 
              storage.garySettings?.imageSource === "catapi" ? "Cat API" : 
              storage.garySettings?.imageSource === "minker" ? "Minker API" : 
              storage.garySettings?.imageSource === "goober" ? "Goober API" : "Gary API"}`}
            leading={<FormRow.Icon source={getAssetIDByName("DownloadIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={showGarySourceSelection}
          />
        </BetterTableRowGroup>

        {/* KonoChan Commands */}
        <BetterTableRowGroup 
          title="KonoChan Commands" 
          icon={getAssetIDByName("ImageIcon")}
        >
          <FormSwitchRow
            label="/konoself"
            subLabel="Get random image from KonoChan (private)"
            leading={<FormRow.Icon source={getAssetIDByName("EyeIcon")} />}
            value={storage.enabledCommands?.konoself ?? true}
            onValueChange={(v) => handleCommandToggle("konoself", v)}
          />
          <FormSwitchRow
            label="/konosend"
            subLabel="Send random image from KonoChan to channel"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={storage.enabledCommands?.konosend ?? true}
            onValueChange={(v) => handleCommandToggle("konosend", v)}
          />
        </BetterTableRowGroup>

        {/* Message Commands */}
        <BetterTableRowGroup 
          title="Message Commands" 
          icon={getAssetIDByName("ChatIcon")}
        >
          <FormSwitchRow
            label="/firstmessage"
            subLabel="Get the first message in a channel"
            leading={<FormRow.Icon source={getAssetIDByName("ChatIcon")} />}
            value={storage.enabledCommands?.firstmessage ?? true}
            onValueChange={(v) => handleCommandToggle("firstmessage", v)}
          />
        </BetterTableRowGroup>

        {/* System Commands */}
        <BetterTableRowGroup 
          title="System Commands" 
          icon={getAssetIDByName("SettingsIcon")}
        >
          <FormSwitchRow
            label="/sysinfo"
            subLabel="Display system information"
            leading={<FormRow.Icon source={getAssetIDByName("SettingsIcon")} />}
            value={storage.enabledCommands?.sysinfo ?? true}
            onValueChange={(v) => handleCommandToggle("sysinfo", v)}
          />
        </BetterTableRowGroup>

        {/* Spotify Commands */}
        <BetterTableRowGroup 
          title="Spotify Commands" 
          icon={getAssetIDByName("SpotifyIcon")}
        >
          <FormSwitchRow
            label="/spotify track"
            subLabel="Share your current Spotify track"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyIcon")} />}
            value={storage.enabledCommands?.spotifyTrack ?? true}
            onValueChange={(v) => handleCommandToggle("spotifyTrack", v)}
          />
          <FormSwitchRow
            label="/spotify album"
            subLabel="Share your current track's album"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyIcon")} />}
            value={storage.enabledCommands?.spotifyAlbum ?? true}
            onValueChange={(v) => handleCommandToggle("spotifyAlbum", v)}
          />
          <FormSwitchRow
            label="/spotify artists"
            subLabel="Share your current track's artists"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyIcon")} />}
            value={storage.enabledCommands?.spotifyArtists ?? true}
            onValueChange={(v) => handleCommandToggle("spotifyArtists", v)}
          />
          <FormSwitchRow
            label="/spotify cover"
            subLabel="Share your current track's cover"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyIcon")} />}
            value={storage.enabledCommands?.spotifyCover ?? true}
            onValueChange={(v) => handleCommandToggle("spotifyCover", v)}
          />
        </BetterTableRowGroup>

        {/* Credits */}
        <BetterTableRowGroup 
          title="Credits" 
          icon={getAssetIDByName("PeopleIcon")}
          padding={true}
        >
          <RN.Text style={{ 
            fontSize: 14, 
            color: semanticColors.TEXT_MUTED,
            lineHeight: 20 
          }}>
            Facts Commands by jdev082{'\n'}
            List Commands by Kitomanari{'\n'}
            PetPet Command by wolfieeee{'\n'}
            KonoChan Commands by btmc727 & Rico040{'\n'}
            FirstMessage Command by sapphire{'\n'}
            Sysinfo Command by mugman{'\n'}
            Spotify Commands by Kitomanari{'\n'}
            Gary Command by Zach Orange
          </RN.Text>
        </BetterTableRowGroup>

        <RN.View style={styles.spacing} />
      </ScrollView>
    </RN.View>
  );
}
