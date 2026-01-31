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

let sidebarUnpatch: (() => void) | undefined;

// Initialize default settings
const defaultSettings: LFMSettings = Constants.DEFAULT_SETTINGS;
Object.keys(defaultSettings).forEach((key) => {
  plugin.storage[key] =
    plugin.storage[key] ?? defaultSettings[key as keyof typeof defaultSettings];
});

plugin.storage.addToSidebar ??= false;

export const currentSettings = new Proxy(plugin.storage, {
  get(target, prop: string) {
    return target[prop];
  },
  set(target, prop: string, value) {
    target[prop] = value;
    return true;
  },
});

// Connection status tracking
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;
const RECONNECT_DELAY = 5000;

async function tryInitialize() {
  try {
    await initialize();
    connectionAttempts = 0;
    console.log("[Multi-Scrobbler] Successfully connected");
  } catch (error) {
    console.error("[Multi-Scrobbler] Initialization error:", error);
    connectionAttempts++;

    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      console.log(
        `[Multi-Scrobbler] Retrying connection... (attempt ${connectionAttempts})`,
      );
      setTimeout(tryInitialize, RECONNECT_DELAY);
    } else {
      console.error(
        "[Multi-Scrobbler] Failed to connect after multiple attempts",
      );
    }
  }
}

async function validateAndInitialize() {
  if (!currentSettings.service) {
    console.log("[Multi-Scrobbler] No service selected. Please configure a service in settings.");
    return;
  }

  let serviceName = "Unknown";
  try {
    serviceName = serviceFactory.getCurrentService().getServiceName();
  } catch (e) {
    console.error("[Multi-Scrobbler] Failed to determine current service name:", e);
  }

  const service = currentSettings.service;
  let hasCredentials = false;

  switch (service) {
    case "lastfm":
      hasCredentials = !!(currentSettings.username && currentSettings.apiKey);
      break;
    case "librefm":
      hasCredentials = !!(currentSettings.librefmUsername && currentSettings.librefmApiKey);
      break;
    case "listenbrainz":
      hasCredentials = !!currentSettings.listenbrainzUsername;
      break;
  }

  if (!hasCredentials) {
    console.error(`[Multi-Scrobbler] Missing credentials for ${serviceName}. Please configure in settings.`);
    return;
  }

  console.log(`[Multi-Scrobbler] Starting with ${serviceName}...`);

  if (UserStore.getCurrentUser()) {
    tryInitialize();
  } else {
    const waitForUser = () => {
      if (UserStore.getCurrentUser()) {
        tryInitialize();
        FluxDispatcher.unsubscribe("CONNECTION_OPEN", waitForUser);
      }
    };

    FluxDispatcher.subscribe("CONNECTION_OPEN", waitForUser);
  }
}

export default {
  onLoad() {
    console.log("[Multi-Scrobbler] Loading...");
    pluginState.pluginStopped = false;

    // Patch sidebar if enabled
    if (currentSettings.addToSidebar !== false) {
      try {
        sidebarUnpatch = patchSidebar();
        console.log("[Multi-Scrobbler] Sidebar patched successfully");
      } catch (error) {
        console.error("[Multi-Scrobbler] Failed to patch sidebar:", error);
      }
    }

    validateAndInitialize();
  },

  onUnload() {
    console.log("[Multi-Scrobbler] Unloading...");
    pluginState.pluginStopped = true;

    // Unpatch sidebar
    if (sidebarUnpatch) {
      try {
        sidebarUnpatch();
        sidebarUnpatch = undefined;
        console.log("[Multi-Scrobbler] Sidebar unpatched");
      } catch (error) {
        console.error("[Multi-Scrobbler] Failed to unpatch sidebar:", error);
      }
    }

    stop();
  },

  async onSettingsUpdate(newSettings: any) {
    const oldService = currentSettings.service;
    const newService = newSettings.service;
    const oldSidebar = currentSettings.addToSidebar;
    const newSidebar = newSettings.addToSidebar;

    Object.assign(currentSettings, newSettings);

    // Check if sidebar setting changed
    if (oldSidebar !== newSidebar) {
      if (newSidebar) {
        try {
          sidebarUnpatch = patchSidebar();
          console.log("[Multi-Scrobbler] Sidebar enabled");
        } catch (error) {
          console.error("[Multi-Scrobbler] Failed to enable sidebar:", error);
        }
      } else {
        if (sidebarUnpatch) {
          try {
            sidebarUnpatch();
          } catch (e) {
            console.error("[Multi-Scrobbler] Failed to unpatch sidebar:", e);
          }
          sidebarUnpatch = undefined;
          console.log("[Multi-Scrobbler] Sidebar disabled");
        }
      }
    }

    if (oldService !== newService && newService) {
      console.log(`[Multi-Scrobbler] Service changed from ${oldService || "none"} to ${newService}`);
      try {
        await switchService(newService);
      } catch (e) {
        console.error("[Multi-Scrobbler] Failed to switch service:", e);
      }
    } else if (!pluginState.pluginStopped && currentSettings.service) {
      tryInitialize();
    } else if (!currentSettings.service) {
      console.log("[Multi-Scrobbler] Service unselected, stopping plugin...");
      try {
        stop();
      } catch (e) {
        console.error("[Multi-Scrobbler] Error while stopping due to service unselected:", e);
      }
    }
  },

  onDiscordReconnect() {
    if (!pluginState.pluginStopped) {
      console.log("[Multi-Scrobbler] Discord reconnected, reinitializing...");
      tryInitialize();
    }
  },

  settings: Settings,
};