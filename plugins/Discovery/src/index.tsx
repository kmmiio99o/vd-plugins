import { after } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { View } from "react-native";
import DiscoveryButton from "./components/DiscoveryButton";
import DiscoveryPage from "./components/DiscoveryPage";
import { TILE, MARGIN } from "./lib/tokens";
import { openDiscoveryModal } from "./lib/modal";

const TAG = "[Discovery]";
const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");

// Module 15556 - returns { listProps, listDataProps }. listDataProps.footerSize reserves a fixed
// pixel height for the footer block, so injecting into CreateJoinButton alone gets clipped.
// We grow footerSize alongside renderFooter instead. The registry is scanned directly because
// this bundle ships duplicate copies of guilds_bar modules; all of them get patched.
function isUseGuildsBarProps(exports: any): boolean {
    return (
        typeof exports?.default === "function" &&
        exports.default.name === "useGuildsBarProps"
    );
}

function patchFooter(ret: any) {
    const ldp = ret?.listDataProps;
    if (!ldp || patchedObjects.has(ldp)) return;
    if (typeof ldp.footerSize !== "function" || typeof ldp.renderFooter !== "function") {
        console.log(TAG, "WARN: unexpected listDataProps shape", Object.keys(ldp ?? {}));
        return;
    }

    const origFooterSize = ldp.footerSize;
    const origRenderFooter = ldp.renderFooter;
    const extra = TILE + 2 * MARGIN;

    ldp.footerSize = () => origFooterSize.call(ldp) + extra;
    ldp.renderFooter = () =>
        React.createElement(
            View,
            { style: { alignSelf: "stretch" }, collapsable: false },
            origRenderFooter.call(ldp),
            React.createElement(DiscoveryButton),
        );

    patchedObjects.add(ldp);
    console.log(TAG, `PATCH: footer extended (+${extra}px)`);
}

let unpatchers: (() => boolean)[] = [];
const patchedObjects = new WeakSet<object>();
let retryTimer: ReturnType<typeof setInterval> | undefined;
let ticks = 0;

function scanRegistry(logDetail: boolean): number {
    const modules = (globalThis as any)?.modules;
    if (!modules) {
        console.log(TAG, "WARN: no globalThis.modules registry");
        return 0;
    }

    let patchedCount = 0;
    const matches: string[] = [];

    for (const id in modules) {
        const def = modules[id];
        if (!def?.isInitialized) continue;
        const exports = def.publicModule?.exports;
        if (!exports) continue;

        if (isUseGuildsBarProps(exports)) {
            matches.push(id);
            try {
                unpatchers.push(
                    after("default", exports, (_args: any[], ret: any) => patchFooter(ret)),
                );
                patchedCount++;
            } catch (e) {
                console.log(TAG, `failed to patch instance ${id}:`, e);
            }
        } else if (logDetail && /^155[0-9]{2}$/.test(id)) {
            const d = exports?.default;
            const n =
                typeof d === "function"
                    ? d.name || "(anon)"
                    : typeof d === "object" && d !== null
                        ? Object.keys(d).slice(0, 5).join(",")
                        : typeof d;
            matches.push(`${id}:${n}`);
        }
    }

    if (matches.length > 0) console.log(TAG, "candidates/neighbors:", matches.join(" | "));
    return patchedCount;
}

export default {
    onLoad() {
        console.log(TAG, "onLoad");

        // Cross-plugin bridge: ServerDrawer's drawer tile opens the exact same page
        // through this instead of trying to reproduce our navigation stack.
        (globalThis as any).__discoveryOpenPage = () => {
            Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.SOFT);
            openDiscoveryModal(DiscoveryPage);
        };

        const first = scanRegistry(true);
        if (first === 0) {
            retryTimer = setInterval(() => {
                ticks++;
                const n = scanRegistry(ticks % 10 === 0);
                if (n > 0 || ticks >= 30) {
                    if (retryTimer) clearInterval(retryTimer);
                    retryTimer = undefined;
                    if (n === 0) console.log(TAG, "WARN: gave up finding useGuildsBarProps");
                }
            }, 1000);
        }
    },
    onUnload() {
        console.log(TAG, "onUnload");
        delete (globalThis as any).__discoveryOpenPage;
        if (retryTimer) clearInterval(retryTimer);
        retryTimer = undefined;
        unpatchers.forEach((u) => u());
        unpatchers = [];
    },
};
