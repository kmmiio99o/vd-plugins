import { find } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import ServerDrawerSheet from "../components/ServerDrawerSheet";
import { registerIntercept, registerTypeDetector } from "./createElementIntercept";
import { getGestureContext } from "../utils/gestureContext";

const TAG = "[ServerDrawer]";

function isNamed(name: string) {
    return (type: any) => type?.name === name || type?.displayName === name ||
        type?.type?.name === name || type?.type?.displayName === name;
}

// find()'s module-registry search can land on a different copy of QuestDockContentExpanded than
// the one actually mounted - registerTypeDetector instead inspects the exact `type` value passed
// to createElement/jsx as it's used, so there's no "which copy" ambiguity.
export function patchExpanded(
    cleanups: (() => void)[]
): boolean {
    registerTypeDetector("ServerDrawer.Expanded", isNamed("QuestDockContentExpanded"), (real) => {
        registerIntercept(real, ServerDrawerSheet, { gestureContext: getGestureContext() });
        console.log(TAG, "PATCH: QuestDockContentExpanded replaced (type detector)");
    }, { persistent: true });

    const mod = find((m) => m?.type?.displayName === "QuestDockContentExpanded" || m?.type?.name === "QuestDockContentExpanded");
    if (!mod?.type) {
        console.log(TAG, "WARN: QuestDockContentExpanded not found (will retry)");
        return true; // type detector is already watching regardless
    }
    const orig = mod.type;

    registerIntercept(orig, ServerDrawerSheet, { gestureContext: getGestureContext() });

    mod.type = function ServerDrawerPatch() {
        return <ServerDrawerSheet gestureContext={getGestureContext()} />;
    };
    cleanups.push(() => { mod.type = orig; });
    console.log(TAG, "PATCH: QuestDockContentExpanded replaced (module mutation)");
    return true;
}

export function patchEmpty(
    name: string,
    cleanups: (() => void)[]
): boolean {
    registerTypeDetector(`ServerDrawer.Empty.${name}`, isNamed(name), (real) => {
        registerIntercept(real, function EmptyPatch() { return null; });
        console.log(TAG, `PATCH: ${name} replaced (type detector)`);
    }, { persistent: true });

    const mod = find((m) => m?.type?.displayName === name || m?.type?.name === name);
    if (!mod?.type) {
        console.log(TAG, `WARN: ${name} not found`);
        return true; // type detector is already watching regardless
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
