import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { NavigationNative } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { alerts } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";

const { ScrollView } = RN;
const { FormRow, FormSwitchRow } = Forms;

// Initialize storage with default values
storage.factSettings ??= {
  sendAsReply: true,
  includeCitation: false,
};

storage.listSettings ??= {
  pluginListAlwaysDetailed: false,
  themeListAlwaysDetailed: false,
};

storage.garySettings ??= {
  imageSource: "gary",
};

storage.enabledCommands ??= {
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
  lovefemboys: false, // Hidden command - disabled by default
};

storage.pendingRestart ??= false;

// Hidden settings storage
storage.hiddenSettings ??= {
  enabled: false,
  visible: false,
};

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

// Header Component with secret unlock
function Header({ onHiddenUnlock }: { onHiddenUnlock?: () => void }) {
  const [clickCounter, setClickCounter] = React.useState(0);
  const [clickTimeout, setClickTimeout] = React.useState<NodeJS.Timeout | null>(null);
  
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

  const handleIconPress = () => {
    if (storage.hiddenSettings.enabled) {
      storage.hiddenSettings.visible = !storage.hiddenSettings.visible;
      showToast(
        `Hidden settings ${storage.hiddenSettings.visible ? "visible" : "hidden"}`,
        getAssetIDByName("SettingsIcon")
      );
      onHiddenUnlock?.();
      return;
    }

    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }

    const newTimeout = setTimeout(() => {
      setClickCounter(0);
    }, 1000);
    setClickTimeout(newTimeout);

    const newCounter = clickCounter + 1;
    setClickCounter(newCounter);

    if (newCounter < 10) {
      return;
    }

    showToast("🔓 Hidden settings unlocked!", getAssetIDByName("CheckmarkIcon"));
    storage.hiddenSettings.enabled = true;
    storage.hiddenSettings.visible = true;
    setClickCounter(0);
    
    onHiddenUnlock?.();
  };

  return (
    <RN.View style={styles.container}>
      <RN.Pressable style={styles.iconContainer} onPress={handleIconPress}>
        <RN.Image
          source={getAssetIDByName("SettingsIcon")}
          style={styles.icon}
        />
      </RN.Pressable>
      <RN.Text style={styles.title}>Commands</RN.Text>
      <RN.Text style={styles.subtitle}>A collection of useful commands</RN.Text>
    </RN.View>
  );
}

// Hidden Commands Settings Page
function HiddenSettingsPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
    warningText: {
      fontSize: 14,
      color: semanticColors.TEXT_DANGER,
      textAlign: "center",
      lineHeight: 20,
      fontWeight: "600",
    },
    infoText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 8,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <RN.View style={{ paddingVertical: 16 }}>
        <BetterTableRowGroup title="⚠️ Warning" icon={getAssetIDByName("WarningIcon")} padding={true}>
          <RN.Text style={styles.warningText}>
            These are hidden commands that may contain mature content or experimental features.
          </RN.Text>
          <RN.Text style={styles.infoText}>
            Use at your own discretion. Commands in this section are disabled by default.
          </RN.Text>
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Hidden Commands" icon={getAssetIDByName("EyeIcon")}>
          <FormSwitchRow
            label="/lovefemboys"
            subLabel="Get random femboy images from r/femboys (NSFW content available)"
            leading={<FormRow.Icon source={getAssetIDByName("HeartIcon")} />}
            value={storage.enabledCommands.lovefemboys}
            onValueChange={(v) => {
              storage.enabledCommands.lovefemboys = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Hidden Settings Control" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="Keep Hidden Settings Visible"
            subLabel="Keep this section visible even when navigating away"
            leading={<FormRow.Icon source={getAssetIDByName("EyeIcon")} />}
            value={storage.hiddenSettings.visible}
            onValueChange={(v) => {
              storage.hiddenSettings.visible = v;
            }}
          />
          <FormRow
            label="Reset Hidden Settings"
            subLabel="Hide this section and disable all hidden commands"
            leading={<FormRow.Icon source={getAssetIDByName("TrashIcon")} />}
            onPress={() => {
              alerts.showConfirmationAlert({
                title: "Reset Hidden Settings",
                content: "This will hide the hidden settings section and disable all hidden commands. Are you sure?",
                confirmText: "Reset",
                onConfirm: () => {
                  storage.hiddenSettings.enabled = false;
                  storage.hiddenSettings.visible = false;
                  storage.enabledCommands.lovefemboys = false;
                  storage.pendingRestart = true;
                  showToast("Hidden settings reset", getAssetIDByName("CheckmarkIcon"));
                },
                cancelText: "Cancel",
              });
            }}
          />
        </BetterTableRowGroup>
      </RN.View>
    </ScrollView>
  );
}

// Facts Commands Settings Page
function FactsSettingsPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>
      <RN.View style={{ paddingVertical: 16 }}>
        <BetterTableRowGroup title="Fact Display Settings" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="Send as Reply"
            subLabel="Send facts as a reply to the command message"
            leading={<FormRow.Icon source={getAssetIDByName("ArrowAngleLeftUpIcon")} />}
            value={storage.factSettings.sendAsReply}
            onValueChange={(v) => {
              storage.factSettings.sendAsReply = v;
            }}
          />
          <FormSwitchRow
            label="Include Source Citation"
            subLabel="Include the source of facts when available"
            leading={<FormRow.Icon source={getAssetIDByName("LinkIcon")} />}
            value={storage.factSettings.includeCitation}
            onValueChange={(v) => {
              storage.factSettings.includeCitation = v;
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Available Fact Commands" icon={getAssetIDByName("BookmarkIcon")}>
          <FormSwitchRow
            label="/catfact"
            subLabel="Get random cat facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
            value={storage.enabledCommands.catfact}
            onValueChange={(v) => {
              storage.enabledCommands.catfact = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
          <FormSwitchRow
            label="/dogfact"
            subLabel="Get random dog facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
            value={storage.enabledCommands.dogfact}
            onValueChange={(v) => {
              storage.enabledCommands.dogfact = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
          <FormSwitchRow
            label="/useless"
            subLabel="Get random useless facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
            value={storage.enabledCommands.useless}
            onValueChange={(v) => {
              storage.enabledCommands.useless = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
        </BetterTableRowGroup>
      </RN.View>
    </ScrollView>
  );
}

// Gary API Settings Page
function GaryAPIPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  
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

  const currentSource = storage.garySettings.imageSource;

  return (
    <ScrollView style={styles.container}>
      <RN.View style={{ paddingVertical: 16 }}>
        <BetterTableRowGroup title="Gary Command Settings" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="/gary"
            subLabel="Send random Gary images to channel"
            leading={<FormRow.Icon source={getAssetIDByName("AttachmentIcon")} />}
            value={storage.enabledCommands.gary}
            onValueChange={(v) => {
              storage.enabledCommands.gary = v;
              storage.pendingRestart = true;
              forceUpdate();
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
            onValueChange={(v) => {
              if (v) {
                storage.garySettings.imageSource = "gary";
                forceUpdate();
              }
            }}
          />
          <FormSwitchRow
            label="Cat API"
            subLabel="Random cat pictures from thecatapi.com"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={currentSource === "catapi"}
            onValueChange={(v) => {
              if (v) {
                storage.garySettings.imageSource = "catapi";
                forceUpdate();
              }
            }}
          />
          <FormSwitchRow
            label="Minker API"
            subLabel="Minky images from minky.materii.dev"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={currentSource === "minker"}
            onValueChange={(v) => {
              if (v) {
                storage.garySettings.imageSource = "minker";
                forceUpdate();
              }
            }}
          />
          <FormSwitchRow
            label="Goober API"
            subLabel="Goober images from api.garythe.cat/goober"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={currentSource === "goober"}
            onValueChange={(v) => {
              if (v) {
                storage.garySettings.imageSource = "goober";
                forceUpdate();
              }
            }}
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
      </RN.View>
    </ScrollView>
  );
}

// List Settings Page
function ListSettingsPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>
      <RN.View style={{ paddingVertical: 16 }}>
        <BetterTableRowGroup title="List Display Settings" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="Always Send Detailed Plugin List"
            subLabel="Always use detailed mode when listing plugins"
            leading={<FormRow.Icon source={getAssetIDByName("PuzzlePieceIcon")} />}
            value={storage.listSettings.pluginListAlwaysDetailed}
            onValueChange={(v) => {
              storage.listSettings.pluginListAlwaysDetailed = v;
            }}
          />
          <FormSwitchRow
            label="Always Send Detailed Theme List"
            subLabel="Always use detailed mode when listing themes"
            leading={<FormRow.Icon source={getAssetIDByName("PaintPaletteIcon")} />}
            value={storage.listSettings.themeListAlwaysDetailed}
            onValueChange={(v) => {
              storage.listSettings.themeListAlwaysDetailed = v;
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Available List Commands" icon={getAssetIDByName("ListViewIcon")}>
          <FormSwitchRow
            label="/plugin-list"
            subLabel="List all installed plugins"
            leading={<FormRow.Icon source={getAssetIDByName("PuzzlePieceIcon")} />}
            value={storage.enabledCommands.pluginList}
            onValueChange={(v) => {
              storage.enabledCommands.pluginList = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
          <FormSwitchRow
            label="/theme-list"
            subLabel="List all installed themes"
            leading={<FormRow.Icon source={getAssetIDByName("PaintPaletteIcon")} />}
            value={storage.enabledCommands.themeList}
            onValueChange={(v) => {
              storage.enabledCommands.themeList = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
        </BetterTableRowGroup>
      </RN.View>
    </ScrollView>
  );
}

// Image Settings Page
function ImageSettingsPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>
      <RN.View style={{ paddingVertical: 16 }}>
        <BetterTableRowGroup title="Image Commands" icon={getAssetIDByName("ImageIcon")}>
          <FormSwitchRow
            label="/petpet"
            subLabel="Create pet-pet GIF of a user"
            leading={<FormRow.Icon source={getAssetIDByName("HandRequestSpeakIcon")} />}
            value={storage.enabledCommands.petpet}
            onValueChange={(v) => {
              storage.enabledCommands.petpet = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="KonoChan Commands" icon={getAssetIDByName("ImageIcon")}>
          <FormSwitchRow
            label="/konoself"
            subLabel="Get random image from KonoChan (private)"
            leading={<FormRow.Icon source={getAssetIDByName("EyeIcon")} />}
            value={storage.enabledCommands.konoself}
            onValueChange={(v) => {
              storage.enabledCommands.konoself = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
          <FormSwitchRow
            label="/konosend"
            subLabel="Send random image from KonoChan to channel"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={storage.enabledCommands.konosend}
            onValueChange={(v) => {
              storage.enabledCommands.konosend = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
        </BetterTableRowGroup>
      </RN.View>
    </ScrollView>
  );
}

// Spotify Settings Page - FIXED with proper text styling
function SpotifySettingsPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const styles = stylesheet.createThemedStyleSheet({
    infoText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      textAlign: "center",
      lineHeight: 20,
    },
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>
      <RN.View style={{ paddingVertical: 16 }}>
        <BetterTableRowGroup title="Spotify Commands" icon={getAssetIDByName("SpotifyNeutralIcon")}>
          <FormSwitchRow
            label="/spotify track"
            subLabel="Share your current Spotify track"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands.spotifyTrack}
            onValueChange={(v) => {
              storage.enabledCommands.spotifyTrack = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
          <FormSwitchRow
            label="/spotify album"
            subLabel="Share your current track's album"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands.spotifyAlbum}
            onValueChange={(v) => {
              storage.enabledCommands.spotifyAlbum = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
          <FormSwitchRow
            label="/spotify artists"
            subLabel="Share your current track's artists"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands.spotifyArtists}
            onValueChange={(v) => {
              storage.enabledCommands.spotifyArtists = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
          <FormSwitchRow
            label="/spotify cover"
            subLabel="Share your current track's cover"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands.spotifyCover}
            onValueChange={(v) => {
              storage.enabledCommands.spotifyCover = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="About Spotify Commands" icon={getAssetIDByName("InfoIcon")} padding={true}>
          <RN.Text style={styles.infoText}>
            These commands allow you to share your current Spotify activity in Discord. Make sure you have Spotify connected to Discord for these commands to work properly.
          </RN.Text>
        </BetterTableRowGroup>
      </RN.View>
    </ScrollView>
  );
}

// Other Settings Page
function OtherSettingsPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>
      <RN.View style={{ paddingVertical: 16 }}>
        <BetterTableRowGroup title="Message Commands" icon={getAssetIDByName("ChatIcon")}>
          <FormSwitchRow
            label="/firstmessage"
            subLabel="Get the first message in a channel"
            leading={<FormRow.Icon source={getAssetIDByName("ChatIcon")} />}
            value={storage.enabledCommands.firstmessage}
            onValueChange={(v) => {
              storage.enabledCommands.firstmessage = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="System Commands" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="/sysinfo"
            subLabel="Display system information"
            leading={<FormRow.Icon source={getAssetIDByName("SettingsIcon")} />}
            value={storage.enabledCommands.sysinfo}
            onValueChange={(v) => {
              storage.enabledCommands.sysinfo = v;
              storage.pendingRestart = true;
              forceUpdate();
            }}
          />
        </BetterTableRowGroup>
      </RN.View>
    </ScrollView>
  );
}

// Credits Page - UPDATED VERSION TO 1.0.1
function CreditsPage() {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
    creditItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: semanticColors.CARD_PRIMARY_BG,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 6,
      shadowColor: semanticColors.BLACK,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 16,
      backgroundColor: semanticColors.BACKGROUND_SECONDARY,
    },
    textContainer: {
      flex: 1,
    },
    commandText: {
      fontSize: 17,
      fontWeight: "600",
      color: semanticColors.TEXT_NORMAL,
      marginBottom: 4,
    },
    authorText: {
      fontSize: 15,
      color: semanticColors.TEXT_MUTED,
      marginBottom: 2,
    },
    linkText: {
      fontSize: 13,
      color: semanticColors.TEXT_BRAND,
      fontWeight: "500",
    },
    infoText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      marginBottom: 20,
      textAlign: "center",
      lineHeight: 20,
    },
    versionText: {
      fontSize: 15,
      color: semanticColors.TEXT_NORMAL,
      textAlign: "center",
      fontWeight: "600",
      lineHeight: 22,
    },
  });

  const credits = [
    { 
      command: "Facts Commands", 
      author: "jdev082", 
      avatar: "https://github.com/jdev082.png",
      github: "https://github.com/jdev082"
    },
    { 
      command: "List Commands", 
      author: "Kitomanari", 
      avatar: "https://github.com/Kitosight.png",
      github: "https://github.com/Kitosight"
    },
    { 
      command: "PetPet", 
      author: "wolfieeee", 
      avatar: "https://github.com/WolfPlugs.png",
      github: "https://github.com/WolfPlugs"
    },
    { 
      command: "KonoChan Commands", 
      author: "btmc727 & Rico040", 
      avatar: "https://github.com/OTKUSteyler.png",
      github: "https://github.com/OTKUSteyler"
    },
    { 
      command: "FirstMessage Command", 
      author: "sapphire", 
      avatar: "https://github.com/aeongdesu.png",
      github: "https://github.com/aeongdesu"
    },
    { 
      command: "Sysinfo Command", 
      author: "mugman", 
      avatar: "https://github.com/mugman174.png",
      github: "https://github.com/mugman174"
    },
    { 
      command: "Spotify Commands", 
      author: "Kitomanari", 
      avatar: "https://github.com/Kitosight.png",
      github: "https://github.com/Kitosight"
    },
    { 
      command: "Gary Command", 
      author: "Zach Orange", 
      avatar: "https://github.com/Zach11111.png",
      github: "https://github.com/Zach11111"
    },
  ];

  const handleProfilePress = (githubUrl: string) => {
    RN.Linking.openURL(githubUrl);
  };

  return (
    <ScrollView style={styles.container}>
      <RN.View style={{ paddingVertical: 16 }}>
        <BetterTableRowGroup title="Plugin Authors" icon={getAssetIDByName("HeartIcon")} padding={true}>
          <RN.Text style={styles.infoText}>
            Thanks to this developers for creating such a nice plugins!{'\n'}
            Tap on any developer to visit their GitHub profile.
          </RN.Text>
        </BetterTableRowGroup>

        {credits.map((credit, index) => (
          <RN.Pressable
            key={index}
            style={styles.creditItem}
            onPress={() => handleProfilePress(credit.github)}
            android_ripple={{ color: semanticColors.ANDROID_RIPPLE, radius: 200 }}
          >
            <RN.Image
              source={{ uri: credit.avatar }}
              style={styles.avatar}
            />
            <RN.View style={styles.textContainer}>
              <RN.Text style={styles.commandText}>{credit.command}</RN.Text>
              <RN.Text style={styles.authorText}>by {credit.author}</RN.Text>
              <RN.Text style={styles.linkText}>{credit.github.replace('https://github.com/', '@')}</RN.Text>
            </RN.View>
          </RN.Pressable>
        ))}

        <BetterTableRowGroup title="About" icon={getAssetIDByName("InfoIcon")} padding={true}>
          <RN.Text style={styles.versionText}>
            Commands Plugin Collection{'\n'}
            Version 1.0.1
          </RN.Text>
        </BetterTableRowGroup>
      </RN.View>
    </ScrollView>
  );
}

// MAIN SETTINGS COMPONENT
export default function Settings() {
  useProxy(storage);
  const navigation = NavigationNative.useNavigation();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}>
      <Header onHiddenUnlock={forceUpdate} />

      <BetterTableRowGroup title="Command Categories" icon={getAssetIDByName("ChannelListIcon")}>
        <FormRow
          label="Facts Commands"
          subLabel="Cat facts, dog facts, and useless facts"
          leading={<FormRow.Icon source={getAssetIDByName("BookmarkIcon")} />}
          trailing={<FormRow.Arrow />}
          onPress={() => navigation.push("VendettaCustomPage", {
            title: "Facts Commands",
            render: FactsSettingsPage,
          })}
        />
        <FormRow
          label="List Commands"
          subLabel="Plugin lists and theme lists"
          leading={<FormRow.Icon source={getAssetIDByName("ListViewIcon")} />}
          trailing={<FormRow.Arrow />}
          onPress={() => navigation.push("VendettaCustomPage", {
            title: "List Commands",
            render: ListSettingsPage,
          })}
        />
        <FormRow
          label="Image Commands"
          subLabel="PetPet, KonoChan, and image utilities"
          leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
          trailing={<FormRow.Arrow />}
          onPress={() => navigation.push("VendettaCustomPage", {
            title: "Image Commands",
            render: ImageSettingsPage,
          })}
        />
        <FormRow
          label="Gary Commands"
          subLabel={`Gary images - Current: ${storage.garySettings.imageSource === "gary" ? "Gary API" : 
            storage.garySettings.imageSource === "catapi" ? "Cat API" : 
            storage.garySettings.imageSource === "minker" ? "Minker API" : 
            storage.garySettings.imageSource === "goober" ? "Goober API" : "Gary API"}`}
          leading={<FormRow.Icon source={getAssetIDByName("CameraIcon")} />}
          trailing={<FormRow.Arrow />}
          onPress={() => navigation.push("VendettaCustomPage", {
            title: "Gary Commands",
            render: GaryAPIPage,
          })}
        />
        <FormRow
          label="Spotify Commands"
          subLabel="Share your Spotify activity"
          leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
          trailing={<FormRow.Arrow />}
          onPress={() => navigation.push("VendettaCustomPage", {
            title: "Spotify Commands",
            render: SpotifySettingsPage,
          })}
        />
        <FormRow
          label="Other Commands"
          subLabel="System info and miscellaneous"
          leading={<FormRow.Icon source={getAssetIDByName("MoreHorizontalIcon")} />}
          trailing={<FormRow.Arrow />}
          onPress={() => navigation.push("VendettaCustomPage", {
            title: "Other Commands",
            render: OtherSettingsPage,
          })}
        />
      </BetterTableRowGroup>

      {storage.hiddenSettings?.enabled && storage.hiddenSettings?.visible && (
        <BetterTableRowGroup title="🔓 Hidden Settings" icon={getAssetIDByName("EyeIcon")}>
          <FormRow
            label="Hidden Commands"
            subLabel="Experimental and mature content commands"
            leading={<FormRow.Icon source={getAssetIDByName("WarningIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() => navigation.push("VendettaCustomPage", {
              title: "Hidden Settings",
              render: HiddenSettingsPage,
            })}
          />
        </BetterTableRowGroup>
      )}

      <BetterTableRowGroup title="More Options" icon={getAssetIDByName("SettingsIcon")}>
        <FormRow
          label="Credits"
          subLabel="View original authors of the plugins"
          leading={<FormRow.Icon source={getAssetIDByName("HeartIcon")} />}
          trailing={<FormRow.Arrow />}
          onPress={() => navigation.push("VendettaCustomPage", {
            title: "Credits",
            render: CreditsPage,
          })}
        />
      </BetterTableRowGroup>

      <RN.View style={{ height: 32 }} />
    </ScrollView>
  );
}
