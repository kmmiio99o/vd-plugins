import React from "react";
import { View } from "react-native";
import { registerPropsTransform, registerTypeDetector, registerIntercept } from "./createElementIntercept";

const TAG = "[ServerDrawer]";
const SD_NOTHING_TEST_ID = "ServerDrawerNothing";

function Nothing() {
    return React.createElement(View, {
        style: {
            display: "none",
            width: 0,
            minWidth: 0,
            maxWidth: 0,
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: 0,
            margin: 0,
            padding: 0,
            borderWidth: 0,
            overflow: "hidden",
        },
    });
}

// The parent creates GuildsBar via its outer React.memo wrapper object, which has no own
// .name/.displayName at all - those only exist on the memo's inner function, at
// type.type.name/type.type.displayName.
function isGuildsBar(type: any): boolean {
    return type?.name === "GuildsBar" || type?.displayName === "GuildsBar" ||
        type?.type?.name === "GuildsBar" || type?.type?.displayName === "GuildsBar";
}

function hasChildWithTestID(children: any, rest: any[], testID: string): boolean {
    const inspect = (child: any) => child != null && typeof child === "object" && child.props?.testID === testID;
    if (children != null) {
        if (Array.isArray(children)) { if (children.some(inspect)) return true; }
        else if (inspect(children)) return true;
    }
    for (const child of rest) if (inspect(child)) return true;
    return false;
}

export function patchHideGuildsBar(): boolean {
    // Rendering GuildsBar as nothing alone still leaves its space reserved - the immediate parent
    // carries an explicit width in its own style, so display: none on the child doesn't reclaim
    // it. This zeroes the parent wrapper too once it spots the hidden marker as a child.
    registerPropsTransform(
        (props: any, _type: any, rest: any[]) =>
            hasChildWithTestID(props?.children, rest, SD_NOTHING_TEST_ID),
        (props: any) => ({
            ...props,
            style: [
                props?.style,
                {
                    display: "none",
                    width: 0,
                    minWidth: 0,
                    maxWidth: 0,
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: 0,
                    margin: 0,
                    padding: 0,
                    borderWidth: 0,
                    overflow: "hidden",
                },
            ],
        }),
    );

    registerTypeDetector("ServerDrawer.HideGuildsBar", isGuildsBar, (realGuildsBar) => {
        registerIntercept(realGuildsBar, Nothing, { testID: SD_NOTHING_TEST_ID }, { collapseAncestors: 6 });
        console.log(TAG, "PATCH: found a real GuildsBar reference, now rendering nothing");
    }, { persistent: true });
    console.log(TAG, "PATCH: watching for the real GuildsBar to appear");
    return true;
}
