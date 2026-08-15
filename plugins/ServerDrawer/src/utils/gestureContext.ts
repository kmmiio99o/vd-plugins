import { find } from "@vendetta/metro";

let cachedGestureContext: any = null;

// QuestDock modules can register lazily after the plugin loads, so a failed lookup must NOT be
// cached - otherwise the sheet never gets a context (minExpandedContentHeight stays at its ~400
// default) and the drawer opens with extra space when there are few servers. Cache only success.
export function getGestureContext(): any {
    if (cachedGestureContext) return cachedGestureContext;
    const found = find((m: any) => m?.QuestDockGestureContext)?.QuestDockGestureContext ?? null;
    if (found) cachedGestureContext = found;
    return found;
}
