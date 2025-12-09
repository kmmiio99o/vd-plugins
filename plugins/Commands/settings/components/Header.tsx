import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { findByProps } from "@vendetta/metro";

export default function Header() {
  const [clickCounter, setClickCounter] = React.useState(0);
  const [clickTimeout, setClickTimeout] = React.useState<NodeJS.Timeout | null>(
    null,
  );
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [isAnimatedAvatar, setIsAnimatedAvatar] = React.useState(false);

  // Initialize sidebar enabled setting if not exists
  React.useEffect(() => {
    if (storage.sidebarEnabled === undefined) {
      storage.sidebarEnabled = true;
    }
  }, []);

  // Get current user from Discord's user store
  const users = findByProps("getUser", "getCurrentUser");
  const currentUser = users?.getCurrentUser?.();

  // Get avatar URL utility
  const { getUserAvatarURL } = findByProps("getUserAvatarURL") || {};
  const { getDefaultAvatarURL } = findByProps("getDefaultAvatarURL") || {};

  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 24,
      paddingHorizontal: 16,
      width: "100%",
      justifyContent: "center",
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 20,
      maxWidth: 500,
    },
    avatarContainer: {
      position: "relative",
      width: 96,
      height: 96,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarWrapper: {
      width: 96,
      height: 96,
      borderRadius: 24,
      backgroundColor: semanticColors.BACKGROUND_SECONDARY,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      borderWidth: 2,
      borderColor: semanticColors.BACKGROUND_TERTIARY,
    },
    avatar: {
      width: 92,
      height: 92,
      borderRadius: 22,
    },
    cogwheelBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      opacity: 0,
    },
    cogwheelIcon: {
      width: 32,
      height: 32,
      tintColor: semanticColors.INTERACTIVE_ACTIVE,
    },
    textContainer: {
      flex: 1,
      marginLeft: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: semanticColors.HEADER_PRIMARY,
      marginBottom: 4,
      textAlign: "left",
    },
    subtitle: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      textAlign: "left",
      lineHeight: 20,
    },
    avatarPlaceholder: {
      width: 48,
      height: 48,
      tintColor: semanticColors.INTERACTIVE_NORMAL,
    },
    animatedIndicator: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    gifText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "bold",
    },
  });

  // Fetch user's avatar on component mount
  React.useEffect(() => {
    if (currentUser) {
      let url;
      let animated = false;

      // Check if avatar is animated (starts with "a_")
      const hasAnimatedAvatar = currentUser.avatar?.startsWith("a_");

      // Try to get the user's custom avatar first
      if (getUserAvatarURL && currentUser.avatar) {
        // Use animated parameter for GIF avatars
        url = getUserAvatarURL(currentUser, hasAnimatedAvatar);
        animated = hasAnimatedAvatar;
      }
      // Fall back to default avatar
      else if (getDefaultAvatarURL) {
        url = getDefaultAvatarURL(currentUser);
      }
      // Last resort: Construct Discord CDN URL
      else if (currentUser.avatar) {
        const isGif = currentUser.avatar.startsWith("a_");
        url = `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.${isGif ? "gif" : "png"}?size=256`;
        animated = isGif;
      } else {
        // Default Discord avatar based on discriminator or id
        const defaultAvatarIndex = currentUser.discriminator
          ? parseInt(currentUser.discriminator) % 5
          : (parseInt(currentUser.id) >> 22) % 6;
        url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
      }

      setAvatarUrl(url);
      setIsAnimatedAvatar(animated);
    }
  }, [currentUser]);

  const handleAvatarPress = () => {
    if (storage.hiddenSettings?.enabled) {
      storage.hiddenSettings.visible = !storage.hiddenSettings.visible;
      showToast(
        `Hidden settings ${storage.hiddenSettings.visible ? "visible" : "hidden"}`,
        getAssetIDByName("SettingsIcon"),
      );
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

    showToast("Hidden settings unlocked!", getAssetIDByName("CheckmarkIcon"));
    storage.hiddenSettings = {
      ...storage.hiddenSettings,
      enabled: true,
      visible: true,
    };
    setClickCounter(0);
  };

  const handleAvatarLongPress = () => {
    const newState = !storage.sidebarEnabled;
    storage.sidebarEnabled = newState;
    storage.pendingRestart = true;
    showToast(
      `Sidebar ${newState ? "enabled" : "disabled"}. Restart Discord to apply.`,
      getAssetIDByName(newState ? "CheckmarkIcon" : "XIcon"),
    );
  };

  const [showCogwheel, setShowCogwheel] = React.useState(false);

  return (
    <RN.View style={styles.container}>
      <RN.View style={styles.leftSection}>
        <RN.Pressable
          style={styles.avatarContainer}
          onPress={handleAvatarPress}
          onPressIn={() => setShowCogwheel(true)}
          onPressOut={() => setShowCogwheel(false)}
          delayLongPress={500}
          onLongPress={handleAvatarLongPress}
        >
          <RN.View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <>
                <RN.Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
                {isAnimatedAvatar && (
                  <RN.View style={styles.animatedIndicator}>
                    <RN.Text style={styles.gifText}>GIF</RN.Text>
                  </RN.View>
                )}
              </>
            ) : (
              <RN.Image
                source={getAssetIDByName("ic_account_circle_24px")}
                style={styles.avatarPlaceholder}
              />
            )}
          </RN.View>

          {/* Cogwheel background overlay (appears on press) */}
          <RN.View
            style={[
              styles.cogwheelBackground,
              { opacity: showCogwheel ? 0.8 : 0 },
            ]}
          >
            <RN.Image
              source={getAssetIDByName("SettingsIcon")}
              style={styles.cogwheelIcon}
            />
          </RN.View>
        </RN.Pressable>

        <RN.View style={styles.textContainer}>
          <RN.Text style={styles.title}>Commands</RN.Text>
          <RN.Text style={styles.subtitle}>
            A collection of useful commands for Vendetta like clients
          </RN.Text>
        </RN.View>
      </RN.View>
    </RN.View>
  );
}
