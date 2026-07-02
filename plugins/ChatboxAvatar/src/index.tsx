import { after } from "@vendetta/patcher";
import { find, findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { ReactNative } from "@vendetta/metro/common";
import { plugin } from "@vendetta";
import React from "react";

import Settings from "./settings";

const Flux = findByProps("useStateFromStores");
const { Pressable, View } = ReactNative;

const ChatInputActions = find(m => m?.type?.displayName === "ChatInputActions") || findByName("ChatInputActions");
const ChatInputSendButton = find(m => m?.type?.displayName === "ChatInputSendButton") || findByName("ChatInputSendButton");

const Avatar = findByProps("default", "AvatarSizes", "getStatusSize")?.default || findByProps("getStatusSize")?.default || findByName("Avatar");

const UserStore = findByStoreName("UserStore");
const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const ChannelStore = findByStoreName("ChannelStore");
const SelfPresenceStore = findByStoreName("SelfPresenceStore");

const showUserProfileActionSheet = findByName("showUserProfileActionSheet");
const showYouAccountActionSheetByProp = findByProps("showYouAccountActionSheet");

function openAccountSheet(userId: string, channelId: string) {
    const fn = showYouAccountActionSheetByProp?.showYouAccountActionSheet;
    if (typeof fn === "function") {
        try {
            fn(true, true);
            return;
        } catch {
            // fall through to showUserProfileActionSheet
        }
    }
    showUserProfileActionSheet?.({ userId, channelId });
}

const getSetting = (key: string, fallback: any) => plugin.storage[key] ?? fallback;

function AvatarAction() {
    const self = Flux?.useStateFromStores?.([UserStore], () => UserStore?.getCurrentUser?.());
    const status = Flux?.useStateFromStores?.([SelfPresenceStore], () => SelfPresenceStore?.getStatus?.());
    const channelId = Flux?.useStateFromStores?.([SelectedChannelStore], () => SelectedChannelStore?.getCurrentlySelectedChannelId?.());
    const channel = Flux?.useStateFromStores?.([ChannelStore], () => ChannelStore?.getChannel?.(channelId), [channelId]);

    if (!self || !Avatar) return null;

    const pressAction = getSetting("pressAction", "profile");
    const longPressAction = getSetting("longPressAction", "server");
    const showStatusCutout = getSetting("showStatusCutout", true);
    const profileType = getSetting("profileType", "server");
    const showInDms = getSetting("showInDms", true);

    const isDm = channel?.type === 1 || channel?.type === 3;
    if (isDm && !showInDms) return null;

    const guildId = profileType === "server" ? channel?.guild_id : undefined;
    const profileChannelId = profileType === "server" ? (channel?.id ?? channelId) : undefined;

    const handlePress = () => {
        if (pressAction === "server") {
            openAccountSheet(self.id, channel?.id ?? channelId);
        } else {
            showUserProfileActionSheet?.({ userId: self.id, channelId: profileChannelId });
        }
    };

    const handleLongPress = () => {
        if (longPressAction === "server") {
            openAccountSheet(self.id, channel?.id ?? channelId);
        } else {
            showUserProfileActionSheet?.({ userId: self.id, channelId: profileChannelId });
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            onLongPress={handleLongPress}
            style={{ justifyContent: "center", alignItems: "center", marginHorizontal: 4 }}
        >
            <Avatar
                user={self}
                guildId={guildId}
                status={showStatusCutout ? status : undefined}
                avatarDecoration={self?.avatarDecoration}
                animate={true}
            />
        </Pressable>
    );
}

const patches: (() => void)[] = [];

export default {
    onLoad() {
        const defaults: Record<string, any> = {
            pressAction: "profile",
            longPressAction: "server",
            showStatusCutout: true,
            profileType: "server",
            showInDms: true,
            position: "after_actions",
        };
        for (const key in defaults) {
            plugin.storage[key] = plugin.storage[key] ?? defaults[key];
        }

        if (ChatInputActions) {
            const target = ChatInputActions.type || ChatInputActions;
            patches.push(
                after("render", target, (args, ret) => {
                    const position = getSetting("position", "after_actions");
                    if (position === "near_send") return ret;
                    return (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {position === "before_actions" && <AvatarAction />}
                            {ret}
                            {position === "after_actions" && <AvatarAction />}
                        </View>
                    );
                })
            );
        }

        if (ChatInputSendButton) {
            const target = ChatInputSendButton.type || ChatInputSendButton;
            patches.push(
                after("render", target, (args, ret) => {
                    const position = getSetting("position", "after_actions");
                    if (position !== "near_send") return ret;
                    return (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <AvatarAction />
                            {ret}
                        </View>
                    );
                })
            );
        }
    },
    onUnload() {
        for (const unpatch of patches) {
            unpatch?.();
        }
        patches.length = 0;
    },
    settings: Settings,
};
