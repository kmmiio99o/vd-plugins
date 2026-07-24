import { findByProps } from "@vendetta/metro";

const TAG = "[ServerDrawer]";

export function patchGetQuestAsset(cleanups: (() => void)[]): boolean {
    const mod = findByProps("getQuestAsset");
    if (!mod?.getQuestAsset) {
        console.log(TAG, "WARN: getQuestAsset not found");
        return false;
    }
    const orig = mod.getQuestAsset;
    mod.getQuestAsset = function (...args: any[]) {
        try {
            return orig.apply(this, args);
        } catch {
            return { url: null, isAnimated: false };
        }
    };
    cleanups.push(() => { mod.getQuestAsset = orig; });
    return true;
}
