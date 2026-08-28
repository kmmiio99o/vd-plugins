import { storage } from "@vendetta/plugin";
import { tryPatch, reset, isFullyPatched, enable } from "./lib/gestures";
import Settings from "./ui/Settings";

let retryTimer: ReturnType<typeof setInterval> | undefined;

export default {
    onLoad() {
        storage.tripleTapDelete ??= true;
        storage.replyToOwn ??= false;
        storage.doubleWindowMs ??= 75;

        enable();
        tryPatch();
        retryTimer = setInterval(() => {
            tryPatch();
            if (isFullyPatched()) {
                if (retryTimer) clearInterval(retryTimer);
                retryTimer = undefined;
            }
        }, 1000);
    },
    onUnload() {
        if (retryTimer) clearInterval(retryTimer);
        retryTimer = undefined;
        reset();
    },
    settings: Settings,
};
