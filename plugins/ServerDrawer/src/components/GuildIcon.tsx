import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { findByStoreName, findByProps } from "@vendetta/metro";

const GuildStore = findByStoreName("GuildStore");
const colors = findByProps("colors", "unsafe_rawColors")?.colors;

export default function GuildIcon({ id, size = 48 }: { id: string; size?: number }) {
    const g = GuildStore?.getGuild(id);
    if (!g) return null;
    const rad = size >= 40 ? 16 : 8;
    if (g.icon) {
        return (
            <Image
                source={{ uri: `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=${size * 2}` }}
                style={{ width: size, height: size, borderRadius: rad }}
            />
        );
    }
    return (
        <View style={[st.fallback, { width: size, height: size, borderRadius: rad, backgroundColor: colors?.BG_ACCENT ?? "#5865f2" }]}>
            <Text style={[st.letter, { fontSize: Math.max(10, size * 0.4) }]}>
                {g.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
            </Text>
        </View>
    );
}

const st = StyleSheet.create({
    fallback: { alignItems: "center", justifyContent: "center" },
    letter: { color: "#fff", fontWeight: "700" },
});
