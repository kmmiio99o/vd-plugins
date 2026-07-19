import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React } from "@vendetta/metro/common";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableSwitchRow,
} from "../components/TableComponents";

export default function ListSettingsPage() {
    useProxy(storage);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={12}>
                <TableRowGroup title="List Display Settings">
                    <TableSwitchRow
                        label="Always Send Detailed Plugin List"
                        subLabel="Always use detailed mode when listing plugins"
                        value={storage.listSettings.pluginListAlwaysDetailed}
                        onValueChange={(v) => {
                            storage.listSettings.pluginListAlwaysDetailed = v;
                        }}
                    />
                    <TableSwitchRow
                        label="Always Send Detailed Theme List"
                        subLabel="Always use detailed mode when listing themes"
                        value={storage.listSettings.themeListAlwaysDetailed}
                        onValueChange={(v) => {
                            storage.listSettings.themeListAlwaysDetailed = v;
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="Available List Commands">
                    <TableSwitchRow
                        label="/plugin-list"
                        subLabel="List all installed plugins"
                        value={storage.enabledCommands.pluginList}
                        onValueChange={(v) => {
                            storage.enabledCommands.pluginList = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                    <TableSwitchRow
                        label="/theme-list"
                        subLabel="List all installed themes"
                        value={storage.enabledCommands.themeList}
                        onValueChange={(v) => {
                            storage.enabledCommands.themeList = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
