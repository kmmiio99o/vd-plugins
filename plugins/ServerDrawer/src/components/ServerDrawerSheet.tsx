import React from "react";
import { View, Text, Pressable, Animated, Dimensions, StyleSheet, BackHandler } from "react-native";
import { find, findByProps, findByStoreName } from "@vendetta/metro";
import { GuildNode } from "../utils/theme";
import GuildItem from "./GuildItem";
import FolderItem from "./FolderItem";

const Flux = findByProps("useStateFromStores");
const SortedGuildStore = findByStoreName("SortedGuildStore");
const RootNav = findByProps("getRootNavigationRef");
const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");
const Routing = findByProps("transitionToGuild");

const CreateJoinGuildMod = find((m: any) => typeof m?.handleCreateJoinGuildPress === "function");
const CirclePlusIcon = find((m: any) => m?.CirclePlusIcon)?.CirclePlusIcon;
const rawColors = findByProps("colors", "unsafe_rawColors")?.unsafe_rawColors;

const createJoinBg = rawColors?.GREEN_360;
const createJoinIconColor = rawColors?.WHITE;

const ExternalCoordinationMod = find((m: any) => m?.QuestDockExternalCoordinationContext);
const ExternalContext = ExternalCoordinationMod?.QuestDockExternalCoordinationContext;
const QuestDockMode = find((m: any) => m?.QuestDockMode?.COLLAPSED != null)?.QuestDockMode;

const ICON = 48;
const GAP = 6;
const PAD = 12;

function CreateJoinButton() {
    const scale = React.useRef(new Animated.Value(1)).current;
    const scaleDown = React.useCallback(() => {
        Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
    }, [scale]);
    const scaleUp = React.useCallback(() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }, [scale]);

    const onPress = React.useCallback(() => {
        Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.SOFT);
        CreateJoinGuildMod?.handleCreateJoinGuildPress?.();
    }, []);

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

    const ctx = (gestureContext ? React.useContext(gestureContext) : null) as any;
    const minH = ctx?.minExpandedContentHeight;

    const onLayout = React.useCallback((e: any) => {
        if (!minH) return;
        const h = e.nativeEvent.layout.height;
        if (minH.get() !== h) minH.set(h);
    }, [minH]);

    const extCtx = ExternalContext ? React.useContext(ExternalContext) as any : null;
    const setMode = extCtx?.setRestingQuestDockMode;

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
        <View style={st.alignTop}>
            <View
                style={[st.grid, { paddingHorizontal: padX, gap: GAP }]}
                onLayout={onLayout}
            >
                {nodes.map((node) =>
                    node.type === "folder"
                        ? <FolderItem key={node.id} node={node} onPick={pick} />
                        : <GuildItem key={node.id} node={node} onPick={pick} />
                )}
                <CreateJoinButton />
            </View>
        </View>
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
    createJoinFallback: {
        color: createJoinIconColor,
        fontSize: 28,
        fontWeight: "700",
        lineHeight: 30,
    },
});
