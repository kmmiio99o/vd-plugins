import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import BetterTableRowGroup from "../components/BetterTableRowGroup";

const { FormSwitchRow, FormRow } = Forms;

export default function FactsSettingsPage() {
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
        title="Fact Display Settings"
        icon={getAssetIDByName("SettingsIcon")}
      >
        <FormSwitchRow
          label="Send as Reply"
          subLabel="Send facts as a reply to the command message"
          leading={
            <FormRow.Icon source={getAssetIDByName("ArrowAngleLeftUpIcon")} />
          }
          value={storage.factSettings.sendAsReply}
          onValueChange={(v) => {
            storage.factSettings.sendAsReply = v;
          }}
        />
        <FormSwitchRow
          label="Include Source Citation"
          subLabel="Include the source of facts when available"
          leading={<FormRow.Icon source={getAssetIDByName("LinkIcon")} />}
          value={storage.factSettings.includeCitation}
          onValueChange={(v) => {
            storage.factSettings.includeCitation = v;
          }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="Available Fact Commands"
        icon={getAssetIDByName("BookmarkIcon")}
      >
        <FormSwitchRow
          label="/catfact"
          subLabel="Get random cat facts"
          leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
          value={storage.enabledCommands.catfact}
          onValueChange={(v) => {
            storage.enabledCommands.catfact = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
        <FormSwitchRow
          label="/dogfact"
          subLabel="Get random dog facts"
          leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
          value={storage.enabledCommands.dogfact}
          onValueChange={(v) => {
            storage.enabledCommands.dogfact = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
        <FormSwitchRow
          label="/useless"
          subLabel="Get random useless facts"
          leading={<FormRow.Icon source={getAssetIDByName("BookCheckIcon")} />}
          value={storage.enabledCommands.useless}
          onValueChange={(v) => {
            storage.enabledCommands.useless = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
