import { after } from "@vendetta/patcher";
import { findByName, findByProps, findByStoreName, findByDisplayName } from "@vendetta/metro";
import { ReactNative } from "@vendetta/metro/common";
import { plugin } from "@vendetta";
import React, { useEffect, useRef } from "react";

import ChatboxAvatarSettings from "./settings";

const Flux = findByProps("useStateFromStores");
const ChatInputActions = findByDisplayName("ChatInputActions");
const ChatInputSendButton = findByDisplayName("ChatInputSendButton");
let hasText = false;
let sendBtnRef: { setHasText?: (hasText: boolean) => void } | undefined;
const { Pressable, View, Animated } = ReactNative;

const avatarCollapse = new Animated.Value(0);

const Avatar = findByProps("default", "AvatarSizes", "getStatusSize")?.default;

const UserStore = findByStoreName("UserStore");
const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const ChannelStore = findByStoreName("ChannelStore");
const SelfPresenceStore = findByStoreName("SelfPresenceStore");
const showUserProfileActionSheet = findByName("showUserProfileActionSheet");
const showYouAccountActionSheetByProp = findByProps("showYouAccountActionSheet");

function AvatarAction() {
    const [textState, setTextState] = React.useState(false);
    const self = Flux?.useStateFromStores?.([UserStore], () => UserStore?.getCurrentUser?.());
    const status = Flux?.useStateFromStores?.([SelfPresenceStore], () => SelfPresenceStore?.getStatus?.());
    const settings = plugin.storage;
    const channelId = Flux?.useStateFromStores?.([SelectedChannelStore], () => SelectedChannelStore?.getCurrentlySelectedChannelId?.());
    const channel = Flux?.useStateFromStores?.([ChannelStore], () => ChannelStore?.getChannel?.(channelId), [channelId]);

    const animated = useRef(avatarCollapse).current;

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTextState(hasText);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const shouldCollapse = settings.collapseWhileTyping && textState;
        Animated.parallel([
            Animated.timing(animated, {
                toValue: shouldCollapse ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    }, [textState, settings.collapseWhileTyping, animated]);

    if (!self) return null;

    const openAccountSheet = () => {
        const fn = showYouAccountActionSheetByProp?.showYouAccountActionSheet;
        if (typeof fn === "function") {
            try {
                fn(true, true);
                return;
            } catch {}
        }
        showUserProfileActionSheet?.({ userId: self.id, channelId: channel?.id ?? channelId });
    };

    const handlePress = () => {
        switch (settings.pressAction) {
            case "profile":
                showUserProfileActionSheet?.({ userId: self.id, channelId: channel?.id ?? channelId });
                break;
            case "server":
                openAccountSheet();
                break;
            default:
                break;
        }
    };

    const handleLongPress = () => {
        switch (settings.longPressAction) {
            case "profile":
                showUserProfileActionSheet?.({ userId: self.id, channelId: channel?.id ?? channelId });
                break;
            case "server":
                openAccountSheet();
                break;
            default:
                break;
        }
    };

    return (
        <Animated.View
            style={{
                height: 40,
                width: animated.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }),
                marginHorizontal: animated.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }),
                flexShrink: 0,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                overflow: settings.collapseWhileTyping ? "hidden" : "visible",
            }}
        >
            <Pressable
                onPress={handlePress}
                onLongPress={handleLongPress}
            >
                {Avatar && (
                    <Avatar
                        user={self}
                        guildId={channel?.guild_id}
                        status={settings.showStatusCutout ? status : undefined}
                        avatarDecoration={self?.avatarDecoration}
                        animate={!settings.collapseWhileTyping || !textState}
                    />
                )}
            </Pressable>
        </Animated.View>
    );
}

const unpatches: (() => void)[] = [];

export default {
    onLoad() {
        if (!ChatInputActions?.prototype?.render || !ChatInputSendButton?.prototype?.render) return;
        unpatches.push(
            after("render", ChatInputActions.prototype, (args, ret) => {
                return React.createElement(
                    View,
                    { style: { flexDirection: "row", alignItems: "center" } },
                    ret,
                    React.createElement(AvatarAction)
                );
            })
        );
        unpatches.push(
            after("render", ChatInputSendButton.prototype, (args, ret) => {
                setImmediate(() => {
                    setImmediate(() => {
                        if (args?.[1]?.current) {
                            sendBtnRef = args[1].current;
                            const origSetHasText = sendBtnRef?.setHasText;
                            unpatches.push(() => { if (sendBtnRef && origSetHasText) sendBtnRef.setHasText = origSetHasText; });
                            if (sendBtnRef) {
                                sendBtnRef.setHasText = (hasText_: boolean) => {
                                    hasText = hasText_;
                                    if (origSetHasText) return origSetHasText.call(sendBtnRef, hasText_);
                                };
                            }
                        }
                    });
                });
            })
        );
    },
    onUnload() {
        for (const unpatch of unpatches) unpatch?.();
        unpatches.length = 0;
    },
    settings: ChatboxAvatarSettings,
};
