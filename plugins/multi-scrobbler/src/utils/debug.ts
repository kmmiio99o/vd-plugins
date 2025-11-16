import { useReducer } from "react";
import { Activity, Track, ServiceType } from "../../../defs";

let __forceUpdate: () => void;

const debugInfo = {} as {
  lastActivity?: Activity;
  lastTrack?: Track;
  lastAPIResponse?: any;
  isYouTubeMusicIgnored?: boolean;
  isKizzyIgnored?: boolean;
  isMetrolistIgnored?: boolean;
  componentMountErrors?: string[];
  lastReanimatedError?: string;
  componentMountCount?: number;
  settingsLoadAttempts?: number;
  lastNavigationError?: string;
  lastError?: Error;
  serviceErrors?: Record<ServiceType, string[]>;
  apiCallCount?: number;
  lastSuccessfulUpdate?: string;
  currentService?: ServiceType;
  connectionAttempts?: number;
  lastCredentialValidation?: Record<ServiceType, boolean>;
};

// set up debug tracking
debugInfo.componentMountErrors = [];
debugInfo.componentMountCount = 0;
debugInfo.settingsLoadAttempts = 0;
debugInfo.serviceErrors = { lastfm: [], librefm: [], listenbrainz: [] };
debugInfo.apiCallCount = 0;
debugInfo.connectionAttempts = 0;
debugInfo.lastCredentialValidation = {
  lastfm: false,
  librefm: false,
  listenbrainz: false,
};

const log = (...args: any[]) => console.log("[Debug]", ...args);
const logError = (...args: any[]) => console.error("[Debug] Error:", ...args);

export function setDebugInfo(
  key: keyof typeof debugInfo,
  value: (typeof debugInfo)[typeof key],
) {
  (debugInfo[key] as any) = value;

  // log the important stuff
  if (key === "lastError" && value) {
    logError("Error recorded:", (value as Error).message);
  } else if (key === "lastTrack" && value) {
    log(
      "Track updated:",
      `${(value as Track).artist} - ${(value as Track).name}`,
    );
  } else if (key === "currentService" && value) {
    log("Service changed to:", value);
  }

  __forceUpdate?.();
}

export function incrementApiCall() {
  debugInfo.apiCallCount = (debugInfo.apiCallCount || 0) + 1;
  log(`API call count: ${debugInfo.apiCallCount}`);
}

export function recordServiceError(service: ServiceType, error: string) {
  debugInfo.serviceErrors = debugInfo.serviceErrors || {
    lastfm: [],
    librefm: [],
    listenbrainz: [],
  };
  debugInfo.serviceErrors[service] = debugInfo.serviceErrors[service] || [];
  debugInfo.serviceErrors[service].push(
    `${new Date().toISOString()}: ${error}`,
  );

  // don't let error logs get too long
  if (debugInfo.serviceErrors[service].length > 10) {
    debugInfo.serviceErrors[service] =
      debugInfo.serviceErrors[service].slice(-10);
  }

  logError(`${service} error:`, error);
  __forceUpdate?.();
}

export function recordCredentialValidation(
  service: ServiceType,
  isValid: boolean,
) {
  debugInfo.lastCredentialValidation = debugInfo.lastCredentialValidation || {
    lastfm: false,
    librefm: false,
    listenbrainz: false,
  };
  debugInfo.lastCredentialValidation[service] = isValid;
  log(
    `${service} credentials validation:`,
    isValid ? "✅ Valid" : "❌ Invalid",
  );
  __forceUpdate?.();
}

export function recordSuccessfulUpdate() {
  debugInfo.lastSuccessfulUpdate = new Date().toISOString();
  log("Successful update recorded at:", debugInfo.lastSuccessfulUpdate);
  __forceUpdate?.();
}

export function incrementConnectionAttempt() {
  debugInfo.connectionAttempts = (debugInfo.connectionAttempts || 0) + 1;
  log(`Connection attempt: ${debugInfo.connectionAttempts}`);
}

export function resetConnectionAttempts() {
  debugInfo.connectionAttempts = 0;
  log("Connection attempts reset");
}

export function logComponentMount(componentName: string) {
  debugInfo.componentMountCount = (debugInfo.componentMountCount || 0) + 1;
  log(
    `Component mounted: ${componentName} (count: ${debugInfo.componentMountCount})`,
  );
}

export function logComponentError(componentName: string, error: any) {
  const errorMessage = `${componentName}: ${String(error)}`;
  debugInfo.componentMountErrors = debugInfo.componentMountErrors || [];
  debugInfo.componentMountErrors.push(errorMessage);

  if (String(error).includes("Reanimated")) {
    debugInfo.lastReanimatedError = errorMessage;
  }

  logError(`Component error in ${componentName}:`, error);
  __forceUpdate?.();
}

export function logNavigationError(error: any) {
  debugInfo.lastNavigationError = String(error);
  logError("Navigation error:", error);
  __forceUpdate?.();
}

export function incrementSettingsLoad() {
  debugInfo.settingsLoadAttempts = (debugInfo.settingsLoadAttempts || 0) + 1;
  log(`Settings load attempt: ${debugInfo.settingsLoadAttempts}`);
}

export function getDebugSummary(): string {
  const summary = {
    status: {
      currentService: debugInfo.currentService || "unknown",
      lastSuccessfulUpdate: debugInfo.lastSuccessfulUpdate || "never",
      connectionAttempts: debugInfo.connectionAttempts || 0,
      apiCallCount: debugInfo.apiCallCount || 0,
    },
    validation: debugInfo.lastCredentialValidation,
    errors: {
      totalComponentErrors: debugInfo.componentMountErrors?.length || 0,
      lastError: debugInfo.lastError?.message || "none",
      serviceErrors: Object.fromEntries(
        Object.entries(debugInfo.serviceErrors || {}).map(
          ([service, errors]) => [service, errors.length],
        ),
      ),
    },
    lastTrack: debugInfo.lastTrack
      ? {
          artist: debugInfo.lastTrack.artist,
          name: debugInfo.lastTrack.name,
          nowPlaying: debugInfo.lastTrack.nowPlaying,
          service: debugInfo.currentService,
        }
      : null,
  };

  return JSON.stringify(summary, null, 2);
}

export function useDebugInfo(): string {
  try {
    [, __forceUpdate] = useReducer((x) => ~x, 0);

    // add some extra runtime info
    const runtimeInfo = {
      ...debugInfo,
      timestamp: new Date().toISOString(),
      reactVersion: "18.0.0", // we can't check the real version here
      hasReanimatedError: !!debugInfo.lastReanimatedError,
      totalErrors: debugInfo.componentMountErrors?.length || 0,
      summary: getDebugSummary(),
    };

    return JSON.stringify(runtimeInfo, null, 4);
  } catch (error) {
    logError("Error in useDebugInfo:", error);
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
