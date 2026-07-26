import { FluxDispatcher } from "@vendetta/metro/common";

import { pluginState } from "..";
import { Activity } from "../../../defs";
import Constants from "../constants";
import { stop } from "../manager";
import { AssetManager, HTTPUtils } from "../modules";

/** Clears the user's activity */
export function clearActivity() {
    return sendRequest(null);
}

/** Sends the activity details to Discord */
export function sendRequest(activity: Activity | null) {
    if (pluginState.pluginStopped) {
        stop();
        activity = null;
    }

    pluginState.lastActivity = activity;

    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity: activity,
        pid: 2312,
        socketId: "Multi-Scrobbler@Vendetta",
    });
}

async function resolveExternalAssets(
    urls: string[],
    appId: string,
): Promise<string[]> {
    const baseUrl = HTTPUtils.getAPIBaseURL();
    const endpoint = `${baseUrl}/applications/${appId}/external-assets`;

    const resp = await HTTPUtils.post({
        url: endpoint,
        body: { urls },
        oldFormErrors: true,
        rejectWithError: false,
    });

    console.log("[Multi-Scrobbler] External assets response:", JSON.stringify(resp));
    const body = resp?.body;
    console.log("[Multi-Scrobbler] Response body:", JSON.stringify(body));

    if (!Array.isArray(body)) return [];

    return body.map(
        (item: { url: string; external_asset_path: string }) =>
            `mp:${item.external_asset_path}`,
    );
}

/** Resolves external image URLs to Discord asset paths */
export async function fetchAsset(
    asset: string[],
    appId: string = Constants.APPLICATION_ID,
): Promise<string[]> {
    if (!asset?.length) return [];

    try {
        const result = await AssetManager.fetchAssetIds(appId, asset);

        // If it returned an actual array with results, use it
        if (Array.isArray(result) && result.length > 0 && result[0]) {
            return result;
        }

        // fetchAssetIds returned empty/broken — try external-assets API
        const externalUrls = asset.filter(
            (url) => url && (url.startsWith("http:") || url.startsWith("https:")),
        );
        if (externalUrls.length === 0) return [];

        return await resolveExternalAssets(externalUrls, appId);
    } catch (error) {
        console.error("[Multi-Scrobbler] Failed to fetch assets:", error);
        return [];
    }
}
