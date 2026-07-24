import React from "react";
import { View, Text, Animated, Pressable, Image, ViewStyle, StyleSheet } from "react-native";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { useFolderExpanded, GuildNode } from "../utils/theme";
import GuildIcon from "./GuildIcon";
import GuildItem from "./GuildItem";

const GuildActions = findByProps("toggleGuildFolderExpand");
const Flux = findByProps("useStateFromStores");
const GuildReadStateStore = findByStoreName("GuildReadStateStore");

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

export default function FolderItem({ node, onPick }: { node: GuildNode; onPick: (id: string) => void }) {
    const open = useFolderExpanded(node.id);

    const toggle = () => {
        GuildActions?.toggleGuildFolderExpand?.(node.id);
    };

    if (open) {
        return (
            <>
                <Pressable onPress={toggle}>
                    <View style={[fo.openIcon, { backgroundColor: folderColor(node.color) }]}>
                        <Image source={FOLDER_ASSET} style={fo.folderImg} tintColor="#fff" />
                    </View>
                </Pressable>
                {node.children.map((ch) => (
                    <FadeIn key={ch.id}>
                        <GuildItem node={ch} onPick={onPick} />
                    </FadeIn>
                ))}
            </>
        );
    }

    return (
        <Pressable onPress={toggle}>
            <FolderCover node={node} />
        </Pressable>
    );
}

const fo = StyleSheet.create({
    openIcon: {
        width: ICON,
        height: ICON,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    folderImg: { width: 24, height: 24 },
});

const fbd = StyleSheet.create({
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
});
