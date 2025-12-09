import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import BetterTableRowGroup from "../components/BetterTableRowGroup";

const { FormSwitchRow, FormRow } = Forms;

export default function ListSettingsPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <RN.ScrollView
      style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 16,
        maxWidth: "100%",
      }}
    >
      <BetterTableRowGroup
        title="List Display Settings"
        icon={getAssetIDByName("SettingsIcon")}
      >
        <FormSwitchRow
          label="Always Send Detailed Plugin List"
          subLabel="Always use detailed mode when listing plugins"
          leading={
            <FormRow.Icon source={getAssetIDByName("PuzzlePieceIcon")} />
          }
          value={storage.listSettings.pluginListAlwaysDetailed}
          onValueChange={(v) => {
            storage.listSettings.pluginListAlwaysDetailed = v;
          }}
        />
        <FormSwitchRow
          label="Always Send Detailed Theme List"
          subLabel="Always use detailed mode when listing themes"
          leading={
            <FormRow.Icon source={getAssetIDByName("PaintPaletteIcon")} />
          }
          value={storage.listSettings.themeListAlwaysDetailed}
          onValueChange={(v) => {
            storage.listSettings.themeListAlwaysDetailed = v;
          }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="Available List Commands"
        icon={getAssetIDByName("ListViewIcon")}
      >
        <FormSwitchRow
          label="/plugin-list"
          subLabel="List all installed plugins"
          leading={
            <FormRow.Icon source={getAssetIDByName("PuzzlePieceIcon")} />
          }
          value={storage.enabledCommands.pluginList}
          onValueChange={(v) => {
            storage.enabledCommands.pluginList = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
        <FormSwitchRow
          label="/theme-list"
          subLabel="List all installed themes"
          leading={
            <FormRow.Icon source={getAssetIDByName("PaintPaletteIcon")} />
          }
          value={storage.enabledCommands.themeList}
          onValueChange={(v) => {
            storage.enabledCommands.themeList = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
