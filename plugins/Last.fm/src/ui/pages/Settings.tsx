import { plugin } from "@vendetta";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { React } from "@vendetta/metro/common";
import { View, Linking } from "react-native";
import { changelog, currentVersion } from "../../changelog";
import { findByProps } from "@vendetta/metro";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableSwitchRow, Stack, TableRow } = findByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "Stack",
  "TableRow",
);
const { TextInput } = findByProps("TextInput");
const { FormText } = findByProps("FormText");

import { currentSettings, pluginState } from "../..";
import Constants from "../../constants";
import { initialize } from "../../manager";
import { lastfmClient } from "../../utils/lastfm";

const get = (k: string, fallback: any = "") => plugin.storage[k] ?? fallback;
const set = (k: string, v: any) => (plugin.storage[k] = v);

// Define the Settings component
export default function Settings() {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  const update = () => forceUpdate();

  const [loading, setLoading] = React.useState(false);

  const testConnection = async () => {
    const username = get("username");
    const apiKey = get("apiKey");

    if (!username || !apiKey) {
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
              value={get("username")}
              onChange={(v: string) => {
                set("username", v);
                update();
              }}
              isClearable
            />
            <TextInput
              placeholder="API Key"
              value={get("apiKey")}
              onChange={(v: string) => {
                set("apiKey", v);
                update();
              }}
              secureTextEntry={true}
              isClearable
            />
            <TableRow
              label="Get API Key"
              subLabel="https://www.last.fm/api/account/create"
              onPress={() =>
                Linking.openURL("https://www.last.fm/api/account/create")
              }
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
              value={get("appName", Constants.DEFAULT_SETTINGS.appName)}
              onChange={(v: string) => {
                set("appName", v);
                update();
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
                  update();
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
            value={get("listeningTo", Constants.DEFAULT_SETTINGS.listeningTo)}
            onValueChange={(value: boolean) => {
              set("listeningTo", value);
              update();
            }}
          />
          <TableSwitchRow
            label="Show Timestamp"
            value={get(
              "showTimestamp",
              Constants.DEFAULT_SETTINGS.showTimestamp,
            )}
            onValueChange={(value: boolean) => {
              set("showTimestamp", value);
              update();
            }}
          />
          <TableSwitchRow
            label="Ignore when Spotify is playing"
            value={get(
              "ignoreSpotify",
              Constants.DEFAULT_SETTINGS.ignoreSpotify,
            )}
            onValueChange={(value: boolean) => {
              set("ignoreSpotify", value);
              update();
            }}
          />
          <TableSwitchRow
            label="Verbose Logging"
            value={get(
              "verboseLogging",
              Constants.DEFAULT_SETTINGS.verboseLogging,
            )}
            onValueChange={(value: boolean) => {
              set("verboseLogging", value);
              update();
            }}
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

        {/* Changelog Section */}
        <TableRowGroup title="Changelog">
          {changelog.map((entry, index) => (
            <TableRow
              key={index}
              label={`v${entry.version} (${entry.date})`}
              subLabel={entry.changes.join(", ")}
            />
          ))}
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}
