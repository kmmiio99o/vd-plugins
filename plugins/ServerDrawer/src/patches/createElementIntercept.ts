import { React } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";

interface Intercept {
    replacement: React.ComponentType<any>;
    extraProps?: Record<string, any>;
    /** How many collapsed-to-zero-size ancestor levels above this element are also allowed to collapse (0 = none). */
    collapseAncestors?: number;
}

interface PropsIntercept {
    predicate: (props: any, type: any, rest: any[]) => boolean;
    replacement: React.ComponentType<any> | null;
}

interface PropsTransform {
    predicate: (props: any, type: any, rest: any[]) => boolean;
    transform: (props: any) => any;
}

interface TypeDetector {
    key: string;
    predicate: (type: any) => boolean;
    onDetected: (type: any) => void;
    persistent: boolean;
    justFired?: boolean;
    negative?: WeakSet<any>;
}

const intercepts = new Map<React.ComponentType<any>, Intercept>();
const propsIntercepts: PropsIntercept[] = [];
const propsTransforms: PropsTransform[] = [];
let typeDetectors: TypeDetector[] = [];
const detectorKeys = new Set<string>();
let isPatched = false;

// Elements are created child-first, so a collapse mark on a child is already present by the time
// the parent's own call is intercepted - that's what makes walking the collapse upward possible.
const collapseMarks = new WeakMap<object, number>();
let collapseMarkCount = 0;

// display: none alone doesn't reclaim space on every layout, so this also zeroes width/flex/margin
// and hides overflow.
const COLLAPSE_STYLE = {
    display: "none" as const,
    width: 0,
    minWidth: 0,
    maxWidth: 0,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 0,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden" as const,
};

export function registerIntercept(
    original: React.ComponentType<any>,
    replacement: React.ComponentType<any>,
    extraProps?: Record<string, any>,
    options?: { collapseAncestors?: number },
) {
    intercepts.set(original, { replacement, extraProps, collapseAncestors: options?.collapseAncestors });
}

// Matches on a props predicate instead of an exact type reference, for components with no
// reliable name. Pass replacement: null to render nothing.
export function registerPropsIntercept(predicate: (props: any, type: any, rest: any[]) => boolean, replacement: React.ComponentType<any> | null) {
    propsIntercepts.push({ predicate, replacement });
}

// Rewrites props in place, keeping the same type.
export function registerPropsTransform(predicate: (props: any, type: any, rest: any[]) => boolean, transform: (props: any) => any) {
    propsTransforms.push({ predicate, transform });
}

// Fires onDetected(type) the first time a matching element is created. For components with no
// stable module export to search for after the fact. persistent keeps firing on every match
// instead of once, for references that change across navigation.
export function registerTypeDetector(
    key: string,
    predicate: (type: any) => boolean,
    onDetected: (type: any) => void,
    options?: { persistent?: boolean },
) {
    if (detectorKeys.has(key)) return;
    detectorKeys.add(key);
    typeDetectors.push({ key, predicate, onDetected, persistent: options?.persistent ?? false });
}

export function hasTypeDetector(key: string): boolean {
    return detectorKeys.has(key);
}

function runTypeDetectors(type: any) {
    if (typeDetectors.length === 0) return;
    if (intercepts.size > 0 && intercepts.has(type)) return;
    if (!type || (typeof type !== "function" && typeof type !== "object")) return;

    let consumed = false;
    for (const detector of typeDetectors) {
        if (detector.negative?.has(type)) continue;
        let matched = false;
        try {
            matched = detector.predicate(type);
        } catch {
            // Ignore
        }
        if (!matched) {
            (detector.negative ??= new WeakSet()).add(type);
            continue;
        }

        try {
            detector.onDetected(type);
        } catch {
            // Ignore
        }
        if (!detector.persistent) {
            detector.justFired = true;
            consumed = true;
        }
    }

    if (consumed) {
        typeDetectors = typeDetectors.filter((d) => d.persistent || !d.justFired);
    }
}

/** Returns the collapse depth a parent should inherit from its children (max of any real child, 0 if none). */
function inspectCollapseChild(child: any): number {
    if (child == null || child === false || typeof child !== "object") return 0;
    return collapseMarks.get(child) ?? 0;
}

function inheritedCollapseDepth(props: any, rest: any[] = []): number {
    let deepest = 0;

    const children = props?.children;
    if (children != null) {
        if (Array.isArray(children)) {
            for (const child of children) deepest = Math.max(deepest, inspectCollapseChild(child));
        } else {
            deepest = Math.max(deepest, inspectCollapseChild(children));
        }
    }

    for (const child of rest) deepest = Math.max(deepest, inspectCollapseChild(child));
    return deepest;
}

/** Returns a replacement type if this element should be intercepted, `null` to render nothing, or `undefined` to pass through unchanged. */
function resolveReplacement(type: any, props: any, rest: any[]): { type: any; props: any; collapse?: number } | null | undefined {
    // Fast path first: an exact reference already intercepted (GuildsBar, HomePanelContent,
    // quest dock empties...). This is the O(1) map hit - avoids re-running the expensive
    // name-matching detectors and transforms on every render of an already-handled component.
    const direct = intercepts.get(type);
    if (direct) {
        return {
            type: direct.replacement,
            props: direct.extraProps ? { ...props, ...direct.extraProps } : props,
            collapse: direct.collapseAncestors,
        };
    }

    runTypeDetectors(type);

    // A detector may have just registered an intercept for this exact type - honor it in the
    // same pass (so the first render is caught, not just the next one).
    const afterDetect = intercepts.get(type);
    if (afterDetect) {
        return {
            type: afterDetect.replacement,
            props: afterDetect.extraProps ? { ...props, ...afterDetect.extraProps } : props,
            collapse: afterDetect.collapseAncestors,
        };
    }

    let effectiveProps = props;
    if (effectiveProps) {
        for (const { predicate, transform } of propsTransforms) {
            try {
                if (predicate(effectiveProps, type, rest)) {
                    effectiveProps = transform(effectiveProps);
                }
            } catch {
                // Ignore
            }
        }
    }

    if (effectiveProps) {
        for (const { predicate, replacement } of propsIntercepts) {
            try {
                if (predicate(effectiveProps, type, rest)) {
                    return replacement ? { type: replacement, props: effectiveProps } : null;
                }
            } catch {
                // Ignore
            }
        }
    }

    // A wrapper whose only child was already collapsed - zero it out too and pass the remaining budget up.
    // Only walk children when something has actually collapsed (rare), otherwise skip this cost entirely.
    if (collapseMarkCount > 0) {
        const inherited = inheritedCollapseDepth(effectiveProps, rest);
        if (inherited > 0) {
            return {
                type,
                props: { ...effectiveProps, style: [effectiveProps?.style, COLLAPSE_STYLE] },
                collapse: inherited - 1,
            };
        }
    }

    if (effectiveProps !== props) {
        return { type, props: effectiveProps };
    }

    return undefined;
}

// after() only sees the return value, not the call itself, so we mutate the element in place
// rather than substituting args beforehand.
function applyResolved(res: any, type: any, props: any, rest: any[]) {
    if (!res || typeof res !== "object") return res;
    const resolved = resolveReplacement(type, props, rest);
    if (resolved === null) {
        res.type = () => null;
        return res;
    }
    if (resolved) {
        res.type = resolved.type;
        res.props = resolved.props ?? null;
        if (resolved.collapse && resolved.collapse > 0) {
            collapseMarks.set(res, resolved.collapse);
            collapseMarkCount++;
        }
    }
    return res;
}

export function patchCreateElement(cleanups: (() => void)[]) {
    if (isPatched) return;
    isPatched = true;

    cleanups.push(
        after("createElement", React, (args: any[], res: any) => applyResolved(res, args[0], args[1], args.slice(2)))
    );

    // Discord compiles JSX through jsx/jsxs/jsxDEV, not React.createElement - scan for those
    // runtimes by shape (names are mangled) and keep scanning since Metro registers lazily.
    const patchedJsxRuntimes = new WeakSet<any>();

    function isJsxRuntime(m: any): boolean {
        return typeof m?.jsx === "function" || typeof m?.jsxs === "function" || typeof m?.jsxDEV === "function";
    }

    function patchJsxObject(runtime: any): number {
        if (patchedJsxRuntimes.has(runtime)) return 0;
        patchedJsxRuntimes.add(runtime);
        let added = 0;
        for (const key of ["jsx", "jsxs", "jsxDEV"] as const) {
            if (typeof runtime[key] !== "function") continue;
            cleanups.push(
                after(key, runtime, (args: any[], res: any) => applyResolved(res, args[0], args[1], args.slice(2)))
            );
            added++;
        }
        return added;
    }

    function patchJsxModule(def: any): number {
        if (!def?.publicModule?.exports) return 0;
        const exports = def.publicModule.exports;
        let added = 0;
        try {
            if (isJsxRuntime(exports)) added += patchJsxObject(exports);

            const dflt = exports.default;
            if (dflt != null && isJsxRuntime(dflt)) added += patchJsxObject(dflt);
        } catch {
            // Ignore
        }
        return added;
    }

    function scanAndPatchJsxRuntimes(): number {
        const modules = (globalThis as any)?.modules;
        if (!modules) return -1;
        let added = 0;
        for (const id in modules) {
            const def = modules[id];
            if (!def?.isInitialized) continue;
            added += patchJsxModule(def);
        }
        return added;
    }

    scanAndPatchJsxRuntimes();

    let ticks = 0;
    let idleStreak = 0;
    let timer: ReturnType<typeof setInterval> | undefined = setInterval(() => {
        const added = scanAndPatchJsxRuntimes();
        if (added === 0) idleStreak++;
        else idleStreak = 0;
        ticks++;
        if (timer && ((ticks >= 50) || (ticks > 10 && idleStreak >= 3))) {
            clearInterval(timer);
            if (ticks < 50) { timer = undefined; return; }
            const slowTimer: ReturnType<typeof setInterval> = setInterval(() => {
                const a = scanAndPatchJsxRuntimes();
                if (a === 0) idleStreak++;
                else idleStreak = 0;
                if (idleStreak >= 3) { clearInterval(slowTimer); timer = undefined; }
            }, 2000);
            timer = slowTimer;
        }
    }, 100);

    cleanups.push(() => {
        if (timer) clearInterval(timer);
        timer = undefined;
        isPatched = false;
        intercepts.clear();
        propsIntercepts.length = 0;
        propsTransforms.length = 0;
        typeDetectors = [];
        detectorKeys.clear();
    });
}
