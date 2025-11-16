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
plugin.storage.addToSidebar ??= true;
plugin.storage.showLargeText ??= true;
plugin.storage.ignoreList ??= [];
plugin.storage.showAlbumInTooltip ??= true;
plugin.storage.showDurationInTooltip ??= true;
// Removed: plugin.storage.showFallbackImage ??= false;

const get = (k: string, fallback?: any) => plugin.storage[k] ?? fallback;
const set = (k: string, v: any) => (plugin.storage[k] = v);

// RPC Preview Component
function RPCPreview() {
  useProxy(plugin.storage);
  const [previewTrack, setPreviewTrack] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentProgress, setCurrentProgress] = React.useState(0);

  React.useEffect(() => {
    const fetchPreviewData = async () => {
      if (!get("username") || !get("apiKey")) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Try to get recent tracks from Last.fm API
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${get("username")}&api_key=${get("apiKey")}&format=json&limit=1`,
        );
        const data = await response.json();

        if (
          data.recenttracks &&
          data.recenttracks.track &&
          data.recenttracks.track.length > 0
        ) {
          const track = data.recenttracks.track[0];

          // Try to get track info for duration
          let duration = 180; // Default 3 minutes
          try {
            const trackInfoResponse = await fetch(
              `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${get("apiKey")}&artist=${encodeURIComponent(track.artist["#text"])}&track=${encodeURIComponent(track.name)}&format=json&username=${get("username")}`,
            );
            const trackInfo = await trackInfoResponse.json();
            if (trackInfo.track && trackInfo.track.duration) {
              duration = Math.floor(trackInfo.track.duration / 1000); // Convert ms to seconds
            }
          } catch (error) {
            console.log("Could not fetch track duration, using default");
          }

          setPreviewTrack({
            name: track.name || "Unknown Track",
            artist: track.artist?.["#text"] || "Unknown Artist",
            album: track.album?.["#text"] || "Unknown Album",
            image:
              track.image?.[2]?.["#text"] ||
              track.image?.[1]?.["#text"] ||
              null,
            nowPlaying: track["@attr"]?.nowplaying === "true",
            duration: duration,
            startTime:
              track["@attr"]?.nowplaying === "true"
                ? Math.floor(Date.now() / 1000) - 60
                : null, // Simulate 1 minute progress for now playing
          });
        }
      } catch (error) {
        console.error("Failed to fetch preview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviewData();
  }, [get("username"), get("apiKey")]);

  // Update progress for now playing tracks
  React.useEffect(() => {
    if (!previewTrack?.nowPlaying || !get("showTimestamp")) {
      return;
    }

    const interval = setInterval(() => {
      if (previewTrack.startTime && previewTrack.duration) {
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - previewTrack.startTime;
        const progress = Math.min(elapsed / previewTrack.duration, 1);
        setCurrentProgress(progress);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [previewTrack, get("showTimestamp")]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPreviewText = () => {
    let text = "";

    if (get("showAlbumInTooltip") && previewTrack?.album) {
      text += `on ${previewTrack.album}`;
    }

    if (get("showDurationInTooltip") && previewTrack?.duration) {
      const durationText = ` • ${formatTime(previewTrack.duration)}`;
      if (text) {
        text += durationText;
      } else {
        text = formatTime(previewTrack.duration);
      }
    }

    return text || "No tooltip text";
  };

  const getCurrentProgressData = () => {
    if (!previewTrack?.duration) return { current: 0, total: 0, progress: 0 };

    if (previewTrack.nowPlaying) {
      const current = currentProgress * previewTrack.duration;
      return {
        current: current,
        total: previewTrack.duration,
        progress: currentProgress,
      };
    } else {
      // For non-now playing tracks, show 30% progress as example
      return {
        current: previewTrack.duration * 0.3,
        total: previewTrack.duration,
        progress: 0.3,
      };
    }
  };

  const activityType = get("listeningTo") ? "Listening to" : "Playing";
  const appName = get("appName", "Music");

  if (isLoading) {
    return (
      <RN.View
        style={{
          backgroundColor: "#2f3136",
          borderRadius: 8,
          padding: 16,
          marginHorizontal: 10,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "#40444b",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 120,
        }}
      >
        <RN.Text style={{ color: "#b9bbbe", fontSize: 14 }}>
          Loading preview from Last.fm...
        </RN.Text>
      </RN.View>
    );
  }

  if (!get("username") || !get("apiKey")) {
    return (
      <RN.View
        style={{
          backgroundColor: "#2f3136",
          borderRadius: 8,
          padding: 16,
          marginHorizontal: 10,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "#40444b",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 120,
        }}
      >
        <RN.Text
          style={{ color: "#b9bbbe", fontSize: 14, textAlign: "center" }}
        >
          Configure Last.fm credentials to see preview
        </RN.Text>
      </RN.View>
    );
  }

  if (!previewTrack) {
    return (
      <RN.View
        style={{
          backgroundColor: "#2f3136",
          borderRadius: 8,
          padding: 16,
          marginHorizontal: 10,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "#40444b",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 120,
        }}
      >
        <RN.Text
          style={{ color: "#b9bbbe", fontSize: 14, textAlign: "center" }}
        >
          No recent tracks found or error loading data
        </RN.Text>
      </RN.View>
    );
  }

  const progressData = getCurrentProgressData();

  return (
    <RN.View
      style={{
        backgroundColor: "#2f3136",
        borderRadius: 8,
        padding: 16,
        marginHorizontal: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#40444b",
      }}
    >
      {/* Activity Type Header - replaces "RPC Preview" */}
      <RN.View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <RN.Text
          style={{
            color: "#b9bbbe",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {activityType} {appName}
        </RN.Text>

        {/* Now Playing Indicator - subtle text instead of blue badge */}
        {previewTrack.nowPlaying && (
          <RN.Text
            style={{
              color: "#72767d",
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            RPC Preview
          </RN.Text>
        )}
      </RN.View>

      <RN.View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* Album Art */}
        <RN.View
          style={{
            width: 60,
            height: 60,
            backgroundColor: "#36393f",
            borderRadius: 4,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
            borderWidth: 1,
            borderColor: "#40444b",
            overflow: "hidden",
          }}
        >
          {previewTrack.image ? (
            <RN.Image
              source={{ uri: previewTrack.image }}
              style={{ width: 60, height: 60 }}
              resizeMode="cover"
            />
          ) : (
            <RN.Text
              style={{
                color: "#72767d",
                fontSize: 24,
              }}
            >
              🎵
            </RN.Text>
          )}
        </RN.View>

        <RN.View style={{ flex: 1 }}>
          {/* Track Name */}
          <RN.Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {previewTrack.name}
          </RN.Text>

          {/* Artist Name */}
          <RN.Text
            style={{
              color: "#b9bbbe",
              fontSize: 14,
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {previewTrack.artist}
          </RN.Text>

          {/* Tooltip Text */}
          {get("showLargeText") && getPreviewText() !== "No tooltip text" && (
            <RN.Text
              style={{
                color: "#72767d",
                fontSize: 12,
                fontStyle: "italic",
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {getPreviewText()}
            </RN.Text>
          )}

          {/* Timestamps */}
          {get("showTimestamp") && previewTrack.duration && (
            <RN.View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <RN.View
                style={{
                  flex: 1,
                  height: 4,
                  backgroundColor: "#36393f",
                  borderRadius: 2,
                  marginRight: 8,
                  overflow: "hidden",
                }}
              >
                <RN.View
                  style={{
                    width: `${progressData.progress * 100}%`,
                    height: 4,
                    backgroundColor: "#5865f2",
                    borderRadius: 2,
                  }}
                />
              </RN.View>
              <RN.Text
                style={{
                  color: "#72767d",
                  fontSize: 12,
                  minWidth: 70,
                  textAlign: "right",
                }}
              >
                {formatTime(progressData.current)} /{" "}
                {formatTime(progressData.total)}
              </RN.Text>
            </RN.View>
          )}
        </RN.View>
      </RN.View>
    </RN.View>
  );
}

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

        <TableRowGroup title="About Display Settings">
          <TableRow
            label="App Name"
            subLabel="The name shown in Discord for your activity"
          />
          <TableRow
            label="Update Interval"
            subLabel="How often the plugin checks for new tracks (in seconds)"
          />
          <TableRow
            label="Minimum Interval"
            subLabel={`The plugin will never check more frequently than ${Constants.MIN_UPDATE_INTERVAL} seconds`}
          />
        </TableRowGroup>
      </Stack>
      <RN.View style={{ height: 64 }} />
    </ScrollView>
  );
}

// RPC Customization Settings Page
function RPCCustomizationSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <RPCPreview />
      <Stack spacing={8}>
        <TableRowGroup title="RPC Display Options">
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
            subLabel="Show album name and track duration in Discord activity tooltip"
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
            label="Show Album in Tooltip"
            subLabel="Include album name in the tooltip text"
            value={get("showAlbumInTooltip", true)}
            onValueChange={(value: boolean) => {
              set("showAlbumInTooltip", value);
              forceUpdate();
            }}
          />
          <TableSwitchRow
            label="Show Duration in Tooltip"
            subLabel="Include track duration in the tooltip text"
            value={get("showDurationInTooltip", true)}
            onValueChange={(value: boolean) => {
              set("showDurationInTooltip", value);
              forceUpdate();
            }}
          />
        </TableRowGroup>
      </Stack>
      <RN.View style={{ height: 64 }} />
    </ScrollView>
  );
}

function IgnoreListSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const [newAppName, setNewAppName] = React.useState("");

  const addAppToIgnoreList = () => {
    if (!newAppName.trim()) {
      showToast("Please enter an app name", getAssetIDByName("Small"));
      return;
    }

    const ignoreList = get("ignoreList", []);
    if (!ignoreList.includes(newAppName.trim())) {
      set("ignoreList", [...ignoreList, newAppName.trim()]);
      setNewAppName("");
      forceUpdate();
      showToast("App added to ignore list", getAssetIDByName("Check"));
    } else {
      showToast("App already in ignore list", getAssetIDByName("Warning"));
    }
  };

  const removeAppFromIgnoreList = (appName: string) => {
    const ignoreList = get("ignoreList", []);
    set(
      "ignoreList",
      ignoreList.filter((app: string) => app !== appName),
    );
    forceUpdate();
    showToast("App removed from ignore list", getAssetIDByName("Check"));
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Add App to Ignore">
          <Stack spacing={4}>
            <TextInput
              placeholder="Enter app name"
              value={newAppName}
              onChange={setNewAppName}
              isClearable
              onSubmitEditing={addAppToIgnoreList}
              returnKeyType="done"
            />
          </Stack>
        </TableRowGroup>

        <TableRowGroup>
          <TableRow
            label="Add to Ignore List"
            subLabel="Add the current app name to your ignore list"
            trailing={<TableRow.Arrow />}
            onPress={addAppToIgnoreList}
          />
        </TableRowGroup>

        {get("ignoreList", []).length > 0 && (
          <TableRowGroup title="Ignored Apps">
            {get("ignoreList", []).map((appName: string, index: number) => (
              <TableRow
                key={index}
                label={appName}
                trailing={
                  <RN.TouchableOpacity
                    onPress={() => removeAppFromIgnoreList(appName)}
                    style={{
                      padding: 8,
                      backgroundColor: "#ff4d4d",
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <RN.Image
                      source={getAssetIDByName("TrashIcon")}
                      style={{ width: 14, height: 14, tintColor: "#ffffff" }}
                    />
                  </RN.TouchableOpacity>
                }
              />
            ))}
          </TableRowGroup>
        )}

        <TableRowGroup title="About Ignore List">
          <TableRow
            label="How it Works"
            subLabel="When any app in your ignore list is active, your music status will be hidden"
          />
          <TableRow
            label="Detection"
            subLabel="Apps are detected by their Discord activity name"
          />
          <TableRow
            label="Examples"
            subLabel="Spotify, YouTube Music, Kizzy, Metrolist, echo"
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
            subLabel="Customize app name and update interval"
            trailing={<TableRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Display Settings",
                render: DisplaySettingsPage,
              })
            }
          />
          <TableRow
            label="RPC Customization"
            subLabel="Customize Discord rich presence display options"
            trailing={<TableRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "RPC Customization",
                render: RPCCustomizationSettingsPage,
              })
            }
          />
          <TableRow
            label="Ignore List"
            subLabel="Configure apps that should hide your status"
            trailing={<TableRow.Arrow />}
            onPress={() =>
              navigation.push("VendettaCustomPage", {
                title: "Ignore List Settings",
                render: IgnoreListSettingsPage,
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
            value={get("addToSidebar", false)}
            onValueChange={(value: boolean) => {
              set("addToSidebar", value);
              forceUpdate();
            }}
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
