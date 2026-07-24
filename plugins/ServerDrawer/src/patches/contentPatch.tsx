import { find } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import ServerDrawerSheet from "../components/ServerDrawerSheet";
import { registerIntercept } from "./createElementIntercept";

const TAG = "[ServerDrawer]";

const QuestDockGestureContext = find((m) => m?.QuestDockGestureContext)?.QuestDockGestureContext;

export function patchExpanded(
    cleanups: (() => void)[]
): boolean {
    const mod = find((m) => m?.type?.displayName === "QuestDockContentExpanded" || m?.type?.name === "QuestDockContentExpanded");
    if (!mod?.type) {
        console.log(TAG, "WARN: QuestDockContentExpanded not found");
        return false;
    }
    const orig = mod.type;

    registerIntercept(orig, ServerDrawerSheet, { gestureContext: QuestDockGestureContext });

    mod.type = function ServerDrawerPatch() {
        return <ServerDrawerSheet gestureContext={QuestDockGestureContext} />;
    };
    cleanups.push(() => { mod.type = orig; });
    console.log(TAG, "PATCH: QuestDockContentExpanded replaced");
    return true;
}

export function patchEmpty(
    name: string,
    cleanups: (() => void)[]
): boolean {
    const mod = find((m) => m?.type?.displayName === name || m?.type?.name === name);
    if (!mod?.type) {
        console.log(TAG, `WARN: ${name} not found`);
        return false;
    }
    const orig = mod.type;
    mod.type = function EmptyPatch() {
        return null;
    };
    cleanups.push(() => { mod.type = orig; });
    return true;
}
