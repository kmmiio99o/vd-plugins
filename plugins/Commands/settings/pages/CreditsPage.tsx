import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { rawColors, semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import BetterTableRowGroup from "../components/BetterTableRowGroup";

type Credit = {
  command: string;
  author: string;
  avatar: string;
  github: string;
};

export default function CreditsPage() {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },

    scrollContent: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: "stretch",
    },

    groupWrapper: {
      marginHorizontal: 16,
      marginTop: 16,
      maxWidth: "100%",
    },
    groupMain: {
      backgroundColor: rawColors.PLUM_18,
      borderColor: semanticColors.CARD_BACKGROUND_DEFAULT,
      borderWidth: 1,
      borderRadius: 16,
      overflow: "hidden",
      flex: 1,
      maxWidth: "100%",
    },

    cardPressable: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
    },

    avatarContainer: {
      width: 56,
      height: 56,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: semanticColors.BACKGROUND_SECONDARY,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 12,
      resizeMode: "cover",
    },

    textContainer: {
      flex: 1,
      justifyContent: "center",
    },
    commandText: {
      fontSize: 16,
      fontWeight: "700",
      color: semanticColors.MOBILE_TEXT_HEADING_PRIMARY,
      marginBottom: 2,
    },
    authorText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      marginBottom: 6,
    },
    linkText: {
      fontSize: 13,
      color: semanticColors.LINK,
      fontWeight: "600",
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
      color: semanticColors.TEXT_MUTED,
      textAlign: "center",
      fontWeight: "600",
      lineHeight: 22,
    },
  });

  const credits: Credit[] = [
    {
      command: "Facts Commands",
      author: "jdev082",
      avatar: "https://github.com/jdev082.png",
      github: "https://github.com/jdev082",
    },
    {
      command: "List Commands",
      author: "Kitomanari",
      avatar: "https://github.com/Kitosight.png",
      github: "https://github.com/Kitosight",
    },
    {
      command: "PetPet",
      author: "wolfieeee",
      avatar: "https://github.com/WolfPlugs.png",
      github: "https://github.com/WolfPlugs",
    },
    {
      command: "KonoChan Commands",
      author: "btmc727 & Rico040",
      avatar: "https://github.com/OTKUSteyler.png",
      github: "https://github.com/OTKUSteyler",
    },
    {
      command: "FirstMessage Command",
      author: "sapphire",
      avatar: "https://github.com/aeongdesu.png",
      github: "https://github.com/aeongdesu",
    },
    {
      command: "Sysinfo Command",
      author: "mugman",
      avatar: "https://github.com/mugman174.png",
      github: "https://github.com/mugman174",
    },
    {
      command: "Spotify Commands",
      author: "Kitomanari",
      avatar: "https://github.com/Kitosight.png",
      github: "https://github.com/Kitosight",
    },
    {
      command: "Gary Command",
      author: "Zach Orange",
      avatar: "https://github.com/IAmGaryTheCat.png",
      github: "https://github.com/IAmGaryTheCat",
    },
    {
      command: "IP & NekosLife Commands",
      author: "scruzism",
      avatar: "https://github.com/scrazzz.png",
      github: "https://github.com/scrazzz",
    },
    {
      command: "FriendInvites",
      author: "nikosszzz",
      avatar: "https://github.com/nikosszzz.png",
      github: "https://github.com/nikosszzz",
    },
  ];

  const handleProfilePress = (githubUrl: string) => {
    RN.Linking.openURL(githubUrl);
  };

  // Resolve asset IDs (some assets may be numeric IDs or URIs depending on bundling)
  const heartIconRaw = getAssetIDByName("HeartIcon");
  const infoIconRaw = getAssetIDByName("ic_information_24px");
  const heartIcon =
    typeof heartIconRaw === "number" ? (heartIconRaw as number) : undefined;
  const infoIcon =
    typeof infoIconRaw === "number" ? (infoIconRaw as number) : undefined;

  return (
    <RN.ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <BetterTableRowGroup
        title="Plugin Authors"
        icon={heartIcon}
        padding={true}
      >
        <RN.Text style={styles.infoText}>
          Thanks to these developers for creating such great plugins!
          {"\n"}Tap any developer to visit their GitHub profile.
        </RN.Text>
      </BetterTableRowGroup>

      {credits.map((credit) => (
        <RN.View key={credit.github} style={styles.groupWrapper}>
          <RN.View style={styles.groupMain}>
            <RN.View style={styles.rippleContainer}>
              <RN.Pressable
                style={styles.cardPressable}
                onPress={() => handleProfilePress(credit.github)}
                android_ripple={{
                  color: semanticColors.ANDROID_RIPPLE,
                  borderless: false,
                  radius: 200,
                }}
                accessibilityRole="button"
              >
                <RN.View style={styles.avatarContainer}>
                  <RN.Image
                    source={{ uri: credit.avatar }}
                    style={styles.avatar}
                  />
                </RN.View>

                <RN.View style={styles.textContainer}>
                  <RN.Text numberOfLines={1} style={styles.commandText}>
                    {credit.command}
                  </RN.Text>
                  <RN.Text numberOfLines={1} style={styles.authorText}>
                    by {credit.author}
                  </RN.Text>
                </RN.View>
              </RN.Pressable>
            </RN.View>
          </RN.View>
        </RN.View>
      ))}

      <BetterTableRowGroup title="About" icon={infoIcon} padding={true}>
        <RN.Text style={styles.versionText}>
          Commands Plugin Collection{"\n"}
          Version 1.3.0
        </RN.Text>
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
