import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import BetterTableRowGroup from "../components/BetterTableRowGroup";

const { FormSwitchRow, FormRow } = Forms;

export default function ImageSettingsPage() {
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
        title="Image Commands"
        icon={getAssetIDByName("ImageIcon")}
      >
        <FormSwitchRow
          label="/petpet"
          subLabel="Create pet-pet GIF of a user"
          leading={
            <FormRow.Icon source={getAssetIDByName("HandRequestSpeakIcon")} />
          }
          value={storage.enabledCommands.petpet}
          onValueChange={(v) => {
            storage.enabledCommands.petpet = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="KonoChan Commands"
        icon={getAssetIDByName("ImageIcon")}
      >
        <FormSwitchRow
          label="/konoself"
          subLabel="Get random image from KonoChan (private)"
          leading={<FormRow.Icon source={getAssetIDByName("EyeIcon")} />}
          value={storage.enabledCommands.konoself}
          onValueChange={(v) => {
            storage.enabledCommands.konoself = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
        <FormSwitchRow
          label="/konosend"
          subLabel="Send random image from KonoChan to channel"
          leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
          value={storage.enabledCommands.konosend}
          onValueChange={(v) => {
            storage.enabledCommands.konosend = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
