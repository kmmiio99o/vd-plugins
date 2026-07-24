import { React } from "@vendetta/metro/common";

interface Intercept {
    replacement: React.ComponentType<any>;
    extraProps?: Record<string, any>;
}

const intercepts = new Map<React.ComponentType<any>, Intercept>();
let origCreateElement: typeof React.createElement | null = null;
let isPatched = false;

export function registerIntercept(
    original: React.ComponentType<any>,
    replacement: React.ComponentType<any>,
    extraProps?: Record<string, any>,
) {
    intercepts.set(original, { replacement, extraProps });
}

export function patchCreateElement(cleanups: (() => void)[]) {
    if (isPatched) return;

    // Guard against React.createElement being null in some environments
    origCreateElement = React.createElement;
    if (!origCreateElement) {
        console.warn("[ServerDrawer] React.createElement is null, skipping patch");
        return;
    }

    const patched = function (type: any, props: any, ...rest: any[]) {
        if (!origCreateElement) {
            // Fallback to original createElement if somehow null (should not happen)
            return React.createElement(type, props, ...rest);
        }
        const entry = intercepts.get(type);
        if (entry) {
            const newProps = entry.extraProps
                ? { ...props, ...entry.extraProps }
                : props;
            return origCreateElement.call(React, entry.replacement, newProps, ...rest);
        }
        return origCreateElement.call(React, type, props, ...rest);
    };

    Object.assign(patched, origCreateElement);
    React.createElement = patched as typeof React.createElement;
    isPatched = true;

    cleanups.push(() => {
        if (isPatched && origCreateElement) {
            React.createElement = origCreateElement;
            isPatched = false;
        }
        intercepts.clear();
    });
}
