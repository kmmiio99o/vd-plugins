import { FluxDispatcher } from "@vendetta/metro/common";

import { pluginState } from "..";
import { Activity } from "../../../defs";
import Constants from "../constants";
import { stop } from "../manager";
import { AssetManager } from "../modules";

const log = (...args: any[]) => console.log("[Activity]", ...args);
const logError = (...args: any[]) =>
    console.error("[Activity] Error:", ...args);
const logVerbose = (...args: any[]) => {
    // just log everything for now since checking the setting is tricky here
    try {
        console.log("[Activity] Verbose:", ...args);
    } catch {
        console.log("[Activity] Verbose:", ...args);
    }
};

// Remove Discord activity
export function clearActivity() {
    log("Clearing Discord activity");
    return sendRequest(null);
}

// Send activity to Discord or clear it
export function sendRequest(activity: Activity | null) {
    if (pluginState.pluginStopped) {
        logVerbose("Plugin is stopped, clearing activity");
        stop();
        activity = null;
    }

    pluginState.lastActivity = activity;

    logVerbose(
        "Dispatching activity update:",
        activity ? "Setting activity" : "Clearing activity",
    );

    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: activity,
        pid: 2312,
        socketId: "Multi-Service-Scrobbler@Vendetta",
    });

    if (activity) {
        log(`Activity set: ${activity.details} - ${activity.state}`);
    } else {
        log("Activity cleared");
    }
}

// Get Discord asset for album art
export async function fetchAsset(
    asset: string[],
    appId: string = Constants.APPLICATION_ID,
): Promise<string[]> {
    if (!asset?.length) {
        logVerbose("No assets to fetch");
        return [];
    }

    try {
        logVerbose(`Fetching ${asset.length} asset(s):`, asset);
        const result = await AssetManager.fetchAssetIds(appId, asset);
        logVerbose(`Successfully fetched ${result.length} asset(s)`);
        return result;
    } catch (error) {
        logError("Failed to fetch assets:", error);
        return [];
    }
}
