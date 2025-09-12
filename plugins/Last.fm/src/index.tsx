import { plugin } from "@vendetta";
import { FluxDispatcher, React } from "@vendetta/metro/common";

import { lazy, Suspense } from "react";
import { Activity, LFMSettings } from "../../defs";
import { flush, initialize } from "./manager";
import { UserStore } from "./modules";
import { Forms } from "@vendetta/ui/components";
import { ScrollView } from "react-native";

const { FormText } = Forms;

// Error boundary component for settings
function SettingsErrorBoundary({ children }: { children: React.ReactNode }) {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        const errorHandler = (error: any) => {
            console.error("Settings component error:", error);
            setHasError(true);
        };

        return () => {
            setHasError(false);
        };
    }, []);

    if (hasError) {
        return (
            <ScrollView style={{ padding: 12 }}>
                <FormText style={{ color: "#FF0000" }}>
                    Failed to load Last.fm settings. Please try reloading the plugin.
                </FormText>
            </ScrollView>
        );
    }

    return (
        <Suspense fallback={
            <ScrollView style={{ padding: 12 }}>
                <FormText>Loading Last.fm settings...</FormText>
            </ScrollView>
        }>
            {children}
        </Suspense>
    );
}

// Lazy-loaded Settings component with error handling
const LazySettings = lazy(() => {
    try {
        return import("./ui/pages/Settings").catch((error) => {
            console.error("Failed to load Settings component:", error);
            // Return a fallback component
            return {
                default: () => (
                    <ScrollView style={{ padding: 12 }}>
                        <FormText style={{ color: "#FF0000" }}>
                            Error: Could not load Last.fm settings component.
                            {"\n"}Please check console for details.
                        </FormText>
                    </ScrollView>
                )
            };
        });
    } catch (error) {
        console.error("Critical error in lazy loading:", error);
        // Return fallback component for critical errors
        return Promise.resolve({
            default: () => (
                <ScrollView style={{ padding: 12 }}>
                    <FormText style={{ color: "#FF0000" }}>
                        Critical error loading settings. Please restart the app.
                    </FormText>
                </ScrollView>
            )
        });
    }
});

// Wrapped settings component
function WrappedSettings() {
    return (
        <SettingsErrorBoundary>
            <LazySettings />
        </SettingsErrorBoundary>
    );
}

export const pluginState = {} as {
    pluginStopped?: boolean,
    lastActivity?: Activity,
    updateInterval?: NodeJS.Timer,
    lastTrackUrl?: string,
};

plugin.storage.ignoreSpotify ??= true;
export const currentSettings = { ...plugin.storage } as LFMSettings;

export default {
    settings: WrappedSettings,
    onLoad() {
        pluginState.pluginStopped = false;

        if (UserStore.getCurrentUser()) {
            initialize().catch(console.error);
        } else {
            const callback = () => {
                initialize().catch(console.error);
                FluxDispatcher.unsubscribe(callback);
            };

            FluxDispatcher.subscribe("CONNECTION_OPEN", callback);
        }

    },
    onUnload() {
        pluginState.pluginStopped = true;
        flush();
    }
};
