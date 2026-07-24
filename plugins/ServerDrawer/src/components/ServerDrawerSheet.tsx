import React from "react";
import { View, Dimensions, StyleSheet, BackHandler } from "react-native";
import { find, findByProps, findByStoreName } from "@vendetta/metro";
import { GuildNode } from "../utils/theme";
import GuildItem from "./GuildItem";
import FolderItem from "./FolderItem";

const SortedGuildStore = findByStoreName("SortedGuildStore");
const RootNav = findByProps("getRootNavigationRef");
const Haptic = findByProps("triggerHapticFeedback", "HapticFeedbackTypes");
const Routing = findByProps("transitionToGuild");

const ExternalCoordinationMod = find((m: any) => m?.QuestDockExternalCoordinationContext);
const ExternalContext = ExternalCoordinationMod?.QuestDockExternalCoordinationContext;
const QuestDockMode = find((m: any) => m?.QuestDockMode?.COLLAPSED != null)?.QuestDockMode;

const ICON = 48;
const GAP = 6;
const PAD = 12;

export default function ServerDrawerSheet({ gestureContext }: { gestureContext: any }) {
    const pick = React.useCallback((id: string) => {
        Haptic?.triggerHapticFeedback(Haptic.HapticFeedbackTypes.SOFT);
        if (Routing?.transitionToGuild) {
            Routing.transitionToGuild(id, null);
        } else {
            RootNav?.getRootNavigationRef()?.navigate("guilds", { guildId: id });
        }
    }, []);

    const nodes: GuildNode[] = React.useMemo(() => {
        const t = SortedGuildStore?.getGuildsTree();
        return (t?.root?.children || []).filter((n: GuildNode) => n.type !== "root");
    }, []);

    const ctx = (gestureContext ? React.useContext(gestureContext) : null) as any;
    const minH = ctx?.minExpandedContentHeight;

    const onLayout = React.useCallback((e: any) => {
        if (!minH) return;
        const h = e.nativeEvent.layout.height;
        if (minH.get() !== h) minH.set(h);
    }, [minH]);

    const extCtx = ExternalContext ? React.useContext(ExternalContext) as any : null;
    const setMode = extCtx?.setRestingQuestDockMode;

    const specs = ctx?.questDockWrapperSpecs;

    React.useEffect(() => {
        if (!setMode || !QuestDockMode || !specs) return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            const h = specs.get()?.height ?? 56;
            if (h > 80) {
                setMode(QuestDockMode.COLLAPSED);
                return true;
            }
            return false;
        });
        return () => sub.remove();
    }, [setMode, specs]);

    const { width: winW } = Dimensions.get("window");

    const cols = Math.max(3, Math.floor((winW - PAD * 2 + GAP) / (ICON + GAP)));
    const totalW = cols * ICON + (cols - 1) * GAP;
    const padX = Math.max(0, (winW - totalW) / 2);

    return (
        <View style={st.alignTop}>
            <View
                style={[st.grid, { paddingHorizontal: padX, gap: GAP }]}
                onLayout={onLayout}
            >
                {nodes.map((node) =>
                    node.type === "folder"
                        ? <FolderItem key={node.id} node={node} onPick={pick} />
                        : <GuildItem key={node.id} node={node} onPick={pick} />
                )}
            </View>
        </View>
    );
}

const st = StyleSheet.create({
    alignTop: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingTop: 4,
        paddingBottom: 16,
    },
});
