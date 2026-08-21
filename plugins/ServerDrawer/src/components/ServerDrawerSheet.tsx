import React from "react";
import { View, Text, Pressable, Animated, Dimensions, StyleSheet, BackHandler, ScrollView } from "react-native";
import { find, findByProps, findByStoreName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { GuildNode } from "../utils/theme";
import { getGestureContext } from "../utils/gestureContext";
import GuildItem from "./GuildItem";
import FolderItem from "./FolderItem";
import DmTile from "./DmTile";

const Flux = findByProps("useStateFromStores");
const SortedGuildStore = findByStoreName("SortedGuildStore");
const RootNav = findByProps("getRootNavigationRef");
const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");
const Routing = findByProps("transitionToGuild");

const CreateGuildMod = find((m: any) => typeof m?.openCreateGuildModal === "function");
const CirclePlusIcon = find((m: any) => m?.CirclePlusIcon)?.CirclePlusIcon;
const rawColors = findByProps("colors", "unsafe_rawColors")?.unsafe_rawColors;

const createJoinBg = rawColors?.GREEN_360;
const createJoinIconColor = rawColors?.WHITE;

const ExternalCoordinationMod = find((m: any) => m?.QuestDockExternalCoordinationContext);
const ExternalContext = ExternalCoordinationMod?.QuestDockExternalCoordinationContext;
const QuestDockMode = find((m: any) => m?.QuestDockMode?.COLLAPSED != null)?.QuestDockMode;

const CompassIcon = find((m: any) => m?.CompassIcon)?.CompassIcon;

// Compatibility with the Discovery plugin: show a discovery tile in the grid when it's installed
function isDiscoveryEnabled(): boolean {
    const plugins = (globalThis as any)?.vendetta?.plugins?.plugins;
    if (!plugins) return false;
    return Object.values(plugins).some(
        (p: any) => p?.manifest?.name === "Discovery" && p?.enabled,
    );
}

function DiscoveryTile({ onPress }: { onPress: () => void }) {
    const scale = React.useRef(new Animated.Value(1)).current;
    const scaleDown = React.useCallback(() => {
        Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
    }, [scale]);
    const scaleUp = React.useCallback(() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }, [scale]);

    const bg = rawColors?.INTERACTIVE_ACTIVE ?? "#41434a";

    return (
        <Pressable onPress={onPress} onPressIn={scaleDown} onPressOut={scaleUp}>
            <Animated.View style={[st.discoveryTile, { backgroundColor: bg, transform: [{ scale }] }]}>
                {CompassIcon ? (
                    <CompassIcon size="md" color={rawColors?.WHITE} />
                ) : (
                    <Text style={st.createJoinFallback}>{"⌖"}</Text>
                )}
            </Animated.View>
        </Pressable>
    );
}

const ICON = 48;
const GAP = 6;
const PAD = 12;

const FallbackGestureContext = React.createContext(null);

function CreateJoinButton({ onPress }: { onPress: () => void }) {
    const scale = React.useRef(new Animated.Value(1)).current;
    const scaleDown = React.useCallback(() => {
        Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
    }, [scale]);
    const scaleUp = React.useCallback(() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }, [scale]);

    return (
        <Pressable onPress={onPress} onPressIn={scaleDown} onPressOut={scaleUp}>
            <Animated.View style={[st.createJoin, { transform: [{ scale }] }]}>
                {CirclePlusIcon ? (
                    <CirclePlusIcon size="md" color={createJoinIconColor} />
                ) : (
                    <Text style={st.createJoinFallback}>{"+"}</Text>
                )}
            </Animated.View>
        </Pressable>
    );
}

export default function ServerDrawerSheet({ gestureContext }: { gestureContext: any }) {
    useProxy(storage);

    const pick = React.useCallback((id: string) => {
        Haptic?.triggerHapticFeedback(Haptic.HapticFeedbackTypes.SOFT);
        if (Routing?.transitionToGuild) {
            Routing.transitionToGuild(id, null);
        } else {
            RootNav?.getRootNavigationRef()?.navigate("guilds", { guildId: id });
        }
    }, []);

    const nodes: GuildNode[] = Flux?.useStateFromStores?.(
        [SortedGuildStore],
        () => {
            const t = SortedGuildStore?.getGuildsTree();
            return (t?.root?.children || []).filter((n: GuildNode) => n.type !== "root");
        },
    ) ?? [];

    const gestureCtx = (gestureContext ?? getGestureContext()) as React.Context<any> | null;
    const ctx = React.useContext(gestureCtx ?? FallbackGestureContext) as any;
    const minH = ctx?.minExpandedContentHeight;

    const onLayout = React.useCallback((e: any) => {
        if (!minH) return;
        const h = e.nativeEvent.layout.height;
        if (minH.get() !== h) minH.set(h);
    }, [minH]);

    const extCtx = ExternalContext ? React.useContext(ExternalContext) as any : null;
    const setMode = extCtx?.setRestingQuestDockMode;

    // Navigating from an expanded dock leaves the sheet covering the new screen -
    // collapse it first so pushed routes/modals are actually visible.
    const collapseDock = React.useCallback(() => {
        try {
            if (setMode && QuestDockMode?.COLLAPSED != null) setMode(QuestDockMode.COLLAPSED);
        } catch {
            // dock coordination unavailable - navigation still works
        }
    }, [setMode]);

    const openDiscovery = React.useCallback(() => {
        collapseDock();
        // Preferred: the Discovery plugin's own opener (same page as its guilds-bar tile)
        const bridge = (globalThis as any).__discoveryOpenPage;
        if (typeof bridge === "function") {
            bridge();
            return;
        }
        // Fallback: vanilla discovery route through the proven router
        if (Routing?.transitionTo) {
            Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.SOFT);
            Routing.transitionTo("/guild-discovery");
        } else {
            console.log("[ServerDrawer] no discovery opener available");
        }
    }, [collapseDock]);

    const openCreateJoin = React.useCallback(() => {
        Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.SOFT);
        collapseDock();
        CreateGuildMod?.openCreateGuildModal?.();
    }, [collapseDock]);

    const specs = ctx?.questDockWrapperSpecs;

    React.useEffect(() => {
        if (!setMode || !QuestDockMode || !specs) return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            const h = specs.get()?.height ?? 56;
            if (h > 80) {
                setMode(QuestDockMode.COLLAPSED);
                return true;
            }
            return false;
        });
        return () => sub.remove();
    }, [setMode, specs]);

    const { width: winW } = Dimensions.get("window");

    const cols = Math.max(3, Math.floor((winW - PAD * 2 + GAP) / (ICON + GAP)));
    const totalW = cols * ICON + (cols - 1) * GAP;
    const padX = Math.max(0, (winW - totalW) / 2);

    return (
        <ScrollView style={st.alignTop} showsVerticalScrollIndicator={false}>
            <View
                style={[st.grid, { paddingHorizontal: padX, gap: GAP }]}
                onLayout={onLayout}
            >
                {!storage.hideDmTile && <DmTile />}
                {nodes.map((node) =>
                    node.type === "folder"
                        ? <FolderItem key={node.id} node={node} onPick={pick} showNames={!!storage.showGuildNames} />
                        : <GuildItem key={node.id} node={node} onPick={pick} showNames={!!storage.showGuildNames} />
                )}
                <CreateJoinButton onPress={openCreateJoin} />
                {isDiscoveryEnabled() && <DiscoveryTile onPress={openDiscovery} />}
            </View>
        </ScrollView>
    );
}

const st = StyleSheet.create({
    alignTop: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingTop: 4,
        paddingBottom: 16,
    },
    createJoin: {
        width: ICON,
        height: ICON,
        borderRadius: 16,
        backgroundColor: createJoinBg,
        alignItems: "center",
        justifyContent: "center",
    },
    discoveryTile: {
        width: ICON,
        height: ICON,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    createJoinFallback: {
        color: createJoinIconColor,
        fontSize: 28,
        fontWeight: "700",
        lineHeight: 30,
    },
});
