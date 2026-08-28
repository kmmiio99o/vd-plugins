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
// unwrapped name at every shell depth so no copy escapes by wrapping. Bounded depth instead of
// a Set: real wrappers are only ever 1-2 layers deep, so a loop cap avoids per-call allocation.
function unwrapComponent(type: any): any {
    let cur = type;
    let depth = 0;
    while (cur && typeof cur === "object" && depth++ < 8) {
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
    if (typeof type !== "function" && typeof type !== "object") return false;
    if (type.name === name || type.displayName === name) return true;
    const t = type.type;
    if (t && (t.name === name || t.displayName === name)) return true;
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

    let newStyleArray: any[] | undefined;
    let changed = false;

    list.forEach((s: any, i: number) => {
        if (!s || typeof s !== "object") return;
        // The sideContainer lives in the style array: position absolute with all four offsets.
        if (s?.position !== "absolute" || typeof s?.left !== "number" ||
            typeof s?.top !== "number" || typeof s?.bottom !== "number" || typeof s?.right !== "number") return;
        const newLeft = storage.hideDmTile ? DM_WIDTH : 0;
        if (s.left === newLeft) return;
        newStyleArray = newStyleArray ?? [...list];
        newStyleArray[i] = { ...s, left: newLeft };
        changed = true;
        console.log(TAG, `messages sideContainer left -> ${newLeft}`);
    });

    if (!changed) return props;
    return { ...props, style: Array.isArray(style) ? newStyleArray : newStyleArray![0] };
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

// Mutate a single matching module export for HomePanelContent (and remember it).
function mutateHomePanel(mod: any, cleanups: (() => void)[]): boolean {
    if (mod?.__sdHP) return false;
    const orig = mod?.HomePanelContent;
    if (!(orig && (typeof orig === "function" || typeof orig === "object"))) return false;
    // Intercept by the exact reference too, so even if Discord holds the original memo object
    // (instead of re-reading the module property), the Next render is routed to our patch.
    registerIntercept(orig, HomePanelContentPatch, {}, { collapseAncestors: 0 });
    mod.HomePanelContent = HomePanelContentPatch;
    mod.__sdHP = true;
    cleanups.push(() => { delete mod.__sdHP; mod.HomePanelContent = orig; });
    console.log(TAG, "PATCH: HomePanelContent replaced (module mutation + exact-ref intercept)");
    return true;
}

function mutateGuildsBar(mod: any, cleanups: (() => void)[]): boolean {
    let mutated = false;
    // function export: mod.GuildsBar
    if (typeof mod.GuildsBar === "function" && mod.GuildsBar.name === "GuildsBar" && !mod.__sdGB) {
        const orig = mod.GuildsBar;
        mod.GuildsBar = GuildsBarPatch;
        mod.__sdGB = true;
        cleanups.push(() => { delete mod.__sdGB; mod.GuildsBar = orig; });
        console.log(TAG, "PATCH: GuildsBar replaced (module mutation, GuildsBar fn)");
        mutated = true;
    }
    // function export: mod.default
    if (typeof mod.default === "function" && mod.default.name === "GuildsBar" && !mod.__sdGBd) {
        const orig = mod.default;
        mod.default = GuildsBarPatch as any;
        mod.__sdGBd = true;
        cleanups.push(() => { delete mod.__sdGBd; mod.default = orig; });
        console.log(TAG, "PATCH: GuildsBar replaced (module mutation, default fn)");
        mutated = true;
    }
    // memo-style object export: mod.default.type
    if (mod.default && typeof mod.default === "object" && hasName(mod.default.type, "GuildsBar") && !mod.__sdGBt) {
        const orig = mod.default.type;
        // Exact-reference intercept: jsx passes the memo object itself, so keying on it routes
        // every creation of this GuildsBar (any render, any which-copy) to our null patch.
        registerIntercept(mod.default, GuildsBarPatch, {}, { collapseAncestors: 0 });
        mod.default.type = GuildsBarPatch;
        mod.__sdGBt = true;
        cleanups.push(() => { delete mod.__sdGBt; mod.default.type = orig; });
        console.log(TAG, "PATCH: GuildsBar replaced (module mutation, default.type + exact-ref intercept)");
        mutated = true;
    }
    // named-object export: mod.type (+ optional inner .type)
    if (mod.type && typeof mod.type === "object" && hasName(mod.type.type, "GuildsBar") && !mod.__sdGBnt) {
        const orig = mod.type.type;
        registerIntercept(mod.type, GuildsBarPatch, {}, { collapseAncestors: 0 });
        mod.type.type = GuildsBarPatch;
        mod.__sdGBnt = true;
        cleanups.push(() => { delete mod.__sdGBnt; mod.type.type = orig; });
        console.log(TAG, "PATCH: GuildsBar replaced (module mutation, type.type + exact-ref intercept)");
        mutated = true;
    }
    if (typeof mod.type === "function" && mod.type.name === "GuildsBar" && !mod.__sdGBf) {
        const orig = mod.type;
        (mod as any).type = GuildsBarPatch;
        mod.__sdGBf = true;
        cleanups.push(() => { delete mod.__sdGBf; (mod as any).type = orig; });
        console.log(TAG, "PATCH: GuildsBar replaced (module mutation, type fn)");
        mutated = true;
    }
    return mutated;
}

let hidingComplete = false;
export function isHidingComplete(): boolean {
    return hidingComplete;
}
export function resetHidingComplete(): void {
    hidingComplete = false;
}

// The rail/guilds modules can register *after* the plugin loads, or Discord's JSX can hold a
// direct reference to an already-mounted copy, so we keep re-scanning and mutating any
// HomePanelContent/GuildsBar copy we haven't touched yet (late-loaded modules get caught, not
// just the ones present at onLoad). Dedup via flags so repeated scans don't re-register cleanups.
export function rescanHiding(cleanups: (() => void)[]): void {
    let found = 0;
    let applied = 0;

    try {
        const hps = findAll((m: any) =>
            m?.HomePanelContent?.type &&
            typeof m?.HomePanelContent?.type === "function"
        );
        found += hps.length;
        hps.forEach((mod) => { if (mutateHomePanel(mod, cleanups)) applied++; });
    } catch { /* ignore */ }

    try {
        const gbMods = findAll((m: any) => {
            if (hasName(m?.default, "GuildsBar") || hasName(m?.default?.type, "GuildsBar")) return true;
            if (hasName(m?.type, "GuildsBar") || hasName(m?.type?.type, "GuildsBar")) return true;
            return typeof m?.GuildsBar === "function" && m.GuildsBar.name === "GuildsBar";
        });
        found += gbMods.length;
        gbMods.forEach((mod) => { if (mutateGuildsBar(mod, cleanups)) applied++; });
    } catch { /* ignore */ }

    hidingComplete = found > 0 && applied === 0;
}

export function patchHideGuildsBar(cleanups: (() => void)[]): boolean {
    let applied = false;

    // 1. Register props transform for messages panel (works via createElementIntercept)
    // This is the PRIMARY mechanism - transforms the messages panel's style at creation time
    registerPropsTransform(
        isMessagesPanel,
        transformMessagesPanelProps
    );
    applied = true;

    // 2+3. Persistent module mutation.
    rescanHiding(cleanups);

    // The rail modules may load lazily; keep rescanning briefly to also hit late copies.
    // Stop as soon as every visible copy is confirmed patched (hidingComplete).
    let ticks = 0;
    const timer = setInterval(() => {
        if (isHidingComplete()) { clearInterval(timer); return; }
        rescanHiding(cleanups);
        if (++ticks >= 40) clearInterval(timer); // ~4s
    }, 100);
    cleanups.push(() => clearInterval(timer));

    // 4. Type detectors and interceptors (late-loaded modules via createElementIntercept)
    // NOTE: the rail is defined in module 15720 whose export is aliased `HomePanelContent` but
    // whose memoized inner function is named `HomeDrawerPanelContent`. Match both so the
    // detector actually fires on the mounted type.
    const homePanelNames = ["HomePanelContent", "HomeDrawerPanelContent"];
    registerTypeDetector(
        "ServerDrawer.HomePanelContent",
        (type: any) => homePanelNames.some((n) => hasName(type, n)),
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
