import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";

import { currentSettings, pluginState } from ".";
import { Activity } from "../../defs";
import Constants from "./constants";
import { SelfPresenceStore } from "./modules";
import { clearActivity, fetchAsset, sendRequest } from "./utils/activity";
import { setDebugInfo } from "./utils/debug";
import { lastfmClient } from "./utils/lastfm";

enum ActivityType {
  PLAYING = 0,
  STREAMING = 1,
  LISTENING = 2,
  COMPETING = 5,
}

const verboseLog = (...message: any[]) =>
  currentSettings.verboseLogging && console.log("[Last.fm]", ...message);

class PluginManager {
  private static instance: PluginManager;
  private updateTimer?: NodeJS.Timer;
  private reconnectTimer?: NodeJS.Timer;
  private consecutiveFailures: number = 0;
  private isReconnecting: boolean = false;

  private constructor() {}

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  /**
   * Updates the Discord activity with the current Last.fm track
   */
  private async updateActivity() {
    if (pluginState.pluginStopped) {
      verboseLog("Plugin is stopped, skipping update");
      this.stopUpdates();
      return;
    }

    verboseLog("Fetching last track...");

    try {
      if (!currentSettings.username || !currentSettings.apiKey) {
        throw new Error("Username or API key not set");
      }

      if (currentSettings.ignoreSpotify) {
        const spotifyActivity = SelfPresenceStore.findActivity(
          (act) => act.sync_id,
        );
        if (spotifyActivity) {
          verboseLog("Spotify is currently playing, clearing activity");
          setDebugInfo("isSpotifyIgnored", true);
          clearActivity();
          return;
        }
        setDebugInfo("isSpotifyIgnored", false);
      }

      const lastTrack = await lastfmClient.fetchLatestScrobble();
      setDebugInfo("lastTrack", lastTrack);

      if (!lastTrack.nowPlaying) {
        verboseLog("Last track is not currently playing");
        clearActivity();
        return;
      }

      if (pluginState.lastTrackUrl === lastTrack.url) {
        verboseLog("Track hasn't changed");
        return;
      }

      const activity: Activity = {
        name: currentSettings.appName || Constants.DEFAULT_APP_NAME,
        flags: 2,
        type: currentSettings.listeningTo
          ? ActivityType.LISTENING
          : ActivityType.PLAYING,
        details: lastTrack.name,
        state: `by ${lastTrack.artist}`,
        status_display_type: 1,
        application_id: Constants.APPLICATION_ID,
      };

      // Handle dynamic app name
      if (activity.name.includes("{{")) {
        for (const key in lastTrack) {
          activity.name = activity.name.replace(
            `{{${key}}}`,
            lastTrack[key as keyof typeof lastTrack] || "",
          );
        }
      }

      // Set timestamps if enabled
      // Use `from` and `to` from track.getInfo
      if (currentSettings.showTimestamp && typeof lastTrack.from === "number") {
        activity.timestamps = {
          start: lastTrack.from * 1000,
          ...(typeof lastTrack.to === "number" && { end: lastTrack.to * 1000 }),
        };
      }

      // Handle album art
      if (lastTrack.album) {
        const asset = await fetchAsset([lastTrack.albumArt]);
        if (asset[0]) {
          activity.assets = {
            large_image: asset[0],
            large_text: `on ${lastTrack.album}`,
          };
        }
      }

      verboseLog("Setting activity:", activity);
      setDebugInfo("lastActivity", activity);

      await sendRequest(activity);
      pluginState.lastTrackUrl = lastTrack.url;
      pluginState.lastActivity = activity;
      this.consecutiveFailures = 0;

      verboseLog("Activity set successfully!");
    } catch (error) {
      console.error("[Last.fm] Update error:", error);
      this.handleError(error);
    }
  }

  private handleError(error: Error) {
    this.consecutiveFailures++;
    setDebugInfo("lastError", error);

    if (this.consecutiveFailures >= Constants.MAX_RETRY_ATTEMPTS) {
      verboseLog(
        `Failed ${this.consecutiveFailures} times, initiating reconnection...`,
      );
      this.startReconnection();
    }
  }

  private startReconnection() {
    if (this.isReconnecting) return;

    this.isReconnecting = true;
    this.stopUpdates();

    verboseLog("Starting reconnection process");
    this.reconnectTimer = setInterval(() => {
      verboseLog("Attempting to reconnect...");
      this.initialize()
        .then(() => {
          verboseLog("Reconnection successful");
          this.stopReconnection();
        })
        .catch((error) => {
          verboseLog("Reconnection failed:", error);
        });
    }, Constants.RETRY_DELAY);
  }

  private stopReconnection() {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.isReconnecting = false;
    this.consecutiveFailures = 0;
  }

  /**
   * Stops all update and reconnection timers
   */
  private stopUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }

  /**
   * Initializes the plugin and starts the update loop
   */
  public async initialize() {
    if (pluginState.pluginStopped) {
      throw new Error("Plugin is stopped");
    }

    this.stopUpdates();
    await this.updateActivity();

    const interval = Math.max(
      (Number(currentSettings.timeInterval) ||
        Constants.DEFAULT_SETTINGS.timeInterval) * 1000,
      Constants.MIN_UPDATE_INTERVAL * 1000,
    );

    this.updateTimer = setInterval(() => this.updateActivity(), interval);
    verboseLog(`Update timer started with interval: ${interval}ms`);
  }

  /**
   * Stops the plugin and cleans up
   */
  public stop() {
    pluginState.pluginStopped = true;
    this.stopUpdates();
    this.stopReconnection();
    clearActivity();
  }
}

// Export singleton instance methods
const manager = PluginManager.getInstance();
export const initialize = () => manager.initialize();
export const stop = () => manager.stop();
