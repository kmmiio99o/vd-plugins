import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import BetterTableRowGroup from "../components/BetterTableRowGroup";

export default function CreditsPage() {
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
      color: semanticColors.HEADER_PRIMARY,
      marginBottom: 4,
    },
    authorText: {
      fontSize: 15,
      color: semanticColors.TEXT_MUTED,
      marginBottom: 2,
    },
    linkText: {
      fontSize: 13,
      color: semanticColors.TEXT_MUTED,
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
      color: semanticColors.TEXT_MUTED,
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

  return (
    <RN.ScrollView
      style={styles.container}
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 16,
        maxWidth: "100%",
      }}
    >
      <BetterTableRowGroup
        title="Plugin Authors"
        icon={getAssetIDByName("HeartIcon")}
        padding={true}
      >
        <RN.Text style={styles.infoText}>
          Thanks to this developers for creating such a nice plugins!{"\n"}
          Tap on any developer to visit their GitHub profile.
        </RN.Text>
      </BetterTableRowGroup>

      {credits.map((credit, index) => (
        <RN.Pressable
          key={index}
          style={styles.creditItem}
          onPress={() => handleProfilePress(credit.github)}
          android_ripple={{
            color: semanticColors.ANDROID_RIPPLE,
            radius: 200,
          }}
        >
          <RN.Image source={{ uri: credit.avatar }} style={styles.avatar} />
          <RN.View style={styles.textContainer}>
            <RN.Text style={styles.commandText}>{credit.command}</RN.Text>
            <RN.Text style={styles.authorText}>by {credit.author}</RN.Text>
            <RN.Text style={styles.linkText}>
              {credit.github.replace("https://github.com/", "@")}
            </RN.Text>
          </RN.View>
        </RN.Pressable>
      ))}

      <BetterTableRowGroup
        title="About"
        icon={getAssetIDByName("InfoIcon")}
        padding={true}
      >
        <RN.Text style={styles.versionText}>
          Commands Plugin Collection{"\n"}
          Version 1.3.0
        </RN.Text>
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
