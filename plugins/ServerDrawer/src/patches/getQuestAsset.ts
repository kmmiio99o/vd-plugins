import { patchByPropWithRetry } from "./retry";

export function patchGetQuestAsset(cleanups: (() => void)[]): boolean {
    return patchByPropWithRetry(cleanups, "getQuestAsset", (orig) => {
        return function (this: any, ...args: any[]) {
            try {
                return orig.apply(this, args);
            } catch {
                return { url: null, isAnimated: false };
            }
        };
    });
}
