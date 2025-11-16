import { plugin } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";

import { LFMSettings } from "../../defs";
import Constants from "./constants";
import { initialize, stop, switchService } from "./manager";
import { UserStore } from "./modules";
import { serviceFactory } from "./services/ServiceFactory";

import Settings from "./ui/pages/Settings";
import patchSidebar from "./sidebar";

export const pluginState = {
  pluginStopped: false,
  lastActivity: undefined,
  updateInterval: undefined,
  lastTrackUrl: undefined,
} as {
  pluginStopped: boolean;
  lastActivity?: any;
  updateInterval?: NodeJS.Timeout;
  lastTrackUrl?: string;
};

const cleanupFunctions: (() => void)[] = [];
let sidebarUnpatch: (() => void) | undefined;

// Set up default plugin settings
const defaultSettings: LFMSettings = Constants.DEFAULT_SETTINGS;
for (const key of Object.keys(defaultSettings)) {
  plugin.storage[key] =
    plugin.storage[key] ?? defaultSettings[key as keyof typeof defaultSettings];
}

plugin.storage.addToSidebar ??= false;

export const currentSettings = new Proxy(plugin.storage, {
  get(target, prop) {
    return target[prop];
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  },
});

// Keep track of connection attempts
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;
const RECONNECT_DELAY = 5000;

const log = (...args: any[]) => console.log("[Scrobble Plugin]", ...args);
const logError = (...args: any[]) =>
  console.error("[Scrobble Plugin] Error:", ...args);

async function tryInitialize() {
  try {
    await initialize();
    connectionAttempts = 0;
    log("Plugin initialized successfully");
  } catch (error) {
    logError("Initialization failed:", error);
    connectionAttempts++;

    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      log(
        `Retrying connection (${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})...`,
      );
      setTimeout(tryInitialize, RECONNECT_DELAY);
    } else {
      logError(`Failed to connect after ${MAX_CONNECTION_ATTEMPTS} attempts`);
    }
  }
}

async function validateAndInitialize() {
  // Check if user has selected a service first
  if (!currentSettings.service) {
    log("No service selected. Please configure a service in plugin settings.");
    return;
  }

  const serviceName = serviceFactory.getCurrentService().getServiceName();

  // Make sure we have credentials for whatever service is selected
  const service = currentSettings.service;
  let hasCredentials = false;

  switch (service) {
    case "lastfm":
      hasCredentials = !!(currentSettings.username && currentSettings.apiKey);
      break;
    case "librefm":
      hasCredentials = !!(
        currentSettings.librefmUsername && currentSettings.librefmApiKey
      );
      break;
    case "listenbrainz":
      hasCredentials = !!currentSettings.listenbrainzUsername;
      break;
  }

  if (!hasCredentials) {
    logError(
      `Missing credentials for ${serviceName}. Please configure in plugin settings.`,
    );
    return;
  }

  log(`Starting with ${serviceName}...`);

  if (UserStore.getCurrentUser()) {
    log("Discord is already connected, initializing immediately...");
    await tryInitialize();
  } else {
    log("Waiting for Discord connection...");
    const waitForUser = () => {
      if (UserStore.getCurrentUser()) {
        log("Discord connection established");
        tryInitialize();
        FluxDispatcher.unsubscribe("CONNECTION_OPEN", waitForUser);
      }
    };

    FluxDispatcher.subscribe("CONNECTION_OPEN", waitForUser);
  }
}

export default {
  onLoad() {
    log("Plugin loading...");
    pluginState.pluginStopped = false;

    // Check if service is configured
    if (!currentSettings.service) {
      log("No service configured. Please select a service in plugin settings.");
    } else {
      // Show what we're starting with
      const serviceName = serviceFactory.getCurrentService().getServiceName();
      log(
        `Configuration: Service=${serviceName}, Update Interval=${currentSettings.timeInterval}s, Verbose=${currentSettings.verboseLogging}`,
      );
    }

    // Add to sidebar if user wants it
    try {
      sidebarUnpatch = patchSidebar();
      cleanupFunctions.push(() => {
        if (sidebarUnpatch) {
          sidebarUnpatch();
          sidebarUnpatch = undefined;
        }
      });
    } catch (error) {
      log("Sidebar setup failed:", error);
    }

    validateAndInitialize();
  },

  onUnload() {
    log("Plugin unloading...");
    pluginState.pluginStopped = true;

    // Run all cleanup functions
    cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        // ignore cleanup errors
      }
    });
    cleanupFunctions.length = 0;

    stop();
    log("Plugin unloaded");
  },

  // When user changes settings
  async onSettingsUpdate(newSettings: any) {
    const oldService = currentSettings.service;
    const newService = newSettings.service;
    const oldSidebar = currentSettings.addToSidebar;
    const newSidebar = newSettings.addToSidebar;

    // Apply the new settings
    Object.assign(currentSettings, newSettings);

    log("Settings updated:", Object.keys(newSettings));

    // Check if sidebar setting changed
    if (oldSidebar !== newSidebar) {
      if (newSidebar) {
        try {
          sidebarUnpatch = patchSidebar();
          log("Sidebar enabled");
        } catch (error) {
          log("Failed to enable sidebar:", error);
        }
      } else {
        if (sidebarUnpatch) {
          sidebarUnpatch();
          sidebarUnpatch = undefined;
          log("Sidebar disabled");
        }
      }
    }

    // Switch services if needed
    if (oldService !== newService && newService) {
      log(`Service changed from ${oldService || "none"} to ${newService}`);
      await switchService(newService);
    } else if (!pluginState.pluginStopped && currentSettings.service) {
      // Just restart with the updated settings (only if service is selected)
      log("Restarting with updated settings...");
      await tryInitialize();
    } else if (!currentSettings.service) {
      // Service was unselected, stop the plugin
      log("Service unselected, stopping plugin...");
      stop();
    }
  },

  onDiscordReconnect() {
    if (!pluginState.pluginStopped) {
      log("Discord reconnected, reinitializing plugin...");
      tryInitialize();
    }
  },

  settings: Settings,
};
