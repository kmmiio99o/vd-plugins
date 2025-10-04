import { plugin } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { React } from "@vendetta/metro/common";
import { View } from "react-native";
import { Forms } from "@vendetta/ui/components";

import { LFMSettings } from "../../defs";
import Constants from "./constants";
import { initialize, stop } from "./manager";
import { UserStore } from "./modules";

// Import Settings component directly
import Settings from "./ui/pages/Settings";

const { FormText } = Forms;

export const pluginState = {
    pluginStopped: false,
    lastActivity: undefined,
    updateInterval: undefined,
    lastTrackUrl: undefined,
} as {
  pluginStopped: boolean;
  lastActivity?: any;
  updateInterval?: NodeJS.Timer;
  lastTrackUrl?: string;
};

// Initialize default settings
const defaultSettings: LFMSettings = Constants.DEFAULT_SETTINGS;
for (const key in defaultSettings) {
    plugin.storage[key] =
    plugin.storage[key] ?? defaultSettings[key as keyof typeof defaultSettings];
}

export const currentSettings = new Proxy(plugin.storage, {
    get(target, prop) {
        return target[prop];
    },
    set(target, prop, value) {
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
    } catch (error) {
        console.error("[Last.fm] Initialization error:", error);
        connectionAttempts++;

        if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
            showToast("Retrying connection...", getAssetIDByName("ic_clock"));
            setTimeout(tryInitialize, RECONNECT_DELAY);
        } else {
            showToast("Failed to connect to Last.fm", getAssetIDByName("Small"));
        }
    }
}

export default {
    onLoad() {
        pluginState.pluginStopped = false;

        if (!currentSettings.username || !currentSettings.apiKey) {
            showToast(
                "Please configure Last.fm username and API key in settings",
                getAssetIDByName("ic_warning"),
            );
            return;
        }

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
    },
    onUnload() {
        pluginState.pluginStopped = true;
        stop();
    },
    // Handle settings updates
    onSettingsUpdate(newSettings: any) {
        Object.assign(currentSettings, newSettings);
        tryInitialize();
    },
    // Handle Discord reconnection
    onDiscordReconnect() {
        if (!pluginState.pluginStopped) {
            tryInitialize();
        }
    },
    // Settings component
    settings: Settings,
};
