import { findByProps } from "@vendetta/metro";

const TAG = "[ServerDrawer]";

// Guilds.tsx only mounts the QuestDock (and therefore the whole dock pipeline this
// plugin rides on) when `getIsEligibleForQuests()` is truthy. That function returns
// `!isMetaQuest()`, i.e. it's a device/build-level gate that is false for some users
// (Meta Quest builds/releases), so the dock never enters the view tree there and no
// amount of hook patching helps. Force it to always return true so the dock mounts.
function tryPatch(cleanups: (() => void)[]): boolean {
    const mod = findByProps("getIsEligibleForQuests");
    if (!mod?.getIsEligibleForQuests) return false;

    const orig = mod.getIsEligibleForQuests;
    mod.getIsEligibleForQuests = function (...args: any[]) {
        orig.apply(this, args);
        return true;
    };
    cleanups.push(() => { mod.getIsEligibleForQuests = orig; });
    console.log(TAG, "PATCH: getIsEligibleForQuests -> always true");
    return true;
}

export function patchQuestEligibility(cleanups: (() => void)[]): boolean {
    if (tryPatch(cleanups)) return true;

    console.log(TAG, "WARN: getIsEligibleForQuests not found yet, retrying...");
    const timer = setInterval(() => {
        if (tryPatch(cleanups)) {
            clearInterval(timer);
        }
    }, 1000);
    cleanups.push(() => clearInterval(timer));
    return true;
}
