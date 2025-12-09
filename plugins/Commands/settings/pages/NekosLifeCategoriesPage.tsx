import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import BetterTableRowGroup from "../components/BetterTableRowGroup";

export default function NekosLifeCategoriesPage() {
  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: semanticColors.BACKGROUND_MODIFIER_ACCENT,
      borderBottomWidth: 2,
      borderBottomColor: semanticColors.BORDER_STRONG,
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
      borderBottomWidth: 1,
      borderBottomColor: semanticColors.BORDER_FAINT,
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
    infoText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      textAlign: "center",
      lineHeight: 20,
    },
  });

  // nekos.life categories
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

  // Sort categories alphabetically
  const sortedCategories = sfwCategories.sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <RN.ScrollView
      style={styles.container}
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 16,
        maxWidth: "100%",
      }}
    >
      <BetterTableRowGroup
        title="📊 Category Statistics"
        icon={getAssetIDByName("ChartIcon")}
        padding={true}
      >
        <RN.Text style={styles.infoText}>
          Total SFW Categories: {sfwCategories.length}
          {"\n\n"}
          Use these category names with the /nekoslife command.{"\n"}
          All categories are Safe For Work (SFW).
        </RN.Text>
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="📋 SFW Categories"
        icon={getAssetIDByName("ListViewIcon")}
      >
        {/* Table Header */}
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

        {/* Table Rows */}
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
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
