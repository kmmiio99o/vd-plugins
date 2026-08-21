import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { View, Pressable, StyleSheet } from "react-native";
import {
    colors,
    resolve,
    CompassIcon,
    TILE,
    MARGIN,
    useStockTileStyles,
} from "../lib/tokens";
import { openDiscoveryModal } from "../lib/modal";
import DiscoveryPage from "./DiscoveryPage";

const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");

export default function DiscoveryButton() {
    const stock = useStockTileStyles();
    const fg = resolve(colors.MOBILE_GUILDBAR_ICON_DEFAULT);

    const open = () => {
        Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.SOFT);
        openDiscoveryModal(DiscoveryPage);
    };

    return (
        <View style={st.row}>
            <Pressable onPress={open} accessibilityRole="button" accessibilityLabel="Server Discovery">
                <View style={[st.tile, stock.itemShape]}>
                    <CompassIcon size="md" color={fg} />
                </View>
            </Pressable>
        </View>
    );
}

const st = StyleSheet.create({
    row: {
        alignSelf: "stretch",
        alignItems: "center",
        paddingTop: MARGIN,
        paddingBottom: MARGIN,
    },
    tile: {
        width: TILE,
        height: TILE,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
});
