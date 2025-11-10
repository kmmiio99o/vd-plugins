import { currentSettings, pluginState } from ".";
import { Activity } from "../../defs";
import Constants from "./constants";
import { SelfPresenceStore } from "./modules";
import { clearActivity, fetchAsset, sendRequest } from "./utils/activity";
import {
  setDebugInfo,
  recordSuccessfulUpdate,
  recordServiceError,
  incrementApiCall,
} from "./utils/debug";
import { serviceFactory } from "./services/ServiceFactory";
import {
  formatDuration,
  validateTimestamps,
  getCurrentTimestamp,
} from "./utils/time";

enum ActivityType {
  PLAYING = 0,
  STREAMING = 1,
  LISTENING = 2,
  COMPETING = 5,
}

const log = (...message: any[]) => console.log("[Scrobble Plugin]", ...message);
const logError = (...message: any[]) =>
  console.error("[Scrobble Plugin] Error:", ...message);
const logVerbose = (...message: any[]) =>
  currentSettings.verboseLogging &&
  console.log("[Scrobble Plugin] Verbose:", ...message);

class PluginManager {
  private static instance: PluginManager;
  private updateTimer?: any;
  private reconnectTimer?: any;
  private consecutiveFailures = 0;
  private isReconnecting = false;
  private currentActivity?: Activity;
  private lastUpdateTime = 0;

  private constructor() {
    // singleton pattern
  }

  public static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  // Check for new tracks and update Discord status when something changes
  private async updateActivity() {
    if (pluginState.pluginStopped) {
      logVerbose("Plugin is stopped, skipping update");
      this.stopUpdates();
      return;
    }

    const serviceName = serviceFactory.getCurrentService().getServiceName();
    logVerbose(`Fetching latest track from ${serviceName}...`);

    // keep track of whether we actually need to update Discord
    let willUpdateRPC = false;

    try {
      // skip if Spotify is playing and user wants to ignore it
      if (currentSettings.ignoreSpotify) {
        const spotifyActivity = SelfPresenceStore.findActivity(
          (act) => act.sync_id,
        );
        if (spotifyActivity) {
          logVerbose("Spotify is currently playing, clearing activity");
          setDebugInfo("isSpotifyIgnored", true);
          clearActivity();
          return;
        }
        setDebugInfo("isSpotifyIgnored", false);
      }

      // skip if YouTube Music is playing and user wants to ignore it
      if (currentSettings.ignoreYouTubeMusic) {
        const youtubeActivity = SelfPresenceStore.findActivity(
          (act) =>
            act.name === "YouTube Music" ||
            act.application_id === "463097721130188830" ||
            (act.name && act.name.toLowerCase().includes("youtube music")),
        );
        if (youtubeActivity) {
          logVerbose("YouTube Music is currently playing, clearing activity");
          setDebugInfo("isYouTubeMusicIgnored", true);
          clearActivity();
          return;
        }
        setDebugInfo("isYouTubeMusicIgnored", false);
      }

      // skip if Kizzy is playing and user wants to ignore it
      if (currentSettings.ignoreKizzy) {
        const kizzyActivity = SelfPresenceStore.findActivity(
          (act) => act.name && act.name.toLowerCase() === "kizzy",
        );
        if (kizzyActivity) {
          logVerbose("Kizzy is currently playing, clearing activity");
          setDebugInfo("isKizzyIgnored", true);
          clearActivity();
          return;
        }
        setDebugInfo("isKizzyIgnored", false);
      }

      // skip if Metrolist is playing and user wants to ignore it
      if (currentSettings.ignoreMetrolist) {
        const metrolistActivity = SelfPresenceStore.findActivity(
          (act) => act.name && act.name.toLowerCase() === "metrolist",
        );
        if (metrolistActivity) {
          logVerbose("Metrolist is currently playing, clearing activity");
          setDebugInfo("isMetrolistIgnored", true);
          clearActivity();
          return;
        }
        setDebugInfo("isMetrolistIgnored", false);
      }

      incrementApiCall();
      const lastTrack = await serviceFactory
        .getCurrentService()
        .fetchLatestScrobble();
      setDebugInfo("lastTrack", lastTrack);

      if (!lastTrack.nowPlaying) {
        logVerbose("Track is not currently playing");
        clearActivity();
        return;
      }

      // use simple URL comparison like Last.fm plugin
      if (pluginState.lastTrackUrl === lastTrack.url) {
        logVerbose("Track hasn't changed");
        recordSuccessfulUpdate();
        this.consecutiveFailures = 0;
        return;
      }

      willUpdateRPC = true;

      log(`🎵 Track changed: ${lastTrack.artist} - ${lastTrack.name}`);

      // set up timestamps for the track
      let activityTimestamps;
      if (
        lastTrack.nowPlaying &&
        currentSettings.showTimestamp &&
        lastTrack.from
      ) {
        // figure out when this track actually started
        const now = getCurrentTimestamp();
        let startTime = lastTrack.from;

        // if the timestamp is way old, estimate when it started
        if (startTime < now - 3600) {
          // more than an hour old - probably wrong
          if (lastTrack.duration && lastTrack.duration > 0) {
            // guess we're about 10% in or 30 seconds, whatever's smaller
            const estimatedElapsed = Math.min(lastTrack.duration * 0.1, 30);
            startTime = now - estimatedElapsed;
          } else {
            startTime = now;
          }
          logVerbose("had to estimate start time");
        }

        activityTimestamps = {
          start: startTime * 1000, // Discord wants milliseconds
        };

        if (lastTrack.to) {
          activityTimestamps.end = lastTrack.to * 1000;
        }
      }

      logVerbose(
        `🎯 Preparing RPC update for: ${lastTrack.artist} - ${lastTrack.name}`,
      );

      const activity: Activity = {
        name: currentSettings.appName || Constants.DEFAULT_APP_NAME,
        flags: 0,
        type: currentSettings.listeningTo
          ? ActivityType.LISTENING
          : ActivityType.PLAYING,
        details: lastTrack.name,
        state: `${lastTrack.artist}`,
        status_display_type: 1,
        application_id: Constants.APPLICATION_ID,
      };

      // replace template variables in app name if user is using them
      if (activity.name.includes("{{")) {
        const variables = {
          artist: lastTrack.artist,
          name: lastTrack.name,
          album: lastTrack.album,
          service: serviceName,
        };

        for (const [key, value] of Object.entries(variables)) {
          activity.name = activity.name.replace(
            new RegExp(`{{${key}}}`, "g"),
            value || "",
          );
        }
      }

      // add the timestamps we figured out
      if (activityTimestamps) {
        activity.timestamps = activityTimestamps;

        logVerbose("Timestamps set:", {
          start: new Date(activityTimestamps.start).toISOString(),
          end: activityTimestamps.end
            ? new Date(activityTimestamps.end).toISOString()
            : "none",
          duration: lastTrack.duration
            ? formatDuration(lastTrack.duration)
            : "unknown",
        });
      }

      // set up album art and tooltip text
      if (lastTrack.album || lastTrack.albumArt) {
        const assetUrls = lastTrack.albumArt ? [lastTrack.albumArt] : [];
        const assets = await fetchAsset(assetUrls);

        if (assets[0]) {
          if (currentSettings.showLargeText) {
            const largeText = lastTrack.album
              ? `on ${lastTrack.album}`
              : `${lastTrack.artist} - ${lastTrack.name}`;

            const durationText =
              currentSettings.showTimestamp && lastTrack.duration
                ? ` • ${formatDuration(lastTrack.duration)}`
                : "";

            activity.assets = {
              large_image: assets[0],
              large_text: largeText + durationText,
            };
          } else {
            activity.assets = {
              large_image: assets[0],
            };
          }

          logVerbose("Album art set:", assets[0]);
        } else if (lastTrack.album) {
          activity.assets = currentSettings.showLargeText
            ? { large_text: `on ${lastTrack.album}` }
            : {};
        }
      }

      logVerbose("Setting Discord activity:", activity);
      setDebugInfo("lastActivity", activity);

      await sendRequest(activity);
      pluginState.lastTrackUrl = lastTrack.url;
      this.currentActivity = activity;
      pluginState.lastActivity = activity;
      this.consecutiveFailures = 0;
      this.lastUpdateTime = getCurrentTimestamp();
      recordSuccessfulUpdate();

      log(
        `✅ RPC updated successfully: ${lastTrack.artist} - ${lastTrack.name}`,
      );
    } catch (error) {
      logError("Update failed:", error);
      recordServiceError(currentSettings.service, (error as Error).message);
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error) {
    this.consecutiveFailures++;
    setDebugInfo("lastError", error);

    logError(
      `Failure ${this.consecutiveFailures}/${Constants.MAX_RETRY_ATTEMPTS}:`,
      error.message,
    );

    if (this.consecutiveFailures >= Constants.MAX_RETRY_ATTEMPTS) {
      logError("Max retry attempts reached, initiating reconnection...");
      this.startReconnection();
    }
  }

  private startReconnection() {
    if (this.isReconnecting) return;

    this.isReconnecting = true;
    this.stopUpdates();

    log("Starting reconnection process...");
    this.reconnectTimer = setInterval(() => {
      log("Attempting to reconnect...");
      this.initialize() // don't reset state
        .then(() => {
          log("Reconnection successful!");
          this.stopReconnection();
        })
        .catch((error) => {
          logError("Reconnection attempt failed:", error.message);
        });
    }, Constants.RETRY_DELAY);
  }

  private stopReconnection() {
    try {
      if (this.reconnectTimer) {
        clearInterval(this.reconnectTimer);
        this.reconnectTimer = undefined;
      }
      this.isReconnecting = false;
      this.consecutiveFailures = 0;
    } catch (error) {
      // Silently handle reconnection cleanup errors
      console.error("[Scrobble Plugin] Reconnection cleanup error:", error);
    }
  }

  // clean up all timers
  private stopUpdates() {
    try {
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = undefined;
      }
    } catch (error) {
      // Silently handle timer cleanup errors
      console.error("[Scrobble Plugin] Timer cleanup error:", error);
    }
  }

  // start everything up
  public async initialize() {
    if (pluginState.pluginStopped) {
      throw new Error("Plugin is stopped");
    }

    const serviceName = serviceFactory.getCurrentService().getServiceName();
    log(`Initializing with ${serviceName}...`);

    // make sure credentials work before starting
    try {
      const isValid = await serviceFactory.validateCurrentService();
      if (!isValid) {
        throw new Error(`Invalid credentials for ${serviceName}`);
      }
      log(`${serviceName} credentials validated successfully`);
    } catch (error) {
      logError(`Failed to validate ${serviceName} credentials:`, error);
      throw error;
    }

    this.stopUpdates();

    // check right away in case something is already playing
    log("🎵 checking for already playing songs...");
    // Don't reset track state - let updateActivity() handle whether to update
    await this.updateActivity();

    const interval = Math.max(
      (Number(currentSettings.timeInterval) ||
        Constants.DEFAULT_SETTINGS.timeInterval) * 1000,
      Constants.MIN_UPDATE_INTERVAL * 1000,
    );

    this.updateTimer = setInterval(() => this.updateActivity(), interval);
    log(
      `Update timer started with interval: ${interval}ms (${interval / 1000}s)`,
    );
  }

  // stop everything and clean up
  public stop() {
    if (pluginState.pluginStopped) {
      return; // already stopped
    }

    log("Stopping plugin...");
    pluginState.pluginStopped = true;

    try {
      this.stopUpdates();
      this.stopReconnection();
      clearActivity();
      // Don't reset track state on stop - only when actually switching services
      log("Plugin stopped successfully");
    } catch (error) {
      // don't let cleanup errors break things
      console.error("[Scrobble Plugin] Stop error:", error);
    }
  }

  // change to a different scrobble service
  public async switchService(newService: string) {
    if (pluginState.pluginStopped) {
      return;
    }

    log(`Switching to ${newService}...`);

    // stop what we're doing first
    const wasRunning = !pluginState.pluginStopped;
    this.stop();

    try {
      // clear cache so we get fresh service instances
      serviceFactory.clearCache();

      // Reset track state when switching services
      pluginState.lastTrackUrl = undefined;
      this.currentActivity = undefined;
      this.lastUpdateTime = 0;

      // start back up with the new service
      if (wasRunning) {
        pluginState.pluginStopped = false;
        await this.initialize();
      }
    } catch (error) {
      logError("Failed to switch service:", error);
    }
  }

  // get info about what's currently happening
  public getStatus() {
    const serviceName = serviceFactory.getCurrentService().getServiceName();
    return {
      running: !pluginState.pluginStopped,
      service: serviceName,
      consecutiveFailures: this.consecutiveFailures,
      isReconnecting: this.isReconnecting,
      lastTrackUrl: pluginState.lastTrackUrl,
      updateInterval: this.updateTimer ? "Active" : "Inactive",
    };
  }
}

// expose the manager functions
const manager = PluginManager.getInstance();
export const initialize = () => manager.initialize();
export const stop = () => manager.stop();
export const switchService = (service: string) =>
  manager.switchService(service);
export const getStatus = () => manager.getStatus();
