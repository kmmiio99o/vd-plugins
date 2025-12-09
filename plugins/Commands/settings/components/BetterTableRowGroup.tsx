import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";

export default function BetterTableRowGroup({
  title,
  icon,
  children,
  padding = false,
}: React.PropsWithChildren<{
  title?: string;
  icon?: number;
  padding?: boolean;
}>) {
  const styles = stylesheet.createThemedStyleSheet({
    main: {
      backgroundColor: semanticColors.CARD_PRIMARY_BG,
      borderColor: semanticColors.BORDER_FAINT,
      borderWidth: 1,
      borderRadius: 16,
      overflow: "hidden",
      flex: 1,
      maxWidth: "100%",
    },
    titleContainer: {
      marginBottom: 8,
      marginHorizontal: 16,
      marginTop: 8,
      gap: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      width: 16,
      height: 16,
      marginTop: 1.5,
      tintColor: semanticColors.TEXT_MUTED,
    },
    titleText: {
      fontSize: 14,
      fontWeight: "600",
      color: semanticColors.TEXT_MUTED,
    },
    wrapper: {
      marginHorizontal: 16,
      marginTop: 16,
      maxWidth: "100%",
    },
  });

  return (
    <RN.View style={styles.wrapper}>
      {title && (
        <RN.View style={styles.titleContainer}>
          {icon && (
            <RN.Image style={styles.icon} source={icon} resizeMode="cover" />
          )}
          <RN.Text style={styles.titleText}>{title.toUpperCase()}</RN.Text>
        </RN.View>
      )}
      <RN.View style={styles.main}>
        {padding ? (
          <RN.View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            {children}
          </RN.View>
        ) : (
          children
        )}
      </RN.View>
    </RN.View>
  );
}
