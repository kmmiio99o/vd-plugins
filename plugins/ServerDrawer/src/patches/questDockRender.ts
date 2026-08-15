import { patchByPropWithRetry } from "./retry";

export function patchQuestDockRender(cleanups: (() => void)[]): boolean {
    return patchByPropWithRetry(cleanups, "useIsMobileQuestDockRendered", (orig) => {
        return function (this: any, ...args: any[]) {
            orig.apply(this, args);
            return true;
        };
    });
}
