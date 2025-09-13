import { plugin } from "@vendetta";
import { Forms } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { React } from "@vendetta/metro/common";
import { ScrollView, View, Linking } from "react-native";
import { changelog, currentVersion } from "../../changelog";

import { currentSettings, pluginState } from "../..";
import Constants from "../../constants";
import { initialize } from "../../manager";
import { lastfmClient } from "../../utils/lastfm";

const { FormInput, FormRow, FormSwitch, FormSection, FormDivider, FormText } =
  Forms;

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
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      bounces={false}
      showsVerticalScrollIndicator={true}
    >
      <FormSection title="Account Settings">
        <FormInput
          title="Last.fm Username"
          placeholder="Enter your Last.fm username"
          value={currentSettings.username}
          onChange={(value: string) => saveSettings("username", value)}
        />
        <FormDivider />
        <FormInput
          title="API Key"
          placeholder="Enter your Last.fm API key"
          value={currentSettings.apiKey}
          onChange={(value: string) => saveSettings("apiKey", value)}
          secureTextEntry={true}
        />
        <FormText style={{ padding: 10, opacity: 0.5 }}>
          Get your API key at: https://www.last.fm/api/account/create
        </FormText>
        <FormRow
          label="Test Connection"
          leading={<FormRow.Icon source={getAssetIDByName("ic_connection")} />}
          trailing={loading ? <FormRow.Arrow loading /> : <FormRow.Arrow />}
          onPress={testConnection}
          disabled={loading}
        />
      </FormSection>

      <FormSection title="Display Settings">
        <FormInput
          title="App Name"
          placeholder={Constants.DEFAULT_SETTINGS.appName}
          value={currentSettings.appName}
          onChange={(value: string) => saveSettings("appName", value)}
        />
        <FormDivider />
        <FormInput
          title="Update Interval (seconds)"
          placeholder={String(Constants.DEFAULT_SETTINGS.timeInterval)}
          value={String(currentSettings.timeInterval)}
          onChange={(value: string) => {
            const interval = Number(value);
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
        />
      </FormSection>

      <FormSection title="Options">
        <FormRow
          label="Show 'Listening to' instead of 'Playing'"
          leading={<FormRow.Icon source={getAssetIDByName("ic_music")} />}
          trailing={
            <FormSwitch
              value={
                currentSettings.listeningTo ??
                Constants.DEFAULT_SETTINGS.listeningTo
              }
              onValueChange={(value: boolean) =>
                saveSettings("listeningTo", value)
              }
            />
          }
        />
        <FormDivider />
        <FormRow
          label="Show Timestamp"
          leading={<FormRow.Icon source={getAssetIDByName("ic_timeline")} />}
          trailing={
            <FormSwitch
              value={
                currentSettings.showTimestamp ??
                Constants.DEFAULT_SETTINGS.showTimestamp
              }
              onValueChange={(value: boolean) =>
                saveSettings("showTimestamp", value)
              }
            />
          }
        />
        <FormDivider />
        <FormRow
          label="Ignore when Spotify is playing"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_spotify_white_24px")} />
          }
          trailing={
            <FormSwitch
              value={
                currentSettings.ignoreSpotify ??
                Constants.DEFAULT_SETTINGS.ignoreSpotify
              }
              onValueChange={(value: boolean) =>
                saveSettings("ignoreSpotify", value)
              }
            />
          }
        />
        <FormDivider />
        <FormRow
          label="Verbose Logging"
          leading={
            <FormRow.Icon source={getAssetIDByName("ic_message_copy")} />
          }
          trailing={
            <FormSwitch
              value={
                currentSettings.verboseLogging ??
                Constants.DEFAULT_SETTINGS.verboseLogging
              }
              onValueChange={(value: boolean) =>
                saveSettings("verboseLogging", value)
              }
            />
          }
        />
      </FormSection>

      <FormSection title="Plugin Status">
        <View style={{ padding: 10 }}>
          <FormText style={{ marginBottom: 4 }}>
            Status: {pluginState.pluginStopped ? "Stopped" : "Running"}
          </FormText>
          <FormText>
            Last Update:{" "}
            {pluginState.lastTrackUrl ? "Success" : "No track data"}
          </FormText>
        </View>
      </FormSection>

      <FormSection title="CHANGELOG">
        <FormRow
          label="View GitHub Commits"
          leading={<FormRow.Icon source={getAssetIDByName("ic_history")} />}
          trailing={<FormRow.Arrow />}
          onPress={() => {
            Linking.openURL(Constants.GITHUB_COMMITS_URL);
          }}
        />
        <FormDivider />
        {changelog.map((entry, index) => (
          <View
            key={index}
            style={{
              padding: 10,
              borderBottomWidth: index === changelog.length - 1 ? 0 : 0.5,
              borderBottomColor: "#292929",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <FormText style={{ fontWeight: "bold" }}>
                Version {entry.version}
              </FormText>
              <FormText style={{ opacity: 0.5 }}>{entry.date}</FormText>
            </View>
            {entry.changes.map((change, changeIndex) => (
              <FormText
                key={changeIndex}
                style={{ marginLeft: 16, marginTop: 4, opacity: 0.8 }}
              >
                • {change}
              </FormText>
            ))}
          </View>
        ))}
      </FormSection>

      <FormText
        style={{
          padding: 16,
          opacity: 0.5,
          textAlign: "center",
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        Version {currentVersion}
      </FormText>
    </ScrollView>
  );
}
