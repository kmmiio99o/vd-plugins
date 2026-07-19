import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React } from "@vendetta/metro/common";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableSwitchRow,
} from "../components/TableComponents";

export default function OtherSettingsPage() {
    useProxy(storage);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={12}>
                <TableRowGroup title="Message Commands">
                    <TableSwitchRow
                        label="/firstmessage"
                        subLabel="Get the first message in a channel"
                        value={storage.enabledCommands.firstmessage}
                        onValueChange={(v) => {
                            storage.enabledCommands.firstmessage = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="System Commands">
                    <TableSwitchRow
                        label="/sysinfo"
                        subLabel="Display system information"
                        value={storage.enabledCommands.sysinfo}
                        onValueChange={(v) => {
                            storage.enabledCommands.sysinfo = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="Friend Invites">
                    <TableSwitchRow
                        label="/invite create"
                        subLabel="Generate a friend invite link"
                        value={storage.enabledCommands.friendInviteCreate}
                        onValueChange={(v) => {
                            storage.enabledCommands.friendInviteCreate = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                    <TableSwitchRow
                        label="/view invites"
                        subLabel="View your current friend invites"
                        value={storage.enabledCommands.friendInviteView}
                        onValueChange={(v) => {
                            storage.enabledCommands.friendInviteView = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                    <TableSwitchRow
                        label="/revoke invites"
                        subLabel="Revoke all your friend invites"
                        value={storage.enabledCommands.friendInviteRevoke}
                        onValueChange={(v) => {
                            storage.enabledCommands.friendInviteRevoke = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
