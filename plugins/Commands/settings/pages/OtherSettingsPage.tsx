import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import BetterTableRowGroup from "../components/BetterTableRowGroup";

const { FormSwitchRow, FormRow } = Forms;

export default function OtherSettingsPage() {
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
        title="Message Commands"
        icon={getAssetIDByName("ChatIcon")}
      >
        <FormSwitchRow
          label="/firstmessage"
          subLabel="Get the first message in a channel"
          leading={<FormRow.Icon source={getAssetIDByName("ChatIcon")} />}
          value={storage.enabledCommands.firstmessage}
          onValueChange={(v) => {
            storage.enabledCommands.firstmessage = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="System Commands"
        icon={getAssetIDByName("SettingsIcon")}
      >
        <FormSwitchRow
          label="/sysinfo"
          subLabel="Display system information"
          leading={<FormRow.Icon source={getAssetIDByName("SettingsIcon")} />}
          value={storage.enabledCommands.sysinfo}
          onValueChange={(v) => {
            storage.enabledCommands.sysinfo = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="Friend Invites"
        icon={getAssetIDByName("UserAddIcon")}
      >
        <FormSwitchRow
          label="/invite create"
          subLabel="Generate a friend invite link"
          value={storage.enabledCommands.friendInviteCreate}
          onValueChange={(v) => {
            storage.enabledCommands.friendInviteCreate = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
        <FormSwitchRow
          label="/view invites"
          subLabel="View your current friend invites"
          value={storage.enabledCommands.friendInviteView}
          onValueChange={(v) => {
            storage.enabledCommands.friendInviteView = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
        <FormSwitchRow
          label="/revoke invites"
          subLabel="Revoke all your friend invites"
          value={storage.enabledCommands.friendInviteRevoke}
          onValueChange={(v) => {
            storage.enabledCommands.friendInviteRevoke = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
