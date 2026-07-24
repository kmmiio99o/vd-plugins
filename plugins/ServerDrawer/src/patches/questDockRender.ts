import { findByProps } from "@vendetta/metro";

const TAG = "[ServerDrawer]";

export function patchQuestDockRender(cleanups: (() => void)[]): boolean {
    const mod = findByProps("useIsMobileQuestDockRendered");
    if (!mod?.useIsMobileQuestDockRendered) {
        console.log(TAG, "WARN: useIsMobileQuestDockRendered not found");
        return false;
    }
    const orig = mod.useIsMobileQuestDockRendered;
    mod.useIsMobileQuestDockRendered = function (...args: any[]) {
        orig.apply(this, args);
        return true;
    };
    cleanups.push(() => { mod.useIsMobileQuestDockRendered = orig; });
    return true;
}
