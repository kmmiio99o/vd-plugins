import { patchQuestDockRender } from "./patches/questDockRender";
import { patchQuestDockBase } from "./patches/questDockBase";
import { patchMobileQuestDock } from "./patches/mobileQuestDock";
import { patchGetQuestAsset } from "./patches/getQuestAsset";
import { patchExpanded, patchEmpty } from "./patches/contentPatch";
import { patchHideGuildsBar } from "./patches/hideGuildsBar";
import { patchCreateElement } from "./patches/createElementIntercept";

const TAG = "[ServerDrawer]";
const cleanups: (() => void)[] = [];

export default {
    onLoad() {
        console.log(TAG, "onLoad");

        let patched = 0;

        patchCreateElement(cleanups);
        patched++;

        if (patchQuestDockRender(cleanups)) patched++;
        if (patchQuestDockBase(cleanups)) patched++;
        if (patchMobileQuestDock(cleanups)) patched++;
        if (patchGetQuestAsset(cleanups)) patched++;
        if (patchExpanded(cleanups)) patched++;
        if (patchEmpty("QuestDockContentCollapsed", cleanups)) patched++;
        if (patchEmpty("QuestDockEnrolledHeader", cleanups)) patched++;
        if (patchEmpty("QuestDockUnenrolledHeader", cleanups)) patched++;
        if (patchEmpty("QuestDockEnrolledBody", cleanups)) patched++;
        if (patchEmpty("QuestDockUnenrolledBody", cleanups)) patched++;
        if (patchHideGuildsBar(cleanups)) patched++;

        console.log(TAG, `onLoad done — ${patched} patches applied, ${cleanups.length} cleanups`);
    },
    onUnload() {
        console.log(TAG, "onUnload");
        for (const fn of cleanups) fn();
        cleanups.length = 0;
    },
};
