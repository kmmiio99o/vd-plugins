import { plugin } from "@vendetta";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { Linking } from "react-native";
import { NavigationNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableSwitchRow, Stack, TableRow } = findByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "Stack",
  "TableRow",
);
const { TextInput } = findByProps("TextInput");

import Constants from "../../constants";
import { serviceFactory } from "../../services/ServiceFactory";
import { ServiceType } from "../../../../defs";

plugin.storage.username ??= "";
plugin.storage.apiKey ??= "";
plugin.storage.appName ??= "Music";
plugin.storage.timeInterval ??= 5;
plugin.storage.showTimestamp ??= true;
plugin.storage.listeningTo ??= true;
plugin.storage.ignoreSpotify ??= true;
plugin.storage.verboseLogging ??= false;
plugin.storage.service ??= "lastfm";
plugin.storage.librefmUsername ??= "";
plugin.storage.librefmApiKey ??= "";
plugin.storage.listenbrainzUsername ??= "";
plugin.storage.listenbrainzToken ??= "";
plugin.storage.addToSidebar ??= false;
plugin.storage.showLargeText ??= true;
plugin.storage.showLargeText ??= true;

const get = (k: string, fallback?: any) => plugin.storage[k] ?? fallback;
const set = (k: string, v: any) => (plugin.storage[k] = v);

// Last.fm Settings Page
function LastFmSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const testConnection = async () => {
    showToast("Testing Last.fm connection...", getAssetIDByName("ClockIcon"));
    try {
      const isValid = await serviceFactory.testService("lastfm");
      if (isValid) {
        showToast(
          "✅ Last.fm connection successful!",
          getAssetIDByName("CheckIcon"),
        );
      } else {
        showToast("❌ Last.fm connection failed", getAssetIDByName("XIcon"));
      }
    } catch (error) {
      showToast("❌ Connection error", getAssetIDByName("XIcon"));
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Credentials">
          <Stack spacing={4}>
            <TextInput
              placeholder="Last.fm Username"
              value={get("username")}
              onChange={(v: string) => {
                set("username", v);
                forceUpdate();
              }}
              isClearable
            />
            <TextInput
              placeholder="Last.fm API Key"
              value={get("apiKey")}
              onChange={(v: string) => {
                set("apiKey", v);
                forceUpdate();
              }}
              secureTextEntry={true}
              isClearable
            />
          </Stack>
        </TableRowGroup>

        <TableRowGroup title="Actions">
          <TableRow
            label="Test Connection"
            subLabel="Verify your Last.fm credentials"
            trailing={<TableRow.Arrow />}
            onPress={testConnection}
          />
          <TableRow
            label="Get API Key"
            subLabel="Create a Last.fm API key at last.fm/api/account/create"
            trailing={<TableRow.Arrow />}
            onPress={async () => {
              try {
                await Linking.openURL("https://www.last.fm/api/account/create");
              } catch (error) {
                console.error("Failed to open Last.fm API URL:", error);
                showToast(
                  "Failed to open web browser. Please visit: https://www.last.fm/api/account/create",
                  getAssetIDByName("XIcon"),
                );
              }
            }}
          />
        </TableRowGroup>
      </Stack>
      <RN.View style={{ height: 64 }} />
    </ScrollView>
  );
}

// Libre.fm Settings Page
function LibreFmSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const testConnection = async () => {
    showToast("Testing Libre.fm connection...", getAssetIDByName("ClockIcon"));
    try {
      const isValid = await serviceFactory.testService("librefm");
      if (isValid) {
        showToast(
          "✅ Libre.fm connection successful!",
          getAssetIDByName("CheckIcon"),
        );
      } else {
        showToast("❌ Libre.fm connection failed", getAssetIDByName("XIcon"));
      }
    } catch (error) {
      showToast("❌ Connection error", getAssetIDByName("XIcon"));
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Credentials">
          <Stack spacing={4}>
            <TextInput
              placeholder="Libre.fm Username"
              value={get("librefmUsername")}
              onChange={(v: string) => {
                set("librefmUsername", v);
                forceUpdate();
              }}
              isClearable
            />
            <TextInput
              placeholder="Libre.fm API Key"
              value={get("librefmApiKey")}
              onChange={(v: string) => {
                set("librefmApiKey", v);
                forceUpdate();
              }}
              secureTextEntry={true}
              isClearable
            />
          </Stack>
        </TableRowGroup>

        <TableRowGroup title="Actions">
          <TableRow
            label="Test Connection"
            subLabel="Verify your Libre.fm credentials"
            trailing={<TableRow.Arrow />}
            onPress={testConnection}
          />
          <TableRow
            label="Get API Key"
            subLabel="Create a Last.fm API key (compatible with Libre.fm)"
            trailing={<TableRow.Arrow />}
            onPress={async () => {
              try {
                await Linking.openURL("https://www.last.fm/api/account/create");
              } catch (error) {
                console.error("Failed to open Last.fm API URL:", error);
                showToast(
                  "Failed to open web browser. Please visit: https://www.last.fm/api/account/create",
                  getAssetIDByName("XIcon"),
                );
              }
            }}
          />
        </TableRowGroup>
      </Stack>
      <RN.View style={{ height: 64 }} />
    </ScrollView>
  );
}

// ListenBrainz Settings Page
function ListenBrainzSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const testConnection = async () => {
    showToast(
      "Testing ListenBrainz connection...",
      getAssetIDByName("ClockIcon"),
    );
    try {
      const isValid = await serviceFactory.testService("listenbrainz");
      if (isValid) {
        showToast(
          "✅ ListenBrainz connection successful!",
          getAssetIDByName("CheckIcon"),
        );
      } else {
        showToast(
          "❌ ListenBrainz connection failed",
          getAssetIDByName("XIcon"),
        );
      }
    } catch (error) {
      showToast("❌ Connection error", getAssetIDByName("XIcon"));
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Credentials">
          <Stack spacing={4}>
            <TextInput
              placeholder="ListenBrainz Username"
              value={get("listenbrainzUsername")}
              onChange={(v: string) => {
                set("listenbrainzUsername", v);
                forceUpdate();
              }}
              isClearable
            />
            <TextInput
              placeholder="ListenBrainz Token (for private profiles)"
              value={get("listenbrainzToken")}
              onChange={(v: string) => {
                set("listenbrainzToken", v);
                forceUpdate();
              }}
              secureTextEntry={true}
              isClearable
            />
          </Stack>
        </TableRowGroup>

        <TableRowGroup title="Actions">
          <TableRow
            label="Test Connection"
            subLabel="Verify your ListenBrainz credentials"
            trailing={<TableRow.Arrow />}
            onPress={testConnection}
          />
          <TableRow
            label="Get User Token"
            subLabel="Get your ListenBrainz user token at listenbrainz.org/settings/"
            trailing={<TableRow.Arrow />}
            onPress={async () => {
              try {
                await Linking.openURL("https://listenbrainz.org/settings/");
              } catch (error) {
                console.error(
                  "Failed to open ListenBrainz settings URL:",
                  error,
                );
                showToast(
                  "Failed to open web browser. Please visit: https://listenbrainz.org/settings/",
                  getAssetIDByName("XIcon"),
                );
              }
            }}
          />
        </TableRowGroup>
      </Stack>
      <RN.View style={{ height: 64 }} />
    </ScrollView>
  );
}

// Display Settings Page
function DisplaySettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Activity Display">
          <Stack spacing={4}>
            <TextInput
              placeholder={`App Name (Default: ${Constants.DEFAULT_SETTINGS.appName})`}
              value={get("appName", Constants.DEFAULT_SETTINGS.appName)}
              onChange={(v: string) => {
                set("appName", v);
                forceUpdate();
              }}
              isClearable
            />
            <TextInput
              placeholder={`Update Interval (Default: ${Constants.DEFAULT_SETTINGS.timeInterval}s)`}
              value={String(
                get("timeInterval", Constants.DEFAULT_SETTINGS.timeInterval),
              )}
              onChange={(v: string) => {
                const interval = Number(v);
                if (interval >= Constants.MIN_UPDATE_INTERVAL) {
                  set("timeInterval", interval);
                  forceUpdate();
                }
              }}
              keyboardType="numeric"
              isClearable
            />
          </Stack>
        </TableRowGroup>

        <TableRowGroup title="Activity Options">
          <TableSwitchRow
            label="Show as Listening"
            subLabel="Display as 'Listening to' instead of 'Playing'"
            value={get("listeningTo", Constants.DEFAULT_SETTINGS.listeningTo)}
            onValueChange={(value: boolean) => {
              set("listeningTo", value);
              forceUpdate();
            }}
          />
          <TableSwitchRow
            label="Show Tooltip Text"
            subLabel="Show album name and/or track duration in Discord activity tooltip"
            value={get("showLargeText", true)}
            onValueChange={(value: boolean) => {
              set("showLargeText", value);
              forceUpdate();
            }}
          />
          <TableSwitchRow
            label="Show Timestamp"
            subLabel="Display track progress and duration"
            value={get(
              "showTimestamp",
              Constants.DEFAULT_SETTINGS.showTimestamp,
            )}
            onValueChange={(value: boolean) => {
              set("showTimestamp", value);
              forceUpdate();
            }}
          />
          <TableSwitchRow
            label="Ignore Spotify"
            subLabel="Don't show activity when Spotify is playing"
            value={get(
              "ignoreSpotify",
              Constants.DEFAULT_SETTINGS.ignoreSpotify,
            )}
            onValueChange={(value: boolean) => {
              set("ignoreSpotify", value);
              forceUpdate();
            }}
          />
          <TableSwitchRow
            label="Ignore YouTube Music"
            subLabel="Don't show activity when YouTube Music is playing (PC client)"
            value={get(
              "ignoreYouTubeMusic",
              Constants.DEFAULT_SETTINGS.ignoreYouTubeMusic,
            )}
            onValueChange={(value: boolean) => {
              set("ignoreYouTubeMusic", value);
              forceUpdate();
            }}
          />
          <TableSwitchRow
            label="Ignore Kizzy"
            subLabel="Don't show activity when Kizzy is playing"
            value={get("ignoreKizzy", Constants.DEFAULT_SETTINGS.ignoreKizzy)}
            onValueChange={(value: boolean) => {
              set("ignoreKizzy", value);
              forceUpdate();
            }}
          />
          <TableSwitchRow
            label="Ignore Metrolist"
            subLabel="Don't show activity when Metrolist is playing"
            value={get(
              "ignoreMetrolist",
              Constants.DEFAULT_SETTINGS.ignoreMetrolist,
            )}
            onValueChange={(value: boolean) => {
              set("ignoreMetrolist", value);
              forceUpdate();
            }}
          />
        </TableRowGroup>
      </Stack>
      <RN.View style={{ height: 64 }} />
    </ScrollView>
  );
}

// Logging Settings Page
function LoggingSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Logging Options">
          <TableSwitchRow
            label="Verbose Logging"
            subLabel="Enable detailed console logging for debugging"
            value={get(
              "verboseLogging",
              Constants.DEFAULT_SETTINGS.verboseLogging,
            )}
            onValueChange={(value: boolean) => {
              set("verboseLogging", value);
              forceUpdate();
            }}
          />
        </TableRowGroup>

        <TableRowGroup title="Debug Information">
          <TableRow
            label="Console Logging"
            subLabel="Logs are written to the browser/app console when verbose is enabled"
          />
          <TableRow
            label="Error Tracking"
            subLabel="Connection errors and API failures are automatically logged"
          />
        </TableRowGroup>

        <TableRowGroup title="Log Information">
          <TableRow
            label="API Calls"
            subLabel="All API requests are logged when verbose is enabled"
          />
          <TableRow
            label="Track Updates"
            subLabel="Song changes and RPC updates are logged"
          />
          <TableRow
            label="Error Details"
            subLabel="Connection errors and retries are logged"
          />
        </TableRowGroup>
      </Stack>
      <RN.View style={{ height: 64 }} />
    </ScrollView>
  );
}

// Main Settings Page
export default function Settings() {
  useProxy(plugin.storage);
  const navigation = NavigationNative.useNavigation();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const currentService = get("service") as ServiceType;

  const getCredentialStatus = (service: ServiceType) => {
    switch (service) {
      case "lastfm": {
        return get("username") && get("apiKey")
          ? "✅ Configured"
          : "❌ Missing credentials";
      }
      case "librefm": {
        return get("librefmUsername") && get("librefmApiKey")
          ? "✅ Configured"
          : "❌ Missing credentials";
      }
      case "listenbrainz": {
        return get("listenbrainzUsername")
          ? "✅ Configured"
          : "❌ Missing username";
      }
      default:
        return "❓ Unknown";
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        {/* Service Selection */}
        <TableRowGroup title="Active Service">
          <TableRow
            label="Current Service"
            subLabel={
              currentService
                ? `Using: ${serviceFactory.getServiceDisplayName(currentService)}`
                : "No service selected"
            }
          />
          {(["lastfm", "librefm", "listenbrainz"] as ServiceType[]).map(
            (service) => (
              <TableSwitchRow
                key={service}
                label={serviceFactory.getServiceDisplayName(service)}
                subLabel={getCredentialStatus(service)}
                value={currentService === service}
                onValueChange={(value: boolean) => {
                  if (value && service !== currentService) {
                    set("service", service);
                    forceUpdate();
                  }
                }}
              />
            ),
          )}
        </TableRowGroup>

        {/* Service Configuration */}
        <TableRowGroup title="Service Configuration">
          <TableRow
            label="Last.fm Settings"
            subLabel="Configure Last.fm credentials and options"
            trailing={<TableRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Last.fm Settings",
                render: LastFmSettingsPage,
              })
            }
          />
          <TableRow
            label="Libre.fm Settings"
            subLabel="Configure Libre.fm credentials and options"
            trailing={<TableRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Libre.fm Settings",
                render: LibreFmSettingsPage,
              })
            }
          />
          <TableRow
            label="ListenBrainz Settings"
            subLabel="Configure ListenBrainz credentials and options"
            trailing={<TableRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "ListenBrainz Settings",
                render: ListenBrainzSettingsPage,
              })
            }
          />
        </TableRowGroup>

        {/* Plugin Configuration */}
        <TableRowGroup title="Plugin Configuration">
          <TableRow
            label="Display Settings"
            subLabel="Customize how music activity appears"
            trailing={<TableRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Display Settings",
                render: DisplaySettingsPage,
              })
            }
          />
          <TableRow
            label="Logging Settings"
            subLabel="Configure logging and debugging options"
            trailing={<TableRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Logging Settings",
                render: LoggingSettingsPage,
              })
            }
          />
          <TableSwitchRow
            label="Add to Sidebar"
            subLabel="Show plugin in Discord settings"
            value={false}
          />
        </TableRowGroup>

        {/* About */}
        <TableRowGroup title="About">
          <TableRow
            label="Multi Scrobbler"
            subLabel="Show off your music status from multiple services"
          />
          <TableRow label="Author" subLabel="kmmiio99o" />
          <TableRow label="Version" subLabel="1.2.0" />
        </TableRowGroup>
      </Stack>
      <RN.View style={{ height: 64 }} />
    </ScrollView>
  );
}
