import { plugin } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";

import { LFMSettings } from "../../defs";
import Constants from "./constants";
import { initialize, stop, switchService } from "./manager";
import { UserStore } from "./modules";
import { serviceFactory } from "./services/ServiceFactory";

import Settings from "./ui/pages/Settings";
import patchSidebar from "./sidebar";

try {
  console.log("[Scrobble Plugin] module loaded (index.tsx)");

  (function installBridge() {
    try {
      const g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : undefined);
      if (!g) return;

      g.__scrobbleBridge = g.__scrobbleBridge || {};

      // Force invocation of the plugin's onLoad (if the plugin export is available at runtime).
      g.__scrobbleBridge.forceOnLoad = () => {
        try {
          const pluginExport =
            g.__scrobble_plugin ||
            (typeof module !== "undefined" && (module as any).exports && (module as any).exports.default) ||
            null;

          if (pluginExport && typeof pluginExport.onLoad === "function") {
            try {
              pluginExport.onLoad();
              console.log("[Scrobble Plugin] bridge: onLoad invoked");
            } catch (e) {
              console.error("[Scrobble Plugin] bridge: onLoad threw an error:", e);
            }
          } else {
            console.warn("[Scrobble Plugin] bridge: plugin export or onLoad not available");
          }
        } catch (e) {
          console.error("[Scrobble Plugin] bridge: failed to invoke onLoad:", e);
        }
      };

      // Return whatever we can find for programmatic inspection
      g.__scrobbleBridge.inspect = () => {
        try {
          return g.__scrobble_plugin || (typeof module !== "undefined" && (module as any).exports && (module as any).exports.default) || null;
        } catch (e) {
          console.error("[Scrobble Plugin] bridge.inspect error:", e);
          return null;
        }
      };

      // Small helper to allow reloading the plugin module (best-effort - may be limited by runtime)
      g.__scrobbleBridge.tryReload = () => {
        try {
          // Attempt to clear a require cache if present and re-require the module
          if (typeof require !== "undefined" && require.cache) {
            try {
              const path = require.resolve && require.resolve("./index.tsx");
              if (path && require.cache[path]) delete require.cache[path];
            } catch {}
            try {
              const re = require("./index.tsx");
              const exported = re && re.__esModule && typeof re.default !== "undefined" ? re.default : re;
              (g as any).__scrobble_plugin = exported;
              console.log("[Scrobble Plugin] bridge: reloaded plugin module");
              return exported;
            } catch (e) {
              console.error("[Scrobble Plugin] bridge: reload failed:", e);
              return null;
            }
          } else {
            console.warn("[Scrobble Plugin] bridge.tryReload not supported in this runtime");
            return null;
          }
        } catch (e) {
          console.error("[Scrobble Plugin] bridge.tryReload error:", e);
          return null;
        }
      };
    } catch (e) {
      try {
        console.error("[Scrobble Plugin] Failed to install debug bridge:", e);
      } catch {}
    }
  })();
} catch (e) {
  try {
    console.error("[Scrobble Plugin] Top-level init error:", e);
  } catch {}
}

(function installUnhandledRejectionHandler() {
  try {
    const g = typeof globalThis !== "undefined" ? (globalThis as any) : {};

    // Avoid installing multiple times
    if (g && !g.__scrobble_unhandled_rejection_installed) {
      const handler = (ev: any) => {
        try {
          // ev may be an event or a reason object depending on the runtime
          const reason = ev && (ev.reason ?? ev) ? (ev.reason ?? ev) : ev;
          console.error("[Scrobble Plugin] Unhandled rejection:", reason);
        } catch (inner) {
          // Defensive: if formatting the event fails, still log something
          console.error("[Scrobble Plugin] Unhandled rejection (unknown format)", ev);
        }
      };

      // Prefer globalThis.addEventListener
      if (g && typeof g.addEventListener === "function") {
        try {
          g.addEventListener("unhandledrejection", handler);
          g.__scrobble_unhandled_rejection_installed = true;
          return;
        } catch (e) {
          // continue to other fallbacks
          console.error("[Scrobble Plugin] Failed to register via globalThis.addEventListener:", e);
        }
      }

      // If window exists and supports addEventListener, use it
      if (typeof (globalThis as any).window !== "undefined") {
        const w = (globalThis as any).window;
        if (w && typeof w.addEventListener === "function") {
          try {
            w.addEventListener("unhandledrejection", handler);
            g.__scrobble_unhandled_rejection_installed = true;
            return;
          } catch (e) {
            console.error("[Scrobble Plugin] Failed to register via window.addEventListener:", e);
          }
        } else if (w) {
          // fallback to assigning onunhandledrejection if available and not a function call
          try {
            if (typeof w.onunhandledrejection === "undefined") {
              w.onunhandledrejection = (ev: any) => handler(ev);
              g.__scrobble_unhandled_rejection_installed = true;
              return;
            }
          } catch (e) {
            console.error("[Scrobble Plugin] Failed to assign window.onunhandledrejection:", e);
          }
        }
      }

      // As a last resort, try process.on (Node-style). Guard existence and function type.
      try {
        const proc = (globalThis as any).process;
        if (proc && typeof proc.on === "function") {
          proc.on("unhandledRejection", (reason: any) => handler({ reason }));
          g.__scrobble_unhandled_rejection_installed = true;
          return;
        }
      } catch (e) {
        // ignore
      }

      // If none of the above worked, set a marker so we don't keep trying on repeated loads
      g.__scrobble_unhandled_rejection_installed = true;
    }
  } catch (e) {
    // Most defensive: don't let any error here block plugin loading
    try {
      console.error("[Scrobble Plugin] Error while installing unhandled rejection handler:", e);
    } catch {
      /* swallow */
    }
  }
})();

// Heartbeat helpers
let __scrobbleHeartbeat: any;
function startHeartbeat() {
  if (__scrobbleHeartbeat) return;
  try {
    __scrobbleHeartbeat = setInterval(() => {
      console.log("[Scrobble Plugin] Heartbeat (alive)");
    }, 60_000);
  } catch (e) {
    console.error("[Scrobble Plugin] Failed to start heartbeat:", e);
  }
}
function stopHeartbeat() {
  if (!__scrobbleHeartbeat) return;
  try {
    clearInterval(__scrobbleHeartbeat);
  } catch (e) {
    console.error("[Scrobble Plugin] Failed to clear heartbeat:", e);
  } finally {
    __scrobbleHeartbeat = undefined;
  }
}

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
  // Defensive: plugin.storage may not accept arbitrary keys in some environments,
  // but assignment should generally be fine in Vendetta.
  try {
    plugin.storage[key] =
      plugin.storage[key] ?? defaultSettings[key as keyof typeof defaultSettings];
  } catch (e) {
    console.error("[Scrobble Plugin] Failed to initialize default setting", key, e);
  }
}

try {
  // safe default for addToSidebar
  plugin.storage.addToSidebar ??= false;
} catch (e) {
  // ignore if storage access fails
}

export const currentSettings = new Proxy(plugin.storage, {
  get(target, prop) {
    return (target as any)[prop];
  },
  set(target, prop, value) {
    (target as any)[prop] = value;
    return true;
  },
});

// Keep track of connection attempts
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;
const RECONNECT_DELAY = 5000;

const log = (...args: any[]) => console.log("[Scrobble Plugin]", ...args);
const logError = (...args: any[]) => console.error("[Scrobble Plugin] Error:", ...args);

async function tryInitialize() {
  try {
    await initialize();
    connectionAttempts = 0;
    log("Plugin initialized successfully");
  } catch (error) {
    logError("Initialization failed:", error);
    connectionAttempts++;

    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      log(`Retrying connection (${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})...`);
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

  let serviceName = "Unknown";
  try {
    serviceName = serviceFactory.getCurrentService().getServiceName();
  } catch (e) {
    logError("Failed to determine current service name:", e);
  }

  // Make sure we have credentials for whatever service is selected
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
    logError(`Missing credentials for ${serviceName}. Please configure in plugin settings.`);
    return;
  }

  log(`Starting with ${serviceName}...`);

  if (UserStore.getCurrentUser()) {
    log("Discord is already connected, initializing immediately...");
    await tryInitialize();
  } else {
    log("Waiting for Discord connection...");
    const waitForUser = () => {
      try {
        if (UserStore.getCurrentUser()) {
          log("Discord connection established");
          tryInitialize();
          FluxDispatcher.unsubscribe("CONNECTION_OPEN", waitForUser);
        }
      } catch (e) {
        logError("Error while waiting for Discord connection:", e);
      }
    };

    try {
      FluxDispatcher.subscribe("CONNECTION_OPEN", waitForUser);
    } catch (e) {
      logError("Failed to subscribe to CONNECTION_OPEN:", e);
    }
  }
}

const __scrobble_plugin_export = {
  onLoad() {
    log("Plugin loading...");
    pluginState.pluginStopped = false;

    try {
      startHeartbeat();
      log("Heartbeat started");
    } catch (e) {
      logError("Failed to start heartbeat:", e);
    }

    // Check if service is configured
    if (!currentSettings.service) {
      log("No service configured. Please select a service in plugin settings.");
    } else {
      try {
        const serviceName = serviceFactory.getCurrentService().getServiceName();
        log(`Configuration: Service=${serviceName}, Update Interval=${currentSettings.timeInterval}s, Verbose=${currentSettings.verboseLogging}`);
      } catch (e) {
        logError("Failed to read service configuration:", e);
      }
    }

    // Add to sidebar if user wants it
    try {
      sidebarUnpatch = patchSidebar();
      cleanupFunctions.push(() => {
        if (sidebarUnpatch) {
          try {
            sidebarUnpatch();
          } catch (e) {
            // ignore individual cleanup errors
          }
          sidebarUnpatch = undefined;
        }
      });
    } catch (error) {
      log("Sidebar setup failed:", error);
    }

    try {
      validateAndInitialize();
      log("onLoad complete - validateAndInitialize triggered");
    } catch (e) {
      logError("validateAndInitialize threw an error:", e);
    }
  },

  onUnload() {
    log("Plugin unloading...");
    pluginState.pluginStopped = true;

    try {
      stopHeartbeat();
      log("Heartbeat stopped");
    } catch (e) {
      logError("Failed to stop heartbeat:", e);
    }

    // Run all cleanup functions
    cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        // ignore cleanup errors
      }
    });
    cleanupFunctions.length = 0;

    try {
      stop();
    } catch (e) {
      logError("Error while stopping plugin manager:", e);
    }
    log("Plugin unloaded");
  },

  // When user changes settings
  async onSettingsUpdate(newSettings: any) {
    const oldService = currentSettings.service;
    const newService = newSettings.service;
    const oldSidebar = currentSettings.addToSidebar;
    const newSidebar = newSettings.addToSidebar;

    try {
      Object.assign(currentSettings, newSettings);
    } catch (e) {
      logError("Failed to apply new settings:", e);
    }

    log("Settings updated:", Object.keys(newSettings || {}));

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
          try {
            sidebarUnpatch();
          } catch (e) {
            logError("Failed to unpatch sidebar:", e);
          }
          sidebarUnpatch = undefined;
          log("Sidebar disabled");
        }
      }
    }

    if (oldService !== newService && newService) {
      log(`Service changed from ${oldService || "none"} to ${newService}`);
      try {
        await switchService(newService);
      } catch (e) {
        logError("Failed to switch service:", e);
      }
    } else if (!pluginState.pluginStopped && currentSettings.service) {
      log("Restarting with updated settings...");
      await tryInitialize();
    } else if (!currentSettings.service) {
      log("Service unselected, stopping plugin...");
      try {
        stop();
      } catch (e) {
        logError("Error while stopping due to service unselected:", e);
      }
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

try {
  // Expose the resolved plugin export to the global bridge so console can access it
  const g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : undefined);
  if (g) {
    try {
      g.__scrobble_plugin = __scrobble_plugin_export;
      if (g.__scrobbleBridge && typeof g.__scrobbleBridge.inspect === "function") {
        // allow immediate inspection
        console.log("[Scrobble Plugin] global plugin export attached for inspection");
      }
    } catch (e) {
      console.error("[Scrobble Plugin] Failed to assign global plugin export:", e);
    }
  }
} catch (e) {
  // ignore
}

export default __scrobble_plugin_export;
