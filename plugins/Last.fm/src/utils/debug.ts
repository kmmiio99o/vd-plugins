import { useReducer } from "react";
import { Activity, Track } from "../../../defs";

let __forceUpdate: () => void;

const debugInfo = {} as {
  lastActivity?: Activity;
  lastTrack?: Track;
  lastAPIResponse?: any;
  isSpotifyIgnored?: boolean;
  componentMountErrors?: string[];
  lastReanimatedError?: string;
  componentMountCount?: number;
  settingsLoadAttempts?: number;
  lastNavigationError?: string;
};

// Initialize debug counters
debugInfo.componentMountErrors = [];
debugInfo.componentMountCount = 0;
debugInfo.settingsLoadAttempts = 0;

export function setDebugInfo(
    key: keyof typeof debugInfo,
    value: (typeof debugInfo)[typeof key],
) {
    debugInfo[key] = value;
    __forceUpdate?.();
}

export function logComponentMount(componentName: string) {
    debugInfo.componentMountCount = (debugInfo.componentMountCount || 0) + 1;
    console.log(
        `[Last.fm Debug] Component mounted: ${componentName} (count: ${debugInfo.componentMountCount})`,
    );
}

export function logComponentError(componentName: string, error: any) {
    const errorMessage = `${componentName}: ${String(error)}`;
    debugInfo.componentMountErrors = debugInfo.componentMountErrors || [];
    debugInfo.componentMountErrors.push(errorMessage);

    if (String(error).includes("Reanimated")) {
        debugInfo.lastReanimatedError = errorMessage;
    }

    console.error(`[Last.fm Debug] Component error in ${componentName}:`, error);
    __forceUpdate?.();
}

export function logNavigationError(error: any) {
    debugInfo.lastNavigationError = String(error);
    console.error("[Last.fm Debug] Navigation error:", error);
    __forceUpdate?.();
}

export function incrementSettingsLoad() {
    debugInfo.settingsLoadAttempts = (debugInfo.settingsLoadAttempts || 0) + 1;
    console.log(
        `[Last.fm Debug] Settings load attempt: ${debugInfo.settingsLoadAttempts}`,
    );
}

export function useDebugInfo(): string {
    try {
        [, __forceUpdate] = useReducer((x) => ~x, 0);

        // Add runtime information
        const runtimeInfo = {
            ...debugInfo,
            timestamp: new Date().toISOString(),
            reactVersion: require("react").version,
            hasReanimatedError: !!debugInfo.lastReanimatedError,
            totalErrors: debugInfo.componentMountErrors?.length || 0,
        };

        return JSON.stringify(runtimeInfo, null, 4);
    } catch (error) {
        console.error("[Last.fm Debug] Error in useDebugInfo:", error);
        return JSON.stringify(
            {
                error: "Failed to generate debug info",
                errorMessage: String(error),
                timestamp: new Date().toISOString(),
            },
            null,
            4,
        );
    }
}
