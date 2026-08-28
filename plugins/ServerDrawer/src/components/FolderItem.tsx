import React from "react";
import { View, Text, Animated, Pressable, Image, ViewStyle, StyleSheet } from "react-native";
import { find, findByProps, findByStoreName } from "@vendetta/metro";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { useFolderExpanded, GuildNode } from "../utils/theme";
import GuildIcon from "./GuildIcon";
import GuildItem from "./GuildItem";
import { ContextMenuModal, ContextMenuItem } from "./ContextMenuModal";

const GuildActions = findByProps("toggleGuildFolderExpand");
const Flux = findByProps("useStateFromStores");
const GuildReadStateStore = findByStoreName("GuildReadStateStore");
const SortedGuildStore = findByStoreName("SortedGuildStore");
const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");
const colors = findByProps("colors", "unsafe_rawColors")?.colors;

const ICON = 48;
const MINI = 16;

const POS: ViewStyle[] = [
    { top: 6, left: 6 },
    { top: 6, right: 6 },
    { bottom: 6, left: 6 },
    { bottom: 6, right: 6 },
];

const FOLDER_ASSET = getAssetIDByName("FolderIcon");

function folderColor(color?: number | null): string {
    if (color == null) return "#5865f2";
    return `#${color.toString(16).padStart(6, "0")}`;
}

function FolderBadge({ node }: { node: GuildNode }) {
    const total = Flux?.useStateFromStores?.(
        [GuildReadStateStore],
        () => {
            let sum = 0;
            for (const child of node.children) {
                sum += GuildReadStateStore?.getMentionCount?.(child.id) ?? 0;
            }
            return sum;
        },
        [node.children],
    ) ?? 0;

    if (total > 0) {
        return (
            <View style={fbd.outline}>
                <View style={fbd.badge}>
                    <Text style={fbd.text}>{total > 99 ? "99+" : String(total)}</Text>
                </View>
            </View>
        );
    }
    return null;
}

function FolderCover({ node }: { node: GuildNode }) {
    const col = folderColor(node.color);
    return (
        <View style={fc.outer}>
            <View style={[fc.icon, { backgroundColor: col }]}>
                {node.children.slice(0, 4).map((ch, i) => (
                    <View key={ch.id} style={[fc.cell, POS[i]]}>
                        <GuildIcon id={ch.id as string} size={MINI} />
                    </View>
                ))}
            </View>
            <FolderBadge node={node} />
        </View>
    );
}

const fc = StyleSheet.create({
    outer: { width: ICON, height: ICON },
    icon: { width: ICON, height: ICON, borderRadius: 16, overflow: "hidden" },
    cell: { position: "absolute", width: MINI, height: MINI, borderRadius: 8, overflow: "hidden" },
});

function FadeIn({ children }: { children: React.ReactNode }) {
    const opacity = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    }, []);
    return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

export default function FolderItem({ node, onPick, showNames }: { node: GuildNode; onPick: (id: string) => void; showNames?: boolean }) {
    const open = useFolderExpanded(node.id);

    const toggle = () => {
        GuildActions?.toggleGuildFolderExpand?.(node.id);
    };

    const viewRef = React.useRef<View>(null);

    const scale = React.useRef(new Animated.Value(1)).current;
    const [pressed, setPressed] = React.useState(false);
    const springTo = React.useCallback((v: number) => {
        Animated.spring(scale, { toValue: v, useNativeDriver: true, damping: 14, stiffness: 220 }).start();
    }, [scale]);

    React.useEffect(() => {
        springTo(pressed ? 0.85 : 1);
    }, [pressed, springTo]);

    React.useEffect(() => {
        springTo(1);
    }, [open, springTo]);

    const [menuState, setMenuState] = React.useState<{
        visible: boolean;
        items: ContextMenuItem[];
        title: string;
        x: number;
        y: number;
    }>({ visible: false, items: [], title: "", x: 0, y: 0 });

    const showMenu = React.useCallback(() => {
        const menuItemsFn = find((m) => typeof m?.getGuildFolderMenuItems === "function")?.getGuildFolderMenuItems
            ?? find((m) => m?.default?.name === "getGuildsBarFolderMenuItems")?.default
            ?? find((m) => typeof m?.default === "function" && m.default.length <= 2 && /folder/i.test(m.default.name ?? ""))?.default;

        if (!menuItemsFn) {
            return;
        }

        const treeVersion = SortedGuildStore?.getGuildsTree?.()?.version;
        const rawItems = menuItemsFn(node.id, treeVersion);
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
                title: typeof node.name === "string" && node.name.length > 0 ? node.name : "Folder",
                x: pageX,
                y: pageY,
            });
        });
    }, [node.id, node.name]);

    const handleLongPress = React.useCallback(() => {
        Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.IMPACT_MEDIUM);
        showMenu();
    }, [showMenu]);

    const folderContent = (icon: React.ReactNode) => (
        <View style={fo.wrap}>
            {icon}
            {showNames && node.name ? (
                <Text numberOfLines={2} ellipsizeMode="tail" style={fo.label}>
                    {node.name}
                </Text>
            ) : null}
        </View>
    );

    const folderButton = (content: React.ReactNode) => (
        <Pressable
            onPress={toggle}
            onLongPress={handleLongPress}
            delayLongPress={500}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
        >
            <View ref={viewRef} collapsable={false}>
                <Animated.View style={{ transform: [{ scale }] }}>{content}</Animated.View>
            </View>
        </Pressable>
    );

    return (
        <>
            {open ? (
                <>
                    {folderButton(
                        folderContent(
                            <View style={[fo.openIcon, { backgroundColor: folderColor(node.color) }]}>
                                <Image source={FOLDER_ASSET} style={fo.folderImg} tintColor="#fff" />
                            </View>,
                        ),
                    )}
                    {node.children.map((ch) => (
                        <FadeIn key={ch.id}>
                            <GuildItem node={ch} onPick={onPick} showNames={showNames} />
                        </FadeIn>
                    ))}
                </>
            ) : (
                folderButton(folderContent(<FolderCover node={node} />))
            )}
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

const fo = StyleSheet.create({
    wrap: { width: ICON, alignItems: "center" },
    openIcon: {
        width: ICON,
        height: ICON,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    folderImg: { width: 24, height: 24 },
    label: {
        marginTop: 4,
        width: ICON,
        fontSize: 10,
        lineHeight: 12,
        fontWeight: "600",
        textAlign: "center",
        color: colors.MOBILE_TEXT_HEADING_PRIMARY ?? "#fff",
        textShadowColor: "rgba(0,0,0,0.75)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});

const fbd = StyleSheet.create({
    outline: {
        position: "absolute",
        bottom: -3,
        right: -3,
        padding: 2,
        borderRadius: 999,
        backgroundColor: "#1a1a2e",
        alignItems: "center",
        justifyContent: "center",
    },
    badge: {
        minWidth: 19,
        height: 19,
        borderRadius: 999,
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
});
