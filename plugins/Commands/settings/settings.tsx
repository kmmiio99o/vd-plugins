import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative, stylesheet } from "@vendetta/metro/common";
import { NavigationNative } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { alerts } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
import Header from "./components/Header";
import BetterTableRowGroup from "./components/BetterTableRowGroup";

// Import all pages directly
import FactsSettingsPage from "./pages/FactsSettingsPage";
import ListSettingsPage from "./pages/ListSettingsPage";
import ImageSettingsPage from "./pages/ImageSettingsPage";
import GaryAPIPage from "./pages/GaryAPIPage";
import SpotifySettingsPage from "./pages/SpotifySettingsPage";
import AliucordPage from "./pages/AliucordPage";
import OtherSettingsPage from "./pages/OtherSettingsPage";
import HiddenSettingsPage from "./pages/HiddenSettingsPage";
import CreditsPage from "./pages/CreditsPage";

const { FormRow } = Forms;

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
  ip: true,
  lovefemboys: false,
  nekoslife: false,
  friendInviteCreate: true,
  friendInviteView: true,
  friendInviteRevoke: true,
};

storage.pendingRestart ??= false;

// Hidden settings storage with NSFW bypass option
storage.hiddenSettings ??= {
  enabled: false,
  visible: false,
  konochanBypassNsfw: false,
};

// Sidebar setting (enabled by default)
storage.sidebarEnabled ??= true;

// MAIN SETTINGS COMPONENT
export default function Settings() {
  useProxy(storage);
  const navigation = NavigationNative.useNavigation();

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
          onConfirm: () => {},
        });
      }
    };
  }, []);

  return (
    <ReactNative.View style={{ flex: 1 }}>
      <ReactNative.ScrollView
        style={{
          flex: 1,
          backgroundColor: semanticColors.BACKGROUND_PRIMARY,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          maxWidth: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <BetterTableRowGroup
          title="Command Categories"
          icon={getAssetIDByName("ChannelListIcon")}
        >
          <FormRow
            label="Facts Commands"
            subLabel="Cat facts, dog facts, and useless facts"
            leading={<FormRow.Icon source={getAssetIDByName("BookmarkIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Facts Commands",
                render: FactsSettingsPage,
              })
            }
          />
          <FormRow
            label="List Commands"
            subLabel="Plugin lists and theme lists"
            leading={<FormRow.Icon source={getAssetIDByName("ListViewIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "List Commands",
                render: ListSettingsPage,
              })
            }
          />
          <FormRow
            label="Image Commands"
            subLabel="PetPet, KonoChan, and image utilities"
            leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Image Commands",
                render: ImageSettingsPage,
              })
            }
          />
          <FormRow
            label="Gary Commands"
            subLabel={`Gary images - Current: ${
              storage.garySettings.imageSource === "gary"
                ? "Gary API"
                : storage.garySettings.imageSource === "catapi"
                  ? "Cat API"
                  : storage.garySettings.imageSource === "minker"
                    ? "Minker API"
                    : storage.garySettings.imageSource === "goober"
                      ? "Goober API"
                      : "Gary API"
            }`}
            leading={<FormRow.Icon source={getAssetIDByName("CameraIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Gary Commands",
                render: GaryAPIPage,
              })
            }
          />
          <FormRow
            label="Spotify Commands"
            subLabel="Share your Spotify activity"
            leading={
              <FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />
            }
            trailing={<FormRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Spotify Commands",
                render: SpotifySettingsPage,
              })
            }
          />
          <FormRow
            label="Aliucord Commands"
            subLabel="Commands from Aliucord"
            leading={
              <FormRow.Icon
                source={{
                  uri: "https://avatars.githubusercontent.com/u/78881422?s=200&v=4",
                }}
              />
            }
            trailing={<FormRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Aliucord",
                render: AliucordPage,
              })
            }
          />
          <FormRow
            label="Other Commands"
            subLabel="Utility and system commands"
            leading={<FormRow.Icon source={getAssetIDByName("WrenchIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Other Commands",
                render: OtherSettingsPage,
              })
            }
          />
        </BetterTableRowGroup>

        {storage.hiddenSettings?.visible && (
          <BetterTableRowGroup
            title="Hidden Settings"
            icon={getAssetIDByName("EyeIcon")}
          >
            <FormRow
              label="Hidden Commands"
              subLabel="Access to experimental and NSFW commands"
              leading={<FormRow.Icon source={getAssetIDByName("EyeIcon")} />}
              trailing={<FormRow.Arrow />}
              onPress={() =>
                navigation.push("VendettaCustomPage", {
                  title: "Hidden Settings",
                  render: HiddenSettingsPage,
                })
              }
            />
          </BetterTableRowGroup>
        )}

        <BetterTableRowGroup
          title="Other"
          icon={getAssetIDByName("InformationIcon")}
        >
          <FormRow
            label="Credits"
            subLabel="View original authors of the plugins"
            leading={<FormRow.Icon source={getAssetIDByName("HeartIcon")} />}
            trailing={<FormRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Credits",
                render: CreditsPage,
              })
            }
          />
        </BetterTableRowGroup>

        {/* Add sufficient bottom padding for scrolling */}
        <ReactNative.View style={{ height: 32 }} />
      </ReactNative.ScrollView>
    </ReactNative.View>
  );
}
