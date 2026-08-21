import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";
import { View, Pressable, StyleSheet, FlatList, ScrollView } from "react-native";
import { usePalette, px, RADIUS, rawColors } from "../lib/tokens";
import DText from "../lib/DText";
import { fetchCategories, fetchServers, searchServers, DiscoveryCategory, DiscoveryServer } from "../lib/rest";
import ServerCard from "./ServerCard";

const SearchField = findByProps("SearchField").SearchField;

function SearchBar({ onCommit }: { onCommit: (q: string) => void }) {
    const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const cancelPending = () => {
        if (timer.current !== undefined) clearTimeout(timer.current);
        timer.current = undefined;
    };

    React.useEffect(() => () => cancelPending(), []);

    const emit = (v: string) => {
        cancelPending();
        onCommit(v.trim());
    };

    const onChange = (v: string) => {
        if (!v.trim()) {
            emit("");
            return;
        }
        cancelPending();
        timer.current = setTimeout(() => emit(v), 350);
    };

    return (
        <SearchField
            size="md"
            onChange={onChange}
            onClear={() => emit("")}
        />
    );
}

export default function DiscoveryPage() {
    const palette = usePalette();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [categories, setCategories] = React.useState<DiscoveryCategory[]>([]);
    const [servers, setServers] = React.useState<DiscoveryServer[]>([]);
    const [query, setQuery] = React.useState("");
    const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);

    const load = React.useCallback(async (categoryId?: string | null) => {
        setLoading(true);
        setError(null);
        try {
            fetchCategories().then(setCategories).catch(() => {});
            const list = await fetchServers(categoryId);
            setServers(list);
            if (!list.length) console.log("[Discovery] list empty; body shape logged above if unexpected");
        } catch (e: any) {
            console.log("[Discovery] load failed:", e?.message ?? e, e?.stack ?? "");
            setError(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }, []);

    const trimmed = query.trim();
    React.useEffect(() => {
        if (trimmed) {
            searchServers(trimmed)
                .then(setServers)
                .catch((e: any) => console.log("[Discovery] search failed:", e?.message ?? e));
            return;
        }
        load(selectedCategoryId);
    }, [trimmed, selectedCategoryId]);

    const clearQuery = () => {
        setQuery("");
        setSelectedCategoryId(null);
    };

    const selectCategory = (id: string) => {
        setQuery("");
        setSelectedCategoryId((cur) => (cur === id ? null : id));
    };

    return (
        <View style={st.page}>
            <View style={st.searchWrap}>
                <SearchBar onCommit={setQuery} />
            </View>

            {categories.length > 0 && !query && (
                <View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipsRow}>
                        {categories.map((c) => {
                            const active = selectedCategoryId === c.id;
                            return (
                                <Pressable key={c.id} onPress={() => selectCategory(c.id)}>
                                    <View style={[st.chip, { backgroundColor: active ? palette.brand : palette.modSubtle }]}>
                                        <DText
                                            variant="text-xs/medium"
                                            style={active ? { color: rawColors.WHITE_500 } : undefined}
                                        >
                                            {c.name}
                                        </DText>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {loading ? (
                <View style={st.center}>
                    <DText variant="text-md/medium" color="text-muted">{"Loading…"}</DText>
                </View>
            ) : error ? (
                <View style={st.center}>
                    <DText variant="text-sm/semibold" color="text-feedback-critical">{"Failed to load discovery"}</DText>
                    <DText variant="text-xs/normal" color="text-muted" style={st.errorDetail}>{error}</DText>
                    <Pressable onPress={() => load(selectedCategoryId)}>
                        <DText variant="text-sm/semibold" color="interactive-text-active" style={st.retry}>{"Retry"}</DText>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={servers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ServerCard server={item} />}
                    contentContainerStyle={st.listContent}
                    ListEmptyComponent={
                        <View style={st.center}>
                            <DText variant="text-md/medium" color="text-muted">{"No servers found"}</DText>
                        </View>
                    }
                    onRefresh={clearQuery}
                    refreshing={false}
                />
            )}
        </View>
    );
}

const st = StyleSheet.create({
    page: {
        flex: 1,
    },
    searchWrap: {
        paddingHorizontal: px(16),
        paddingVertical: px(8),
    },
    chipsRow: {
        paddingHorizontal: px(16),
        paddingBottom: px(8),
    },
    chip: {
        borderRadius: RADIUS.round,
        paddingHorizontal: px(12),
        paddingVertical: 7,
        marginRight: px(8),
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    errorDetail: {
        marginTop: 6,
        textAlign: "center",
        marginHorizontal: 32,
    },
    retry: {
        marginTop: 12,
    },
    listContent: {
        paddingBottom: px(24),
    },
});
