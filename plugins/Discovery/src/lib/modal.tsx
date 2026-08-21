import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { View, Pressable, StyleSheet, StatusBar } from "react-native";
import { usePalette, resolve, colors, CircleXIcon } from "./tokens";
import DText from "./DText";

const Modals: any = findByProps("pushLazy", "popWithKey");
const RootNavMod = findByProps("getRootNavigationRef");

const KEY = "DISCOVERY_PAGE_MODAL";

// Guards against stacked duplicate pages: pressing X pops exactly one layer, so two
// opens looked like a dead button (identical page underneath). One instance max.
let isOpen = false;

// popWithKey is silently ignored by this client build ("close pressed" logs, nothing
// happens) - so close via the same path as the hardware back gesture: goBack() on
// the root stack pops the top route, which is our modal.
export function closeDiscoveryModal() {
    console.log("[Discovery] close pressed - dispatching goBack");
    try {
        const ref = RootNavMod.getRootNavigationRef();
        ref.current?.goBack?.();
    } catch (e) {
        console.log("[Discovery] goBack failed:", e);
    }
}

export function DiscoveryModalChrome({ children }: { children: React.ReactNode }) {
    const palette = usePalette();
    React.useEffect(() => () => {
        isOpen = false;
    }, []);
    return (
        <View style={[st.page, { backgroundColor: palette.pageBg }]}>
            <StatusBar barStyle="light-content" backgroundColor={palette.pageBg} />
            <View style={[st.header, { borderBottomColor: palette.borderSubtle }]}>
                <View style={st.titleWrap} pointerEvents="none">
                    <DText variant="heading-md/semibold" color="mobile-text-heading-primary">{"Server Discovery"}</DText>
                </View>
                <Pressable onPress={closeDiscoveryModal} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
                    <View style={st.backBtn}>
                        <CircleXIcon width={24} height={24} color={resolve(colors.INTERACTIVE_TEXT_DEFAULT)} />
                    </View>
                </Pressable>
            </View>
            {children}
        </View>
    );
}

export function openDiscoveryModal(PageComponent: any): boolean {
    if (isOpen) {
        console.log("[Discovery] already open - ignoring");
        return true;
    }
    isOpen = true;
    const Screen = () => (
        <DiscoveryModalChrome>
            <PageComponent />
        </DiscoveryModalChrome>
    );
    Modals.pushLazy(Promise.resolve({ default: Screen }), KEY);
    console.log("[Discovery] opened via internal modal layer");
    return true;
}

const st = StyleSheet.create({
    page: {
        flex: 1,
        paddingTop: StatusBar.currentHeight ?? 0,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    titleWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
});
