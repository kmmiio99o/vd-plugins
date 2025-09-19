import { plugin } from "@vendetta";
import { Forms } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { React } from "@vendetta/metro/common";
import { ScrollView, View, Linking } from "react-native";
import { changelog, currentVersion } from "../../changelog";
import { findByProps } from "@vendetta/metro";

const { TableRowGroup, TableSwitchRow, Stack, TableRow } = findByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "Stack",
  "TableRow",
);
const { TextInput } = findByProps("TextInput");

import { currentSettings, pluginState } from "../..";
import Constants from "../../constants";
import { initialize } from "../../manager";
import { lastfmClient } from "../../utils/lastfm";

export default function Settings() {
  useProxy(currentSettings);

  const [loading, setLoading] = React.useState(false);

  const saveSettings = (key: string, value: any) => {
    currentSettings[key] = value;
    plugin.storage[key] = value;
  };

  const testConnection = async () => {
    if (!currentSettings.username || !currentSettings.apiKey) {
      showToast(
        "Please enter both username and API key",
        getAssetIDByName("Small"),
      );
      return;
    }

    setLoading(true);
    try {
      await lastfmClient.fetchLatestScrobble();
      showToast("Connection successful!", getAssetIDByName("Check"));
      await initialize();
    } catch (error) {
      showToast(
        `Connection failed: ${error.message}`,
        getAssetIDByName("Small"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Account Settings">
          <Stack spacing={4}>
            <TextInput
              placeholder="Last.fm Username"
              value={currentSettings.username}
              onChange={(v: string) => saveSettings("username", v)}
              isClearable
            />
            <TextInput
              placeholder="API Key"
              value={currentSettings.apiKey}
              onChange={(v: string) => saveSettings("apiKey", v)}
              secureTextEntry={true}
              isClearable
            />
            <TableRow
              label="Get API Key"
              subLabel="https://www.last.fm/api/"
              onPress={() => Linking.openURL("https://www.last.fm/api/")}
            />
          </Stack>
          <TableRow
            label="Test Connection"
            trailing={loading ? <TableRow.Arrow loading /> : <TableRow.Arrow />}
            onPress={testConnection}
            disabled={loading}
          />
        </TableRowGroup>

        <TableRowGroup title="Display Settings">
          <Stack spacing={4}>
            <TextInput
              placeholder={`App Name (Default: ${Constants.DEFAULT_SETTINGS.appName})`}
              value={currentSettings.appName}
              onChange={(v: string) => saveSettings("appName", v)}
              isClearable
            />
            <TextInput
              placeholder={`Update Interval (Default: ${Constants.DEFAULT_SETTINGS.timeInterval}s)`}
              value={String(currentSettings.timeInterval)}
              onChange={(v: string) => {
                const interval = Number(v);
                if (interval >= Constants.MIN_UPDATE_INTERVAL) {
                  saveSettings("timeInterval", interval);
                } else {
                  showToast(
                    `Minimum interval is ${Constants.MIN_UPDATE_INTERVAL} seconds`,
                    getAssetIDByName("Small"),
                  );
                }
              }}
              keyboardType="numeric"
              isClearable
            />
          </Stack>
        </TableRowGroup>

        <TableRowGroup title="Options">
          <TableSwitchRow
            label="Show 'Listening to' instead of 'Playing'"
            value={
              currentSettings.listeningTo ??
              Constants.DEFAULT_SETTINGS.listeningTo
            }
            onValueChange={(value: boolean) =>
              saveSettings("listeningTo", value)
            }
          />
          <TableSwitchRow
            label="Show Timestamp"
            value={
              currentSettings.showTimestamp ??
              Constants.DEFAULT_SETTINGS.showTimestamp
            }
            onValueChange={(value: boolean) =>
              saveSettings("showTimestamp", value)
            }
          />
          <TableSwitchRow
            label="Ignore when Spotify is playing"
            value={
              currentSettings.ignoreSpotify ??
              Constants.DEFAULT_SETTINGS.ignoreSpotify
            }
            onValueChange={(value: boolean) =>
              saveSettings("ignoreSpotify", value)
            }
          />
          <TableSwitchRow
            label="Verbose Logging"
            value={
              currentSettings.verboseLogging ??
              Constants.DEFAULT_SETTINGS.verboseLogging
            }
            onValueChange={(value: boolean) =>
              saveSettings("verboseLogging", value)
            }
          />
        </TableRowGroup>

        <TableRowGroup title="Plugin Status">
          <TableRow
            label="Status"
            subLabel={pluginState.pluginStopped ? "Stopped" : "Running"}
          />
          <TableRow
            label="Last Update"
            subLabel={pluginState.lastTrackUrl ? "Success" : "No track data"}
          />
        </TableRowGroup>

        <TableRowGroup title="About">
          <TableRow label="Version" subLabel={currentVersion} />
          <TableRow
            label="View Changelog"
            trailing={<TableRow.Arrow />}
            onPress={() => {
              Linking.openURL(Constants.GITHUB_COMMITS_URL);
            }}
          />
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}
