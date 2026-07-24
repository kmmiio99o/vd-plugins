import { findByProps } from "@vendetta/metro";

const TAG = "[ServerDrawer]";

export function patchQuestDockBase(cleanups: (() => void)[]): boolean {
    const mod = findByProps("useIsMobileQuestDockRenderedBase");
    if (!mod?.useIsMobileQuestDockRenderedBase) {
        console.log(TAG, "WARN: useIsMobileQuestDockRenderedBase not found");
        return false;
    }
    const orig = mod.useIsMobileQuestDockRenderedBase;
    mod.useIsMobileQuestDockRenderedBase = function (...args: any[]) {
        orig.apply(this, args);
        return true;
    };
    cleanups.push(() => { mod.useIsMobileQuestDockRenderedBase = orig; });
    return true;
}
