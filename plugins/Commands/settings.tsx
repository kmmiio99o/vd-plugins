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

// Credits Page Component
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}
        showsVerticalScrollIndicator={false}
      >
        <BetterTableRowGroup 
          title="Plugin Authors" 
          icon={getAssetIDByName("PeopleIcon")}
          padding={true}
        >
          <RN.Text style={{
            fontSize: 14,
            color: semanticColors.TEXT_MUTED,
            marginBottom: 16,
            textAlign: "center",
          }}>
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

        <BetterTableRowGroup 
          title="About" 
          icon={getAssetIDByName("InfoIcon")}
          padding={true}
        >
          <RN.Text style={{
            fontSize: 14,
            color: semanticColors.TEXT_MUTED,
            textAlign: "center",
            lineHeight: 20,
          }}>
            Commands Plugin Collection{'\n'}
            Version 1.0.0{'\n'}
            Made with ❤️ for the community
          </RN.Text>
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// Gary API Settings Page Component
function GaryAPIPage({ forceRerender }: { forceRerender: () => void }) {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
    optionContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: semanticColors.CARD_PRIMARY_BG,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 4,
    },
    selectedOption: {
      backgroundColor: semanticColors.BRAND_500_ALPHA,
      borderColor: semanticColors.BRAND_500,
      borderWidth: 2,
    },
    normalOption: {
      borderColor: semanticColors.BORDER_FAINT,
      borderWidth: 1,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: semanticColors.TEXT_MUTED,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    selectedRadio: {
      borderColor: semanticColors.BRAND_500,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: semanticColors.BRAND_500,
    },
    textContainer: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: semanticColors.TEXT_NORMAL,
    },
    optionDesc: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      marginTop: 2,
    },
    selectedText: {
      color: semanticColors.BRAND_500,
    },
  });

  const options = [
    { 
      value: "gary", 
      title: "Gary API", 
      desc: "Original Gary the cat images from api.garythe.cat",
      icon: getAssetIDByName("ic_cat")
    },
    { 
      value: "catapi", 
      title: "Cat API", 
      desc: "Random cat pictures from thecatapi.com",
      icon: getAssetIDByName("ic_cat")
    },
    { 
      value: "minker", 
      title: "Minker API", 
      desc: "Minky images from minky.materii.dev",
      icon: getAssetIDByName("ImageIcon")
    },
    { 
      value: "goober", 
      title: "Goober API", 
      desc: "Goober images from api.garythe.cat/goober",
      icon: getAssetIDByName("ImageIcon")
    },
  ];

  const currentSource = storage.garySettings?.imageSource || "gary";

  return (
    <RN.View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}
        showsVerticalScrollIndicator={false}
      >
        <BetterTableRowGroup 
          title="Image Source Selection" 
          icon={getAssetIDByName("DownloadIcon")}
          padding={true}
        >
          <RN.Text style={{
            fontSize: 14,
            color: semanticColors.TEXT_MUTED,
            marginBottom: 16,
            textAlign: "center",
          }}>
            Choose which API the /gary command should use to fetch images.
          </RN.Text>
        </BetterTableRowGroup>

        {options.map((option) => {
          const isSelected = currentSource === option.value;
          return (
            <RN.Pressable
              key={option.value}
              style={[
                styles.optionContainer,
                isSelected ? styles.selectedOption : styles.normalOption,
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
              <RN.Image
                source={option.icon}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: isSelected ? semanticColors.BRAND_500 : semanticColors.TEXT_MUTED,
                  marginRight: 12,
                }}
              />
              <RN.View style={styles.textContainer}>
                <RN.Text style={[
                  styles.optionTitle,
                  isSelected && styles.selectedText,
                ]}>
                  {option.title}
                </RN.Text>
                <RN.Text style={styles.optionDesc}>
                  {option.desc}
                </RN.Text>
              </RN.View>
            </RN.Pressable>
          );
        })}

        <BetterTableRowGroup 
          title="Current Selection" 
          icon={getAssetIDByName("CheckmarkIcon")}
          padding={true}
        >
          <RN.Text style={{
            fontSize: 14,
            color: semanticColors.TEXT_NORMAL,
            textAlign: "center",
            fontWeight: "600",
          }}>
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

  const navigateToCredits = () => {
    navigation.push("VendettaCustomPage", {
      title: "Credits",
      render: () => <CreditsPage />,
    });
  };

  const navigateToGaryAPI = () => {
    navigation.push("VendettaCustomPage", {
      title: "Gary API Settings",
      render: () => <GaryAPIPage forceRerender={forceRerender} />,
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
            label="Gary API Settings"
            subLabel={`Current: ${storage.garySettings?.imageSource === "gary" ? "Gary API" : 
              storage.garySettings?.imageSource === "catapi" ? "Cat API" : 
              storage.garySettings?.imageSource === "minker" ? "Minker API" : 
              storage.garySettings?.imageSource === "goober" ? "Goober API" : "Gary API"}`}
            leading={<FormRow.Icon source={getAssetIDByName("DownloadIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={navigateToGaryAPI}
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

        {/* Navigation Pages */}
        <BetterTableRowGroup 
          title="More Options" 
          icon={getAssetIDByName("MoreHorizontalIcon")}
        >
          <FormRow
            label="Credits"
            subLabel="View plugin authors and contributors"
            leading={<FormRow.Icon source={getAssetIDByName("PeopleIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={navigateToCredits}
          />
        </BetterTableRowGroup>

        <RN.View style={styles.spacing} />
      </ScrollView>
    </RN.View>
  );
}
