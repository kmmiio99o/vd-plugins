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
function FactsSettingsPage() {
  useProxy(storage);

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
            onValueChange={() => {
              storage.factSettings.sendAsReply = !storage.factSettings.sendAsReply;
            }}
          />
          <FormSwitchRow
            label="Include Source Citation"
            subLabel="Include the source of facts when available"
            leading={<FormRow.Icon source={getAssetIDByName("LinkIcon")} />}
            value={storage.factSettings?.includeCitation ?? false}
            onValueChange={() => {
              storage.factSettings.includeCitation = !storage.factSettings.includeCitation;
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Available Fact Commands" icon={getAssetIDByName("BookmarkIcon")}>
          <FormSwitchRow
            label="/catfact"
            subLabel="Get random cat facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
            value={storage.enabledCommands?.catfact ?? true}
            onValueChange={() => {
              storage.enabledCommands.catfact = !storage.enabledCommands.catfact;
              storage.pendingRestart = true;
            }}
          />
          <FormSwitchRow
            label="/dogfact"
            subLabel="Get random dog facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
            value={storage.enabledCommands?.dogfact ?? true}
            onValueChange={() => {
              storage.enabledCommands.dogfact = !storage.enabledCommands.dogfact;
              storage.pendingRestart = true;
            }}
          />
          <FormSwitchRow
            label="/useless"
            subLabel="Get random useless facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
            value={storage.enabledCommands?.useless ?? true}
            onValueChange={() => {
              storage.enabledCommands.useless = !storage.enabledCommands.useless;
              storage.pendingRestart = true;
            }}
          />
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// Gary API Settings Page with proper reactivity
function GaryAPIPage() {
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
    optionContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 0,
      backgroundColor: "transparent",
    },
    radioContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
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
    radioButtonSelected: {
      borderColor: semanticColors.BRAND_500,
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: semanticColors.BRAND_500,
    },
    optionIcon: {
      width: 20,
      height: 20,
      marginRight: 12,
      tintColor: semanticColors.TEXT_MUTED,
    },
    optionIconSelected: {
      tintColor: semanticColors.BRAND_500,
    },
    textContainer: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: semanticColors.TEXT_NORMAL,
    },
    optionTitleSelected: {
      color: semanticColors.BRAND_500,
      fontWeight: "600",
    },
    optionDescription: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      marginTop: 2,
      lineHeight: 18,
    },
  });

  const currentSource = storage.garySettings?.imageSource || "gary";

  const options = [
    {
      value: "gary",
      title: "Gary API",
      description: "Original Gary the cat images from api.garythe.cat",
      icon: getAssetIDByName("ImageIcon"),
    },
    {
      value: "catapi", 
      title: "Cat API",
      description: "Random cat pictures from thecatapi.com",
      icon: getAssetIDByName("ImageIcon"),
    },
    {
      value: "minker",
      title: "Minker API", 
      description: "Minky images from minky.materii.dev",
      icon: getAssetIDByName("ImageIcon"),
    },
    {
      value: "goober",
      title: "Goober API",
      description: "Goober images from api.garythe.cat/goober", 
      icon: getAssetIDByName("ImageIcon"),
    },
  ];

  const renderOption = (option: typeof options[0]) => {
    const isSelected = currentSource === option.value;
    
    return (
      <RN.Pressable
        key={option.value}
        style={styles.optionContainer}
        onPress={() => {
          storage.garySettings.imageSource = option.value;
        }}
        android_ripple={{ color: semanticColors.ANDROID_RIPPLE, radius: 300 }}
      >
        <RN.View style={styles.radioContainer}>
          <RN.View style={[
            styles.radioButton,
            isSelected && styles.radioButtonSelected
          ]}>
            {isSelected && <RN.View style={styles.radioInner} />}
          </RN.View>
          
          <RN.Image
            source={option.icon}
            style={[
              styles.optionIcon,
              isSelected && styles.optionIconSelected
            ]}
            resizeMode="contain"
          />
          
          <RN.View style={styles.textContainer}>
            <RN.Text style={[
              styles.optionTitle,
              isSelected && styles.optionTitleSelected
            ]}>
              {option.title}
            </RN.Text>
            <RN.Text style={styles.optionDescription}>
              {option.description}
            </RN.Text>
          </RN.View>
        </RN.View>
      </RN.Pressable>
    );
  };

  return (
    <RN.View style={styles.container}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}
        showsVerticalScrollIndicator={false}
      >
        <BetterTableRowGroup title="Gary Command Settings" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="/gary"
            subLabel="Send random Gary images to channel"
            leading={<FormRow.Icon source={getAssetIDByName("AttachmentIcon")} />}
            value={storage.enabledCommands?.gary ?? true}
            onValueChange={() => {
              storage.enabledCommands.gary = !storage.enabledCommands.gary;
              storage.pendingRestart = true;
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Image Source Selection" icon={getAssetIDByName("DownloadIcon")} padding={true}>
          <RN.Text style={styles.infoText}>
            Choose which API the /gary command should use to fetch images.
          </RN.Text>
        </BetterTableRowGroup>

        <BetterTableRowGroup title="API Options" icon={getAssetIDByName("CloudIcon")}>
          {options.map(renderOption)}
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
          <RN.Text style={[styles.infoText, { marginBottom: 0, marginTop: 8 }]}>
            Tap an option above to change the image source.
          </RN.Text>
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// List Commands Settings Page
function ListSettingsPage() {
  useProxy(storage);

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
            onValueChange={() => {
              storage.listSettings.pluginListAlwaysDetailed = !storage.listSettings.pluginListAlwaysDetailed;
            }}
          />
          <FormSwitchRow
            label="Always Send Detailed Theme List"
            subLabel="Always use detailed mode when listing themes"
            leading={<FormRow.Icon source={getAssetIDByName("PaintPaletteIcon")} />}
            value={storage.listSettings?.themeListAlwaysDetailed ?? false}
            onValueChange={() => {
              storage.listSettings.themeListAlwaysDetailed = !storage.listSettings.themeListAlwaysDetailed;
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="Available List Commands" icon={getAssetIDByName("ListViewIcon")}>
          <FormSwitchRow
            label="/plugin-list"
            subLabel="List all installed plugins"
            leading={<FormRow.Icon source={getAssetIDByName("PuzzlePieceIcon")} />}
            value={storage.enabledCommands?.pluginList ?? true}
            onValueChange={() => {
              storage.enabledCommands.pluginList = !storage.enabledCommands.pluginList;
              storage.pendingRestart = true;
            }}
          />
          <FormSwitchRow
            label="/theme-list"
            subLabel="List all installed themes"
            leading={<FormRow.Icon source={getAssetIDByName("PaintPaletteIcon")} />}
            value={storage.enabledCommands?.themeList ?? true}
            onValueChange={() => {
              storage.enabledCommands.themeList = !storage.enabledCommands.themeList;
              storage.pendingRestart = true;
            }}
          />
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// Image Commands Settings Page
function ImageSettingsPage() {
  useProxy(storage);

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
            onValueChange={() => {
              storage.enabledCommands.petpet = !storage.enabledCommands.petpet;
              storage.pendingRestart = true;
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="KonoChan Commands" icon={getAssetIDByName("ImageIcon")}>
          <FormSwitchRow
            label="/konoself"
            subLabel="Get random image from KonoChan (private)"
            leading={<FormRow.Icon source={getAssetIDByName("EyeIcon")} />}
            value={storage.enabledCommands?.konoself ?? true}
            onValueChange={() => {
              storage.enabledCommands.konoself = !storage.enabledCommands.konoself;
              storage.pendingRestart = true;
            }}
          />
          <FormSwitchRow
            label="/konosend"
            subLabel="Send random image from KonoChan to channel"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            value={storage.enabledCommands?.konosend ?? true}
            onValueChange={() => {
              storage.enabledCommands.konosend = !storage.enabledCommands.konosend;
              storage.pendingRestart = true;
            }}
          />
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// Spotify Commands Settings Page
function SpotifySettingsPage() {
  useProxy(storage);

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
            onValueChange={() => {
              storage.enabledCommands.spotifyTrack = !storage.enabledCommands.spotifyTrack;
              storage.pendingRestart = true;
            }}
          />
          <FormSwitchRow
            label="/spotify album"
            subLabel="Share your current track's album"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands?.spotifyAlbum ?? true}
            onValueChange={() => {
              storage.enabledCommands.spotifyAlbum = !storage.enabledCommands.spotifyAlbum;
              storage.pendingRestart = true;
            }}
          />
          <FormSwitchRow
            label="/spotify artists"
            subLabel="Share your current track's artists"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands?.spotifyArtists ?? true}
            onValueChange={() => {
              storage.enabledCommands.spotifyArtists = !storage.enabledCommands.spotifyArtists;
              storage.pendingRestart = true;
            }}
          />
          <FormSwitchRow
            label="/spotify cover"
            subLabel="Share your current track's cover"
            leading={<FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />}
            value={storage.enabledCommands?.spotifyCover ?? true}
            onValueChange={() => {
              storage.enabledCommands.spotifyCover = !storage.enabledCommands.spotifyCover;
              storage.pendingRestart = true;
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
function OtherSettingsPage() {
  useProxy(storage);

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
            onValueChange={() => {
              storage.enabledCommands.firstmessage = !storage.enabledCommands.firstmessage;
              storage.pendingRestart = true;
            }}
          />
        </BetterTableRowGroup>

        <BetterTableRowGroup title="System Commands" icon={getAssetIDByName("SettingsIcon")}>
          <FormSwitchRow
            label="/sysinfo"
            subLabel="Display system information"
            leading={<FormRow.Icon source={getAssetIDByName("SettingsIcon")} />}
            value={storage.enabledCommands?.sysinfo ?? true}
            onValueChange={() => {
              storage.enabledCommands.sysinfo = !storage.enabledCommands.sysinfo;
              storage.pendingRestart = true;
            }}
          />
        </BetterTableRowGroup>
      </ScrollView>
    </RN.View>
  );
}

// FIXED Credits Page - changed "contributor" to "developer"
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
    <RN.View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16, paddingBottom: 38 }}>
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
            Version 1.0.0
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

// Main Settings Component - COMPLETELY FIXED
export default function Settings() {
  useProxy(storage);
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
            subLabel={`Gary images - Current: ${storage.garySettings?.imageSource === "gary" ? "Gary API" : 
              storage.garySettings?.imageSource === "catapi" ? "Cat API" : 
              storage.garySettings?.imageSource === "minker" ? "Minker API" : 
              storage.garySettings?.imageSource === "goober" ? "Goober API" : "Gary API"}`}
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

        {/* More Options */}
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
      </ScrollView>
    </RN.View>
  );
}
