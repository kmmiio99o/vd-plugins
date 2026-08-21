import React from "react";
import { View } from "react-native";
import { findAll } from "@vendetta/metro";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";
import { RailDmTile } from "../components/DmTile";
import { registerIntercept, registerTypeDetector, registerPropsTransform } from "./createElementIntercept";

const TAG = "[ServerDrawer]";
const DM_WIDTH = 72;

// Production bundles wrap components in memo()/forwardRef(), whose outer names are mangled
// or empty while the real function keeps its name on .type / .render. Match on the
// unwrapped name at every shell depth so no copy escapes by wrapping.
function unwrapComponent(type: any): any {
    const seen = new Set<any>();
    let cur = type;
    while (cur && typeof cur === "object" && !seen.has(cur)) {
        seen.add(cur);
        if (typeof cur.type === "function" || (cur.type && typeof cur.type === "object")) {
            cur = cur.type;
        } else if (typeof cur.render === "function") {
            cur = cur.render;
        } else {
            break;
        }
    }
    return cur;
}

function hasName(type: any, name: string): boolean {
    if (!type) return false;
    const bare = typeof type === "function" || typeof type === "object";
    if (!bare) return false;
    if (type.name === name || type.displayName === name) return true;
    return unwrapComponent(type)?.name === name;
}

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
    // When hideDmTile is true, show the full-height DMs tile; when false, rail is empty
    // The messages panel will stretch to cover it via the props transform
    return (
        <View collapsable={false} style={{ flex: 1, width: DM_WIDTH }}>
            {storage.hideDmTile && <RailDmTile />}
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
        if (defaultExport && (hasName(defaultExport, "GuildsBar") || hasName(defaultExport.type, "GuildsBar"))) {
            return true;
        }
        const typeExport = m?.type;
        if (typeExport && (hasName(typeExport, "GuildsBar") || hasName(typeExport.type, "GuildsBar"))) {
            return true;
        }
        return false;
    });
    guildsBarMods.forEach(mod => {
        // function export: mod.GuildsBar
        if (typeof mod.default === "function" && mod.default.name === "GuildsBar") {
            const orig = mod.default;
            mod.default = GuildsBarPatch as any;
            cleanups.push(() => { mod.default = orig; });
            console.log(TAG, "PATCH: GuildsBar replaced (module mutation, default fn)");
            applied = true;
            return;
        }
        // memo-style object export: mod.default.type
        if (mod.default && typeof mod.default === "object" && hasName(mod.default.type, "GuildsBar")) {
            const orig = mod.default.type;
            mod.default.type = GuildsBarPatch;
            cleanups.push(() => { mod.default.type = orig; });
            console.log(TAG, "PATCH: GuildsBar replaced (module mutation, default.type)");
            applied = true;
            return;
        }
        // named-object export: mod.type (+ optional inner .type)
        if (mod.type && typeof mod.type === "object" && hasName(mod.type.type, "GuildsBar")) {
            const orig = mod.type.type;
            mod.type.type = GuildsBarPatch;
            cleanups.push(() => { mod.type.type = orig; });
            console.log(TAG, "PATCH: GuildsBar replaced (module mutation, type.type)");
            applied = true;
            return;
        }
        if (typeof mod.type === "function" && mod.type.name === "GuildsBar") {
            const orig = mod.type;
            (mod as any).type = GuildsBarPatch;
            cleanups.push(() => { (mod as any).type = orig; });
            console.log(TAG, "PATCH: GuildsBar replaced (module mutation, type fn)");
            applied = true;
        }
    });

    // 4. Type detectors and interceptors (late-loaded modules via createElementIntercept)
    registerTypeDetector(
        "ServerDrawer.HomePanelContent",
        (type: any) => hasName(type, "HomePanelContent"),
        (original: any) => {
            registerIntercept(original, HomePanelContentPatch, {}, { collapseAncestors: 0 });
        },
        { persistent: true }
    );

    registerTypeDetector(
        "ServerDrawer.GuildsBar",
        (type: any) => hasName(type, "GuildsBar"),
        (original: any) => {
            registerIntercept(original, GuildsBarPatch, {}, { collapseAncestors: 0 });
        },
        { persistent: true }
    );

    return applied;
}
