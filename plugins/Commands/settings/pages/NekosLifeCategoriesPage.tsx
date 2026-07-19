import { React, ReactNative as RN } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableRow,
} from "../components/TableComponents";

export default function NekosLifeCategoriesPage() {
    const styles = RN.StyleSheet.create({
        tableHeader: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
        },
        headerText: {
            fontSize: 14,
            fontWeight: "700",
            color: semanticColors.HEADER_PRIMARY,
            textTransform: "uppercase",
        },
        nameHeader: {
            flex: 2,
        },
        codeHeader: {
            flex: 2,
            textAlign: "center",
        },
        badgeHeader: {
            flex: 1,
            textAlign: "center",
        },
        categoryItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
        },
        categoryName: {
            fontSize: 16,
            fontWeight: "500",
            color: semanticColors.HEADER_PRIMARY,
            flex: 2,
        },
        categoryValue: {
            fontSize: 14,
            color: semanticColors.TEXT_MUTED,
            fontFamily: "monospace",
            flex: 2,
            textAlign: "center",
        },
        sfwBadgeContainer: {
            flex: 1,
            alignItems: "center",
        },
        sfwBadge: {
            backgroundColor: semanticColors.STATUS_POSITIVE,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        badgeText: {
            fontSize: 12,
            fontWeight: "600",
            color: semanticColors.TEXT_NORMAL,
        },
    });

    const sfwCategories = [
        { name: "Avatar", value: "avatar" },
        { name: "Classic", value: "classic" },
        { name: "Cuddle", value: "cuddle" },
        { name: "Fox Girl", value: "fox_girl" },
        { name: "Gecg", value: "gecg" },
        { name: "Holo", value: "holo" },
        { name: "Kemonomimi", value: "kemonomimi" },
        { name: "Kiss", value: "kiss" },
        { name: "Neko", value: "neko" },
        { name: "Neko GIF", value: "ngif" },
        { name: "Smug", value: "smug" },
        { name: "Spank", value: "spank" },
        { name: "Tickle", value: "tickle" },
        { name: "Waifu", value: "waifu" },
        { name: "Wallpaper", value: "wallpaper" },
        { name: "Woof", value: "woof" },
    ];

    const sortedCategories = sfwCategories.sort((a, b) =>
        a.name.localeCompare(b.name),
    );

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={12}>
                <TableRowGroup title="Category Statistics">
                    <TableRow
                        label={`${sfwCategories.length} SFW Categories`}
                        subLabel="Use these category names with the /nekoslife command. All categories are Safe For Work (SFW)."
                    />
                </TableRowGroup>

                <TableRowGroup title="SFW Categories">
                    <RN.View style={styles.tableHeader}>
                        <RN.Text style={[styles.headerText, styles.nameHeader]}>
                            Category Name
                        </RN.Text>
                        <RN.Text style={[styles.headerText, styles.codeHeader]}>
                            Command Code
                        </RN.Text>
                        <RN.Text style={[styles.headerText, styles.badgeHeader]}>
                            Type
                        </RN.Text>
                    </RN.View>

                    {sortedCategories.map((category, index) => (
                        <RN.View key={index} style={styles.categoryItem}>
                            <RN.Text style={styles.categoryName}>{category.name}</RN.Text>
                            <RN.Text style={styles.categoryValue}>{category.value}</RN.Text>
                            <RN.View style={styles.sfwBadgeContainer}>
                                <RN.View style={styles.sfwBadge}>
                                    <RN.Text style={styles.badgeText}>SFW</RN.Text>
                                </RN.View>
                            </RN.View>
                        </RN.View>
                    ))}
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
