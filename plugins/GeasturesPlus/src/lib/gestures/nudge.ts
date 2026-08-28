import { instead } from "@vendetta/patcher";
import { find, findByProps } from "@vendetta/metro";

const TAG = "[Geastures+]";

let nudgePatched = false;
let unpatchNudge: (() => void) | null = null;

export function patchNudge(): boolean {
    if (nudgePatched) return true;
    let exps: any = find((m: any) => typeof m?.DoubleTapEmojiEditNudge === "function");
    if (typeof exps?.DoubleTapEmojiEditNudge !== "function") {
        exps = findByProps("DoubleTapEmojiEditNudge") as any;
    }
    const nudge = exps?.DoubleTapEmojiEditNudge ?? exps?.default?.DoubleTapEmojiEditNudge;
    if (typeof nudge !== "function") return false;
    try {
        unpatchNudge = instead("DoubleTapEmojiEditNudge", exps, () => null);
        nudgePatched = true;
        return true;
    } catch (e) {
        console.error(TAG, "nudge patch error", e);
        return false;
    }
}

export function resetNudge(): void {
    if (unpatchNudge) unpatchNudge();
    unpatchNudge = null;
    nudgePatched = false;
}
