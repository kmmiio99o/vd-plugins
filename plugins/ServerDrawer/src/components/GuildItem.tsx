import React from "react";
import { View, Text, Pressable, Animated, StyleSheet } from "react-native";
import { find, findByProps, findByStoreName } from "@vendetta/metro";
import { GuildNode } from "../utils/theme";
import GuildIcon from "./GuildIcon";
import { ContextMenuModal, ContextMenuItem } from "./ContextMenuModal";

const ICON = 48;

const Flux = findByProps("useStateFromStores");
const GuildReadStateStore = findByStoreName("GuildReadStateStore");
const GuildStore = findByStoreName("GuildStore");
const SortedGuildStore = findByStoreName("SortedGuildStore");
const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");

function Badge({ guildId }: { guildId: string }) {
    const mentionCount = Flux?.useStateFromStores?.(
        [GuildReadStateStore],
        () => GuildReadStateStore?.getMentionCount?.(guildId) ?? 0,
        [guildId],
    ) ?? 0;

    const hasUnread = Flux?.useStateFromStores?.(
        [GuildReadStateStore],
        () => GuildReadStateStore?.hasUnread?.(guildId) ?? false,
        [guildId],
    ) ?? false;

    if (mentionCount > 0) {
        return (
            <View style={bd.outline}>
                <View style={bd.badge}>
                    <Text style={bd.text}>{mentionCount > 99 ? "99+" : String(mentionCount)}</Text>
                </View>
            </View>
        );
    }

    if (hasUnread) {
        return (
            <View style={bd.dotOutline}>
                <View style={bd.dot} />
            </View>
        );
    }

    return null;
}

export default function GuildItem({ node, onPick }: { node: GuildNode; onPick: (id: string) => void }) {
    const viewRef = React.useRef<View>(null);
    const scale = React.useRef(new Animated.Value(1)).current;
    const scaleDown = () => Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start();
    const scaleUp = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    const [menuState, setMenuState] = React.useState<{
        visible: boolean;
        items: ContextMenuItem[];
        title: string;
        x: number;
        y: number;
    }>({ visible: false, items: [], title: "", x: 0, y: 0 });

    const showMenu = React.useCallback(() => {
        const guildId = node.id as string;
        const guild = GuildStore?.getGuild?.(guildId);
        const menuItemsFn = find((m) => m?.default?.name === "getGuildsBarGuildMenuItems")?.default
            ?? find((m) => typeof m?.default === "function" && m.default.length <= 2 && /guild/i.test(m.default.name ?? ""))?.default;

        if (!guild || !menuItemsFn) {
            return;
        }

        const treeVersion = SortedGuildStore?.getGuildsTree?.()?.version;
        const rawItems = menuItemsFn(guildId, treeVersion);
        if (!rawItems?.length) return;

        const ref = viewRef.current as any;
        if (!ref?.measure) return;

        ref.measure((_fx: number, _fy: number, _w: number, _h: number, pageX: number, pageY: number) => {
            setMenuState({
                visible: true,
                items: rawItems.map((item: any) => ({
                    label: item.label ?? item.title ?? "Unknown",
                    action: item.action,
                    danger: item.variant === "destructive",
                    iconSource: item.iconSource,
                    IconComponent: item.IconComponent,
                })),
                title: guild.name,
                x: pageX,
                y: pageY,
            });
        });
    }, [node.id]);

    const handleLongPress = React.useCallback(() => {
        Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.IMPACT_MEDIUM);
        showMenu();
    }, [showMenu]);

    const guildId = node.id as string;

    return (
        <>
            <Pressable
                onPressIn={scaleDown}
                onPressOut={scaleUp}
                onPress={() => onPick(guildId)}
                onLongPress={handleLongPress}
                delayLongPress={500}
            >
                <View ref={viewRef} style={st.outer} collapsable={false}>
                    <Animated.View style={[st.icon, { transform: [{ scale }] }]}>
                        <GuildIcon id={guildId} />
                    </Animated.View>
                    <Badge guildId={guildId} />
                </View>
            </Pressable>
            <ContextMenuModal
                visible={menuState.visible}
                items={menuState.items}
                title={menuState.title}
                anchorX={menuState.x}
                anchorY={menuState.y}
                onClose={() => setMenuState((s) => ({ ...s, visible: false }))}
            />
        </>
    );
}

const st = StyleSheet.create({
    outer: { width: ICON, height: ICON },
    icon: { width: ICON, height: ICON, borderRadius: 16, overflow: "hidden" },
});

const bd = StyleSheet.create({
    outline: {
        position: "absolute",
        bottom: -3,
        right: -3,
        minWidth: 23,
        minHeight: 23,
        borderRadius: 12,
        backgroundColor: "#1a1a2e",
        alignItems: "center",
        justifyContent: "center",
    },
    badge: {
        minWidth: 19,
        height: 19,
        borderRadius: 9,
        backgroundColor: "#ed4245",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
    },
    text: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
        lineHeight: 19,
    },
    dotOutline: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: "#1a1a2e",
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#ed4245",
    },
});
