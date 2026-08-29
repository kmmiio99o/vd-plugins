import { patchByPropWithRetry } from "./retry";

export function patchGetQuestAsset(cleanups: (() => void)[]): boolean {
    return patchByPropWithRetry(cleanups, "getQuestAsset", (orig) => {
        return function (this: any, ...args: any[]) {
            const assetArgs = args[0];
            // No real hero assets in our fake quest - return the empty resolved shape directly
            // so the consumer's .assets dereference never sees undefined.
            if (assetArgs == null || (assetArgs.questBarHero == null && assetArgs.questBarHeroVideo == null)) {
                return { assets: { questBarHero: null, questBarHeroVideo: null } };
            }
            return orig.apply(this, args);
        };
    });
}
