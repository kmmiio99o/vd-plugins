import { after } from "@vendetta/patcher";
import { find, findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { ReactNative } from "@vendetta/metro/common";
import React from "react";

const Flux = findByProps("useStateFromStores");
const { Pressable, View } = ReactNative;

const ChatInputActions = find(m => m?.type?.displayName === "ChatInputActions") || findByName("ChatInputActions");

const Avatar = findByProps("default", "AvatarSizes", "getStatusSize")?.default || findByProps("getStatusSize")?.default || findByName("Avatar");

const UserStore = findByStoreName("UserStore");
const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const ChannelStore = findByStoreName("ChannelStore");
const SelfPresenceStore = findByStoreName("SelfPresenceStore");

const showUserProfileActionSheet = findByName("showUserProfileActionSheet");

function AvatarAction() {
    const self = Flux?.useStateFromStores?.([UserStore], () => UserStore?.getCurrentUser?.());
    const status = Flux?.useStateFromStores?.([SelfPresenceStore], () => SelfPresenceStore?.getStatus?.());
    const channelId = Flux?.useStateFromStores?.([SelectedChannelStore], () => SelectedChannelStore?.getCurrentlySelectedChannelId?.());
    const channel = Flux?.useStateFromStores?.([ChannelStore], () => ChannelStore?.getChannel?.(channelId), [channelId]);

    if (!self || !Avatar) return null;

    return (
        <Pressable
            onPress={() => showUserProfileActionSheet?.({ userId: self.id, channelId: channel?.id ?? channelId })}
            style={{ justifyContent: "center", alignItems: "center", marginHorizontal: 4 }}
        >
            <Avatar
                user={self}
                guildId={channel?.guild_id}
                status={status}
                avatarDecoration={self?.avatarDecoration}
                animate={true}
            />
        </Pressable>
    );
}

const patches: (() => void)[] = [];

export default {
    onLoad() {
        if (!ChatInputActions) return;

        if (ChatInputActions.type) {
            patches.push(
                after("render", ChatInputActions.type, (args, ret) => {
                    return (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {ret}
                            <AvatarAction />
                        </View>
                    );
                })
            );
        } else {
            patches.push(
                after("render", ChatInputActions, (args, ret) => {
                    return (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {ret}
                            <AvatarAction />
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
};
