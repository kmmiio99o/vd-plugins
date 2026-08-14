import React from "react";
import { View } from "react-native";
import { findAll } from "@vendetta/metro";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";
import DmTile from "../components/DmTile";
import { registerIntercept, registerTypeDetector, registerPropsTransform } from "./createElementIntercept";

const TAG = "[ServerDrawer]";
const DM_WIDTH = 72;

// Check if props belong to the messages panel
function isMessagesPanel(props: any): boolean {
    return props?.nativeID === "messages-parent-view";
}

// Transform function for messages panel - adjust left based on setting
function transformMessagesPanelProps(props: any): any {
    const style = props?.style;
    const list = Array.isArray(style) ? style : [style];
    
    // Find the sideContainer in the style array (has position: absolute, left: number)
    const side = list.find((s: any) => s && typeof s === "object" &&
        s?.position === "absolute" &&
        typeof s?.left === "number" &&
        typeof s?.top === "number" &&
        typeof s?.bottom === "number" &&
        typeof s?.right === "number");
    
    if (side) {
        const newLeft = storage.hideDmTile ? DM_WIDTH : 0;
        if (side.left !== newLeft) {
            side.left = newLeft;
            console.log(TAG, `messages panel left mutated to ${newLeft}`);
        }
    }
    
    return props;
}

// Patch for HomePanelContent: conditionally render rail content
function HomePanelContentPatch() {
    useProxy(storage);
    
    // Always render the rail container (72px wide) to maintain layout structure
    // When hideDmTile is true, show the DMs tile; when false, rail is empty
    // The messages panel will stretch to cover it via the props transform
    return (
        <View collapsable={false} style={{ flex: 1, width: DM_WIDTH, alignItems: "center" }}>
            {storage.hideDmTile && (
                <View style={{ paddingTop: 12 }}>
                    <DmTile />
                </View>
            )}
        </View>
    );
}

// Safety net: GuildsBar is only rendered inside HomePanelContent's rail
function GuildsBarPatch() {
    return null;
}

export function patchHideGuildsBar(cleanups: (() => void)[]): boolean {
    let applied = false;

    // 1. Register props transform for messages panel (works via createElementIntercept)
    // This is the PRIMARY mechanism - transforms the messages panel's style at creation time
    registerPropsTransform(
        isMessagesPanel,
        transformMessagesPanelProps
    );
    console.log(TAG, "PATCH: registerPropsTransform for messages-parent-view registered");
    applied = true;

    // 2. Module mutation for HomePanelContent (early-loaded modules)
    const homePanelMods = findAll((m) =>
        m?.HomePanelContent?.type &&
        typeof m?.HomePanelContent?.type === "function"
    );
    homePanelMods.forEach(mod => {
        const orig = mod.HomePanelContent;
        mod.HomePanelContent = HomePanelContentPatch;
        cleanups.push(() => { mod.HomePanelContent = orig; });
        console.log(TAG, "PATCH: HomePanelContent replaced (module mutation)");
        applied = true;
    });

    // 3. Module mutation for GuildsBar (early-loaded modules)
    const guildsBarMods = findAll((m) => {
        const defaultExport = m?.default;
        if (defaultExport && (defaultExport.type?.name === "GuildsBar" || defaultExport.name === "GuildsBar")) {
            return true;
        }
        const typeExport = m?.type;
        if (typeExport && (typeExport.type?.name === "GuildsBar" || typeExport.name === "GuildsBar")) {
            return true;
        }
        return false;
    });
    guildsBarMods.forEach(mod => {
        let orig = null;
        if (mod.default && (mod.default.type?.name === "GuildsBar" || mod.default.name === "GuildsBar")) {
            orig = mod.default.type;
            mod.default.type = GuildsBarPatch;
        } else if (mod.type && (mod.type.type?.name === "GuildsBar" || mod.type.name === "GuildsBar")) {
            orig = mod.type;
            mod.type = GuildsBarPatch;
        }
        if (orig) {
            cleanups.push(() => {
                if (mod.default && (mod.default.type?.name === "GuildsBar" || mod.default.name === "GuildsBar")) {
                    mod.default.type = orig;
                } else if (mod.type && (mod.type.type?.name === "GuildsBar" || mod.type.name === "GuildsBar")) {
                    mod.type = orig;
                }
            });
            console.log(TAG, "PATCH: GuildsBar replaced (module mutation)");
            applied = true;
        }
    });

    // 4. Type detectors and interceptors (late-loaded modules via createElementIntercept)
    registerTypeDetector(
        "ServerDrawer.HomePanelContent",
        (type: any) => type?.name === "HomePanelContent" || type?.displayName === "HomePanelContent",
        (original: any) => {
            registerIntercept(original, HomePanelContentPatch, {}, { collapseAncestors: 0 });
        },
        { persistent: true }
    );

    registerTypeDetector(
        "ServerDrawer.GuildsBar",
        (type: any) => type?.name === "GuildsBar" || type?.displayName === "GuildsBar",
        (original: any) => {
            registerIntercept(original, GuildsBarPatch, {}, { collapseAncestors: 0 });
        },
        { persistent: true }
    );

    return applied;
}
