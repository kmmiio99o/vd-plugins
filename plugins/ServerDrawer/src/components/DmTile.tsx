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
const colors = findByProps("colors", "unsafe_rawColors")?.colors;

function openDms() {
    Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.SOFT);
    if (ChannelActions?.selectPrivateChannel) {
        const lastChannelId = SelectedChannelStore?.getLastSelectedChannelId?.();
        ChannelActions.selectPrivateChannel(lastChannelId);
    }
}

// Moved into the drawer's own grid as the first tile, since this plugin otherwise hides the
// native rail DMs used to live on.
export default function DmTile() {
    const selected = Flux?.useStateFromStores?.(
        [NavContext],
        () => NavContext?.getGuildId?.() == null,
    ) ?? false;

    return (
        <Pressable onPress={openDms} style={st.outer}>
            <View style={[st.icon, { backgroundColor: selected ? (colors?.BG_ACCENT ?? "#5865f2") : "rgba(128,128,128,0.24)" }]}>
                <Image source={ChatIcon} style={{ width: 24, height: 24, tintColor: "#fff" }} />
            </View>
        </Pressable>
    );
}

const st = StyleSheet.create({
    outer: { width: ICON, height: ICON },
    icon: { width: ICON, height: ICON, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
