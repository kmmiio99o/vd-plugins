import { find } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import ServerDrawerSheet from "../components/ServerDrawerSheet";
import { registerIntercept } from "./createElementIntercept";

const TAG = "[ServerDrawer]";

let cachedGestureContext: any = null;
function getGestureContext(): any {
    if (!cachedGestureContext) {
        cachedGestureContext = find((m) => m?.QuestDockGestureContext)?.QuestDockGestureContext ?? null;
    }
    return cachedGestureContext;
}

export function patchExpanded(
    cleanups: (() => void)[]
): boolean {
    const mod = find((m) => m?.type?.displayName === "QuestDockContentExpanded" || m?.type?.name === "QuestDockContentExpanded");
    if (!mod?.type) {
        console.log(TAG, "WARN: QuestDockContentExpanded not found (will retry)");
        return false;
    }
    const orig = mod.type;

    registerIntercept(orig, ServerDrawerSheet, { gestureContext: getGestureContext() });

    mod.type = function ServerDrawerPatch() {
        return <ServerDrawerSheet gestureContext={getGestureContext()} />;
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
    const originalComponent = orig;

    mod.type = function EmptyPatch() {
        return null;
    };

    if (originalComponent) {
        Object.defineProperties(mod.type, Object.getOwnPropertyDescriptors(originalComponent));
        mod.type.displayName = name;
    }

    cleanups.push(() => { mod.type = orig; });
    return true;
}
