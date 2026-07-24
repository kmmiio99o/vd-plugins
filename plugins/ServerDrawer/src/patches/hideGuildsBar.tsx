import React from "react";
import { Pressable, Image, View } from "react-native";
import { find, findByName, findByProps } from "@vendetta/metro";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { registerIntercept } from "./createElementIntercept";

const TAG = "[ServerDrawer]";

const ChatIcon = getAssetIDByName("ChatIcon");
const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");
const ChannelActions = findByProps("selectPrivateChannel");
const SelectedChannelStore = findByName("SelectedChannelStore");
const FluxStores = findByProps("useStateFromStores");
const useStateFromStores = FluxStores?.useStateFromStores;
const GuildStore = findByProps("getGuildId");
const colors = findByProps("colors", "unsafe_rawColors")?.colors;
const Routes = findByProps("ME");
const ME = Routes?.ME ?? "/channels/@me";

function openDms() {
    Haptic?.triggerHapticFeedback(Haptic.HapticFeedbackTypes.SOFT);
    if (ChannelActions?.selectPrivateChannel) {
        const lastChannelId = SelectedChannelStore?.getLastSelectedChannelId?.();
        ChannelActions.selectPrivateChannel(lastChannelId);
    }
}

function useIsInDms(): boolean {
    try {
        return GuildStore ? useStateFromStores([GuildStore], () => {
            const guildId = GuildStore?.getGuildId?.();
            return guildId == null || guildId === ME;
        }) : false;
    } catch { return false; }
}

function DmsGuildIcon() {
    const selected = useIsInDms();

    const iconColor = selected
        ? (colors?.WHITE ?? "#fff")
        : (colors?.INTERACTIVE_NORMAL ?? "#80848e");

    return (
        <Pressable onPress={openDms} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            {selected ? (
                <View style={{
                    position: "absolute", left: 0, top: "25%",
                    width: 4, height: "50%", borderRadius: 2,
                    backgroundColor: colors?.WHITE ?? "#fff",
                }} />
            ) : null}
            <Image
                source={ChatIcon}
                style={{ width: 28, height: 28, tintColor: iconColor }}
            />
        </Pressable>
    );
}

function findGuildsBar(): any {
    const byName = findByName("GuildsBar");
    if (byName) return { default: byName };

    let mod = find((m) => {
        try { return m?.default?.type?.name === "GuildsBar"; } catch { return false; }
    });
    if (mod?.default) return mod;

    mod = find((m) => {
        try { return m?.default?.displayName === "GuildsBar"; } catch { return false; }
    });
    if (mod?.default) return mod;

    return null;
}

export function patchHideGuildsBar(cleanups: (() => void)[]): boolean {
    const mod = findGuildsBar();
    if (!mod?.default) {
        console.log(TAG, "WARN: GuildsBar not found");
        return false;
    }
    const orig = mod.default;

    registerIntercept(orig, DmsGuildIcon);

    mod.default = function DmsGuildsBar() {
        return React.createElement(DmsGuildIcon);
    };
    mod.default.displayName = "GuildsBar";
    cleanups.push(() => { mod.default = orig; });
    return true;
}
