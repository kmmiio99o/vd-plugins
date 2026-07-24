import { React } from "@vendetta/metro/common";

interface Intercept {
    replacement: React.ComponentType<any>;
    extraProps?: Record<string, any>;
}

const intercepts = new Map<React.ComponentType<any>, Intercept>();
let origCreateElement: typeof React.createElement | null = null;

export function registerIntercept(
    original: React.ComponentType<any>,
    replacement: React.ComponentType<any>,
    extraProps?: Record<string, any>,
) {
    intercepts.set(original, { replacement, extraProps });
}

export function patchCreateElement(cleanups: (() => void)[]) {
    if (origCreateElement) return;

    origCreateElement = React.createElement;

    const patched = function (type: any, props: any, ...rest: any[]) {
        const entry = intercepts.get(type);
        if (entry) {
            const newProps = entry.extraProps
                ? { ...props, ...entry.extraProps }
                : props;
            return origCreateElement!.call(React, entry.replacement, newProps, ...rest);
        }
        return origCreateElement!.call(React, type, props, ...rest);
    };

    Object.assign(patched, origCreateElement);
    React.createElement = patched as typeof React.createElement;

    cleanups.push(() => {
        if (origCreateElement) {
            React.createElement = origCreateElement;
            origCreateElement = null;
        }
        intercepts.clear();
    });
}
