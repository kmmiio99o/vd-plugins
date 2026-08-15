import { patchByPropWithRetry } from "./retry";

export function patchQuestDockBase(cleanups: (() => void)[]): boolean {
    return patchByPropWithRetry(cleanups, "useIsMobileQuestDockRenderedBase", (orig) => {
        return function (this: any, ...args: any[]) {
            orig.apply(this, args);
            return true;
        };
    });
}
