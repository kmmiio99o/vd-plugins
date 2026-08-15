import { findByProps } from "@vendetta/metro";

const TAG = "[ServerDrawer]";

// Patches `mod[prop]` by replacing it with `apply(orig)` as soon as the module
// becomes available. Quest-related modules may not be registered when the plugin
// loads on some builds, so a one-shot findByProps at onLoad silently no-ops there.
export function patchByPropWithRetry(
    cleanups: (() => void)[],
    prop: string,
    apply: (orig: any) => any,
    retryMs = 1000,
): boolean {
    const tryApply = (): boolean => {
        const mod = findByProps(prop);
        if (!mod?.[prop]) return false;

        const orig = mod[prop];
        mod[prop] = apply(orig);
        cleanups.push(() => { mod[prop] = orig; });
        console.log(TAG, `PATCH: ${prop}`);
        return true;
    };

    if (tryApply()) return true;

    console.log(TAG, `WARN: ${prop} not found yet, retrying...`);
    const timer = setInterval(() => {
        if (tryApply()) clearInterval(timer);
    }, retryMs);
    cleanups.push(() => clearInterval(timer));
    return false;
}
