import React from "react";
import { View, Pressable, Image, StyleSheet } from "react-native";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { findByProps, findByName } from "@vendetta/metro";

const ICON = 48;

const ChatIcon = getAssetIDByName("ChatIcon");
const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");
const ChannelActions = findByProps("selectPrivateChannel");
const SelectedChannelStore = findByName("SelectedChannelStore");
const Flux = findByProps("useStateFromStores");
const NavContext = findByProps("getGuildId");

const tokenRef: any = findByProps("SemanticColor");
const Themes: any = tokenRef?.default;
const internalResolver: any = Themes?.meta ?? Themes?.internal;
const UseThemeMod: any = findByProps("useThemeIndex", "getThemeIndex");

function useTokenColor(token: any): string | undefined {
    const theme = UseThemeMod?.useTheme?.();
    if (!internalResolver || !token || theme == null) return undefined;
    return internalResolver.resolveSemanticColor(theme, token);
}

function openDms() {
    Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.SOFT);
    if (ChannelActions?.selectPrivateChannel) {
        const lastChannelId = SelectedChannelStore?.getLastSelectedChannelId?.();
        ChannelActions.selectPrivateChannel(lastChannelId);
    }
}

function useDmTileColors() {
    const selected = Flux?.useStateFromStores?.(
        [NavContext],
        () => NavContext?.getGuildId?.() == null,
    ) ?? false;

    const bgSelected = useTokenColor(Themes?.colors?.BACKGROUND_BRAND);
    const bgIdle = useTokenColor(Themes?.colors?.MOBILE_GUILDBAR_ICON_BACKGROUND_DEFAULT);
    const fgSelected = useTokenColor(Themes?.colors?.WHITE);
    const fgIdle = useTokenColor(Themes?.colors?.MOBILE_GUILDBAR_ICON_DEFAULT);

    return {
        selected,
        bg: selected ? bgSelected : bgIdle,
        tint: selected ? fgSelected : fgIdle,
    };
}

// Original drawer tile (48x48)
export default function DmTile() {
    const { bg, tint } = useDmTileColors();

    return (
        <Pressable onPress={openDms} style={st.outer}>
            <View style={[st.icon, { backgroundColor: bg }]}>
                <Image source={ChatIcon} style={{ width: 24, height: 24, tintColor: tint }} />
            </View>
        </Pressable>
    );
}

// Rail DMs tile (icon centered vertically in rail, full-height touch target)
export function RailDmTile() {
    const { tint } = useDmTileColors();

    return (
        <Pressable onPress={openDms} style={railSt.outer}>
            <View style={railSt.icon}>
                <Image source={ChatIcon} style={{ width: 24, height: 24, tintColor: tint }} />
            </View>
        </Pressable>
    );
}

const st = StyleSheet.create({
    outer: { width: ICON, height: ICON },
    icon: { width: ICON, height: ICON, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});

const railSt = StyleSheet.create({
    outer: { flex: 1, width: "100%", alignItems: "center", justifyContent: "center" },
    icon: { width: ICON, height: ICON, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
