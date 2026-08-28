import { instead } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { onDoubleTap, resetDetection } from "./detection";
import { patchNudge, resetNudge } from "./nudge";

const TAG = "[Geastures+]";

const REACT_LATCHED = "geasturesDoubleTapLatched";

let unpatchers: (() => void)[] = [];
let detectorsInstalled = false;
let settingsPatched = false;
let nudgeDone = false;

export function enable() {
    try {
        if ((storage as any)[REACT_LATCHED]) return;
        const DTR = findByProps("DoubleTapReactionEmoji")?.DoubleTapReactionEmoji;
        if (!DTR?.updateSetting) return;
        const s = DTR?.getSetting?.();
        DTR.updateSetting({
            disableDoubleTap: false,
            emojiId: s?.emojiId ?? null,
            emojiName: s?.emojiName ?? null,
            animated: s?.animated ?? null,
        });
        (storage as any)[REACT_LATCHED] = true;
    } catch (e) {
        console.error(TAG, "enable error", e);
    }
}

function patchReaction(): boolean {
    if (detectorsInstalled) return true;
    const exps = findByProps("handleAddDefaultDoubleTapReaction") as any;
    if (typeof exps?.handleAddDefaultDoubleTapReaction !== "function") return false;
    try {
        unpatchers.push(
            instead("handleAddDefaultDoubleTapReaction", exps, (args: any[]) => {
                try { onDoubleTap(args[0], args[1]); } catch (e) { console.error(TAG, "hook error", e); }
                return undefined; // no default reaction
            }),
        );
        detectorsInstalled = true;
        return true;
    } catch (e) {
        console.error(TAG, "hook patch error", e);
        return false;
    }
}

function patchSetting(): boolean {
    if (settingsPatched) return true;
    const cfg = (findByProps("SETTING_RENDERER_CONFIG") as any)?.SETTING_RENDERER_CONFIG;
    if (!cfg) return false;
    const toggle = cfg.DOUBLE_TAP_TO_REACT_ENABLED;
    const emoji = cfg.DOUBLE_TAP_EMOJI;
    if (toggle && typeof toggle.useValue === "function" && typeof toggle.useIsDisabled === "function") {
        toggle.useValue = () => true; // show as enabled
        toggle.useIsDisabled = () => true; // gray out
        toggle.useDescription = () => "Managed by Geastures+ plugin.";
    }
    if (emoji && typeof emoji.usePredicate === "function") {
        emoji.usePredicate = () => false; // remove the emoji row
    }
    settingsPatched = true;
    return true;
}

export function tryPatch(): number {
    let patched = 0;
    enable();
    if (patchReaction()) patched++;
    if (patchSetting()) patched++;
    if (!nudgeDone && patchNudge()) { nudgeDone = true; patched++; }
    return patched;
}

export function isFullyPatched(): boolean {
    return detectorsInstalled && settingsPatched;
}

export function reset(): void {
    unpatchers.forEach((u) => u());
    unpatchers = [];
    detectorsInstalled = false;
    settingsPatched = false;
    nudgeDone = false;
    resetNudge();
    resetDetection();
}
