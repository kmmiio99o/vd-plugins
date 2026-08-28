import { registerPropsTransform, registerPropsIntercept } from "./createElementIntercept";

const TAG = "[ServerDrawer]";

// The quest dock's outer wrapper carries an opaque card background (borderRadius: 24) via
// useAnimatedStyle - no component reference to intercept, so match on the computed style instead.
// The color itself varies in format (rgba vs hex), so borderRadius + "has a background color" is
// the stable signal, not the color string.
function isQuestDockCard(props: any): boolean {
    const root = props?.style;
    if (!root) return false;

    const styles = Array.isArray(root) ? root : [root];
    for (let i = 0; i < styles.length; i++) {
        const entry = styles[i];
        if (!entry || typeof entry !== "object") continue;
        const s = Array.isArray(entry) ? Object.assign({}, ...entry.map((e: any) =>
            Array.isArray(e) ? Object.assign({}, ...e.map((f: any) => f ?? {})) : (e ?? {}))) : entry;
        if (s.borderRadius === 24 && typeof s.backgroundColor === "string" &&
            s.position === "absolute" && s.left === "50%" && s.zIndex === 1) {
            return true;
        }
    }
    return false;
}

// Removing the card color reveals a second layer underneath: the quest's promotional hero photo.
// Matched by URL shape, not component, since the same image component renders ordinary guild/
// folder icons everywhere else too.
function getSourceUri(props: any): string | undefined {
    const source = props?.source;
    if (!source) return undefined;
    if (Array.isArray(source)) return source[0]?.uri;
    return source.uri;
}

function isQuestHeroImage(props: any): boolean {
    const uri = getSourceUri(props);
    return typeof uri === "string" && uri.includes("/quests/");
}

export function patchTransparentBackground(): boolean {
    registerPropsTransform(
        (props: any) => isQuestDockCard(props),
        (props: any) => ({
            ...props,
            style: [props?.style, { backgroundColor: "transparent" }],
        }),
    );
    registerPropsIntercept(isQuestHeroImage, null);
    console.log(TAG, "PATCH: watching for the quest dock card background and hero image");
    return true;
}
