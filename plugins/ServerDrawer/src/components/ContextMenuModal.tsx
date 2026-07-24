import React from "react";
import { View, Text, Pressable, Image, Modal, StyleSheet, Dimensions, Animated } from "react-native";
import { semanticColors } from "@vendetta/ui";
import { findByProps, findByStoreName } from "@vendetta/metro";

const TextStyleSheet = findByProps("TextStyleSheet")?.TextStyleSheet;
const ThemeStore = findByStoreName("ThemeStore");
const colorModule = findByProps("colors", "unsafe_rawColors");
const colorResolver = colorModule?.internal ?? colorModule?.meta;
const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");

function resolve(color: any): string {
    const theme = ThemeStore?.theme;
    return (color && colorResolver?.resolveSemanticColor(theme, color)) || "#000000";
}

const EDGE = 12;
const PAD = 12;
const ITEM_H = 42;
const MIN_W = 220;
const DIVIDER_H = 4;
const RADIUS = 16;
const ICON_SIZE = 20;

const SPRING_CONFIG = { tension: 200, friction: 20 };

export interface ContextMenuItem {
    label: string;
    action?: () => void;
    danger?: boolean;
    iconSource?: number;
    IconComponent?: React.ComponentType<any>;
}

export function ContextMenuModal({
    visible,
    items,
    title,
    anchorX,
    anchorY,
    onClose,
}: {
    visible: boolean;
    items: ContextMenuItem[];
    title: string;
    anchorX: number;
    anchorY: number;
    onClose: () => void;
}) {
    const { width: winW, height: winH } = Dimensions.get("window");

    const titleH = title ? PAD + 20 + DIVIDER_H : 0;
    const menuH = titleH + items.length * ITEM_H;

    let left = anchorX;
    let top = anchorY + 48 + 10;
    if (left + MIN_W > winW - EDGE) left = winW - MIN_W - EDGE;
    if (left < EDGE) left = EDGE;
    if (top + menuH > winH - EDGE) top = anchorY - menuH - 10;
    if (top < EDGE) top = EDGE;

    const bgContainer = resolve(semanticColors?.BACKGROUND_SURFACE_HIGHEST);
    const borderColor = resolve(semanticColors?.BORDER_SUBTLE);
    const textColor = resolve(semanticColors?.TEXT_STRONG);
    const pressedColor = resolve(semanticColors?.BACKGROUND_MOD_SUBTLE);

    const backdropOpacity = React.useRef(new Animated.Value(0)).current;
    const menuScale = React.useRef(new Animated.Value(0.5)).current;
    const menuOpacity = React.useRef(new Animated.Value(0)).current;

    const [show, setShow] = React.useState(false);
    const closing = React.useRef(false);

    React.useEffect(() => {
        if (visible && !closing.current) {
            setShow(true);
            backdropOpacity.setValue(0);
            menuScale.setValue(0.5);
            menuOpacity.setValue(0);
            Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
                Animated.spring(menuScale, { toValue: 1, useNativeDriver: true, ...SPRING_CONFIG }),
                Animated.spring(menuOpacity, { toValue: 1, useNativeDriver: true, ...SPRING_CONFIG }),
            ]).start();
        }
    }, [visible]);

    const handleClose = React.useCallback(() => {
        if (closing.current) return;
        closing.current = true;
        Animated.parallel([
            Animated.timing(backdropOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
            Animated.timing(menuScale, { toValue: 0.8, duration: 120, useNativeDriver: true }),
            Animated.timing(menuOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        ]).start(() => {
            closing.current = false;
            setShow(false);
            onClose();
        });
    }, [onClose]);

    if (!show) return null;

    return (
        <Modal transparent visible={show} onRequestClose={handleClose} statusBarTranslucent>
            <Pressable style={localStyles.root} onPress={handleClose}>
                <Animated.View style={[localStyles.backdrop, { opacity: backdropOpacity }]} />
                <Animated.View
                    style={[
                        localStyles.container,
                        {
                            left,
                            top,
                            backgroundColor: bgContainer,
                            borderColor,
                            minWidth: MIN_W,
                            opacity: menuOpacity,
                            transform: [{ scale: menuScale }],
                        },
                    ]}
                >
                    {title ? (
                        <View>
                            <Text
                                style={[
                                    TextStyleSheet?.["text-md/bold"],
                                    { color: textColor, paddingHorizontal: PAD, paddingTop: 13, paddingBottom: 12 },
                                ]}
                            >
                                {title}
                            </Text>
                            <View style={{ borderBottomWidth: DIVIDER_H, borderBottomColor: borderColor }} />
                        </View>
                    ) : null}
                    {items.map((item, i) => {
                        const isFirst = i === 0 && !title;
                        const isLast = i === items.length - 1;
                        const hasIcon = !!(item.iconSource || item.IconComponent);

                        return (
                            <Pressable
                                key={i}
                                style={({ pressed }) => ({
                                    paddingHorizontal: PAD,
                                    paddingVertical: 10,
                                    minHeight: ITEM_H,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 8,
                                    backgroundColor: pressed ? pressedColor : "transparent",
                                    borderTopLeftRadius: isFirst ? RADIUS : 0,
                                    borderTopRightRadius: isFirst ? RADIUS : 0,
                                    borderBottomLeftRadius: isLast ? RADIUS : 0,
                                    borderBottomRightRadius: isLast ? RADIUS : 0,
                                    borderBottomWidth: !isFirst && !isLast ? 1 : 0,
                                    borderBottomColor: borderColor,
                                })}
                                onPress={() => {
                                    Haptic?.triggerHapticFeedback?.(Haptic.HapticFeedbackTypes.IMPACT_LIGHT);
                                    handleClose();
                                    item.action?.();
                                }}
                            >
                                <Text
                                    style={[
                                        TextStyleSheet?.["text-md/medium"],
                                        {
                                            flexShrink: 1,
                                            color: textColor,
                                        },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                {hasIcon ? (
                                    <View style={{ width: ICON_SIZE, height: ICON_SIZE, alignItems: "center", justifyContent: "center" }}>
                                        {item.IconComponent ? (
                                            <item.IconComponent size="sm" color={textColor} />
                                        ) : item.iconSource ? (
                                            <Image source={item.iconSource} style={{ width: ICON_SIZE, height: ICON_SIZE, tintColor: textColor }} />
                                        ) : null}
                                    </View>
                                ) : null}
                            </Pressable>
                        );
                    })}
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

const localStyles = StyleSheet.create({
    root: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0,0,0,0.55)",
    },
    container: {
        position: "absolute",
        borderWidth: 1,
        borderRadius: RADIUS,
        overflow: "hidden",
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.24,
        shadowRadius: 24,
    },
});
