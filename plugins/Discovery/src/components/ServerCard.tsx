import { findByProps, findByName } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { View, Image, Pressable, StyleSheet } from "react-native";
import type { DiscoveryServer } from "../lib/rest";
import { formatCount } from "../lib/rest";
import { usePalette, px, RADIUS, CheckmarkLargeIcon } from "../lib/tokens";
import DText from "../lib/DText";

const ActionSheets: any = findByProps("openLazy", "hideActionSheet");
const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");
const GuildProfileSheet = findByName("GuildProfileActionSheet");

interface Props {
    server: DiscoveryServer;
}

export default function ServerCard({ server }: Props) {
    const palette = usePalette();
    const verified = server.features?.includes("VERIFIED");
    const partnered = server.features?.includes("PARTNERED");

    const onPress = () => {
        Haptic.triggerHapticFeedback(Haptic.HapticFeedbackTypes.LIGHT);
        ActionSheets.openLazy(
            Promise.resolve({ default: GuildProfileSheet }),
            `GuildProfileActionSheet:${server.id}`,
            { guildId: server.id },
        );
    };

    return (
        <Pressable onPress={onPress}>
            <View style={[st.card, { backgroundColor: palette.card }]}>
                {server.bannerUrl ? (
                    <View style={[st.bannerWrap, { borderBottomColor: palette.borderSubtle }]}>
                        <Image source={{ uri: server.bannerUrl }} style={st.banner} resizeMode="cover" />
                    </View>
                ) : null}
                <View style={st.bodyRow}>
                    {server.iconUrl ? (
                        <View style={[st.iconWrap, { backgroundColor: palette.pageBg, borderColor: palette.borderSubtle }]}>
                            <Image source={{ uri: server.iconUrl }} style={st.icon} />
                        </View>
                    ) : null}
                    <View style={st.titleBlock}>
                        <View style={st.nameRow}>
                            <DText variant="redesign/channel-title/semibold" numberOfLines={1}>
                                {server.name}
                            </DText>
                            {(verified || partnered) && (
                                <View style={st.badge}>
                                    <CheckmarkLargeIcon
                                        width={10}
                                        height={10}
                                        color={verified ? palette.brand : "#1db0c5"}
                                    />
                                </View>
                            )}
                        </View>
                        <View style={st.countsRow}>
                            <View style={[st.dot, { backgroundColor: palette.positive }]} />
                            <DText variant="text-xs/normal" color="text-muted">
                                {`${formatCount(server.presenceCount)} Online`}
                            </DText>
                            <View style={[st.dotSep, { backgroundColor: palette.modSubtle }]} />
                            <DText variant="text-xs/normal" color="text-muted">
                                {`${formatCount(server.memberCount)} Members`}
                            </DText>
                        </View>
                    </View>
                </View>
                {server.description ? (
                    <View style={st.descriptionWrap}>
                        <DText variant="text-sm/normal" color="text-muted" numberOfLines={2}>
                            {server.description}
                        </DText>
                    </View>
                ) : null}
            </View>
        </Pressable>
    );
}

const st = StyleSheet.create({
    card: {
        borderRadius: RADIUS.lg,
        marginHorizontal: px(16),
        marginTop: px(12),
        overflow: "hidden",
    },
    bannerWrap: {
        width: "100%",
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    bodyRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: px(12),
        paddingTop: px(10),
        paddingBottom: px(10),
    },
    banner: {
        width: "100%",
        height: 90,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.round,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        marginRight: px(8),
        borderWidth: StyleSheet.hairlineWidth,
    },
    icon: {
        width: "100%",
        height: "100%",
    },
    titleBlock: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    badge: {
        marginLeft: px(4),
        alignItems: "center",
        justifyContent: "center",
    },
    countsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    dotSep: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        marginHorizontal: 6,
    },
    descriptionWrap: {
        paddingHorizontal: px(12),
        paddingTop: px(4),
        paddingBottom: px(12),
    },
});
