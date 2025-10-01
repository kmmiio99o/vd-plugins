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

// Gary API Selection Component
function GaryAPISelection({ forceRerender }: { forceRerender: () => void }) {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      backgroundColor: semanticColors.BACKGROUND_SECONDARY,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: semanticColors.TEXT_NORMAL,
      marginBottom: 12,
    },
    optionContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      marginVertical: 2,
    },
    selectedOption: {
      backgroundColor: semanticColors.BACKGROUND_MODIFIER_SELECTED,
    },
    optionText: {
      fontSize: 16,
      fontWeight: "500",
      marginLeft: 12,
      flex: 1,
    },
    selectedText: {
      color: semanticColors.TEXT_BRAND,
    },
    normalText: {
      color: semanticColors.TEXT_NORMAL,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: semanticColors.TEXT_MUTED,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedRadio: {
      borderColor: semanticColors.TEXT_BRAND,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: semanticColors.TEXT_BRAND,
    },
  });

  const options = [
    { value: "gary", label: "Gary API", desc: "Original Gary cat images" },
    { value: "catapi", label: "Cat API", desc: "Random cat pictures" },
    { value: "minker", label: "Minker API", desc: "Minky images" },
    { value: "goober", label: "Goober API", desc: "Goober images" },
  ];

  const currentSource = storage.garySettings?.imageSource || "gary";

  return (
    <RN.View style={styles.container}>
      <RN.Text style={styles.title}>Gary Image Source</RN.Text>
      {options.map((option) => {
        const isSelected = currentSource === option.value;
        return (
          <RN.Pressable
            key={option.value}
            style={[
              styles.optionContainer,
              isSelected && styles.selectedOption,
            ]}
            onPress={() => {
              storage.garySettings.imageSource = option.value;
              forceRerender();
            }}
          >
            <RN.View style={[
              styles.radioButton,
              isSelected && styles.selectedRadio,
            ]}>
              {isSelected && <RN.View style={styles.radioInner} />}
            </RN.View>
            <RN.View style={{ flex: 1, marginLeft: 12 }}>
              <RN.Text style={[
                styles.optionText,
                isSelected ? styles.selectedText : styles.normalText,
              ]}>
                {option.label}
              </RN.Text>
              <RN.Text style={{
                fontSize: 14,
                color: semanticColors.TEXT_MUTED,
                marginTop: 2,
              }}>
                {option.desc}
              </RN.Text>
            </RN.View>
          </RN.Pressable>
        );
      })}
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

  return (
    <RN.View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 38 }}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        
        <Stack spacing={8}>
          {/* Facts Commands */}
          <TableRowGroup title="Facts Commands">
            <TableSwitchRow
              label="Send as Reply"
              subLabel="Send facts as a reply to the command message"
              value={storage.factSettings?.sendAsReply ?? true}
              onValueChange={(v: boolean) => {
                storage.factSettings.sendAsReply = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="Include Source Citation"
              subLabel="Include the source of facts when available"
              value={storage.factSettings?.includeCitation ?? false}
              onValueChange={(v: boolean) => {
                storage.factSettings.includeCitation = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="/catfact"
              subLabel="Get random cat facts"
              value={storage.enabledCommands?.catfact ?? true}
              onValueChange={(v) => handleCommandToggle("catfact", v)}
            />
            <TableSwitchRow
              label="/dogfact"
              subLabel="Get random dog facts"
              value={storage.enabledCommands?.dogfact ?? true}
              onValueChange={(v) => handleCommandToggle("dogfact", v)}
            />
            <TableSwitchRow
              label="/useless"
              subLabel="Get random useless facts"
              value={storage.enabledCommands?.useless ?? true}
              onValueChange={(v) => handleCommandToggle("useless", v)}
            />
          </TableRowGroup>

          {/* List Commands */}
          <TableRowGroup title="List Commands">
            <TableSwitchRow
              label="Always Send Detailed Plugin List"
              subLabel="Always use detailed mode when listing plugins"
              value={storage.listSettings?.pluginListAlwaysDetailed ?? false}
              onValueChange={(v: boolean) => {
                storage.listSettings.pluginListAlwaysDetailed = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="Always Send Detailed Theme List"
              subLabel="Always use detailed mode when listing themes"
              value={storage.listSettings?.themeListAlwaysDetailed ?? false}
              onValueChange={(v: boolean) => {
                storage.listSettings.themeListAlwaysDetailed = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="/plugin-list"
              subLabel="List all installed plugins"
              value={storage.enabledCommands?.pluginList ?? true}
              onValueChange={(v) => handleCommandToggle("pluginList", v)}
            />
            <TableSwitchRow
              label="/theme-list"
              subLabel="List all installed themes"
              value={storage.enabledCommands?.themeList ?? true}
              onValueChange={(v) => handleCommandToggle("themeList", v)}
            />
          </TableRowGroup>

          {/* Image Commands */}
          <TableRowGroup title="Petpet Commands">
            <TableSwitchRow
              label="/petpet"
              subLabel="Create pet-pet GIF of a user"
              value={storage.enabledCommands?.petpet ?? true}
              onValueChange={(v) => handleCommandToggle("petpet", v)}
            />
          </TableRowGroup>

          {/* KonoChan Commands */}
          <TableRowGroup title="KonoChan Commands">
            <TableSwitchRow
              label="/konoself"
              subLabel="Get random image from KonoChan (private)"
              value={storage.enabledCommands?.konoself ?? true}
              onValueChange={(v) => handleCommandToggle("konoself", v)}
            />
            <TableSwitchRow
              label="/konosend"
              subLabel="Send random image from KonoChan to channel"
              value={storage.enabledCommands?.konosend ?? true}
              onValueChange={(v) => handleCommandToggle("konosend", v)}
            />
          </TableRowGroup>

          {/* Message Commands */}
          <TableRowGroup title="Message Commands">
            <TableSwitchRow
              label="/firstmessage"
              subLabel="Get the first message in a channel"
              value={storage.enabledCommands?.firstmessage ?? true}
              onValueChange={(v) => handleCommandToggle("firstmessage", v)}
            />
          </TableRowGroup>

          {/* System Commands */}
          <TableRowGroup title="System Commands">
            <TableSwitchRow
              label="/sysinfo"
              subLabel="Display system information"
              value={storage.enabledCommands?.sysinfo ?? true}
              onValueChange={(v) => handleCommandToggle("sysinfo", v)}
            />
          </TableRowGroup>

          {/* Spotify Commands */}
          <TableRowGroup title="Spotify Commands">
            <TableSwitchRow
              label="/spotify track"
              subLabel="Share your current Spotify track"
              value={storage.enabledCommands?.spotifyTrack ?? true}
              onValueChange={(v) => handleCommandToggle("spotifyTrack", v)}
            />
            <TableSwitchRow
              label="/spotify album"
              subLabel="Share your current track's album"
              value={storage.enabledCommands?.spotifyAlbum ?? true}
              onValueChange={(v) => handleCommandToggle("spotifyAlbum", v)}
            />
            <TableSwitchRow
              label="/spotify artists"
              subLabel="Share your current track's artists"
              value={storage.enabledCommands?.spotifyArtists ?? true}
              onValueChange={(v) => handleCommandToggle("spotifyArtists", v)}
            />
            <TableSwitchRow
              label="/spotify cover"
              subLabel="Share your current track's cover"
              value={storage.enabledCommands?.spotifyCover ?? true}
              onValueChange={(v) => handleCommandToggle("spotifyCover", v)}
            />
          </TableRowGroup>

          {/* Gary Commands */}
          <TableRowGroup title="Gary Commands">
            <TableSwitchRow
              label="/gary"
              subLabel="Send random Gary images to channel"
              value={storage.enabledCommands?.gary ?? true}
              onValueChange={(v) => handleCommandToggle("gary", v)}
            />
          </TableRowGroup>
        </Stack>

        {/* Custom Gary API Selection */}
        <GaryAPISelection forceRerender={forceRerender} />

        <RN.View style={styles.spacing} />

        <Stack spacing={8}>
          {/* Credits */}
          <TableRowGroup title="Credits">
            <TableRow label="Facts Commands" subLabel="by jdev082" />
            <TableRow label="List Commands" subLabel="by Kitomanari" />
            <TableRow label="PetPet Command" subLabel="by wolfieeee" />
            <TableRow
              label="KonoChan Commands"
              subLabel="by btmc727 & Rico040"
            />
            <TableRow label="FirstMessage Command" subLabel="by sapphire" />
            <TableRow label="Sysinfo Command" subLabel="by mugman" />
            <TableRow label="Spotify Commands" subLabel="by Kitomanari" />
            <TableRow label="Gary Command" subLabel="by Zach Orange" />
          </TableRowGroup>

          {/* About */}
          <TableRowGroup title="About">
            <TableRow
              label="Commands"
              subLabel="A collection of commands"
            />
          </TableRowGroup>
        </Stack>

        <RN.View style={styles.spacing} />
      </ScrollView>
    </RN.View>
  );
}
