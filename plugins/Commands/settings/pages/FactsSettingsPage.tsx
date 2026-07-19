import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React } from "@vendetta/metro/common";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableSwitchRow,
} from "../components/TableComponents";

export default function FactsSettingsPage() {
    useProxy(storage);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={12}>
                <TableRowGroup title="Fact Display Settings">
                    <TableSwitchRow
                        label="Send as Reply"
                        subLabel="Send facts as a reply to the command message"
                        value={storage.factSettings.sendAsReply}
                        onValueChange={(v) => {
                            storage.factSettings.sendAsReply = v;
                        }}
                    />
                    <TableSwitchRow
                        label="Include Source Citation"
                        subLabel="Include the source of facts when available"
                        value={storage.factSettings.includeCitation}
                        onValueChange={(v) => {
                            storage.factSettings.includeCitation = v;
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="Available Fact Commands">
                    <TableSwitchRow
                        label="/catfact"
                        subLabel="Get random cat facts"
                        value={storage.enabledCommands.catfact}
                        onValueChange={(v) => {
                            storage.enabledCommands.catfact = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                    <TableSwitchRow
                        label="/dogfact"
                        subLabel="Get random dog facts"
                        value={storage.enabledCommands.dogfact}
                        onValueChange={(v) => {
                            storage.enabledCommands.dogfact = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                    <TableSwitchRow
                        label="/useless"
                        subLabel="Get random useless facts"
                        value={storage.enabledCommands.useless}
                        onValueChange={(v) => {
                            storage.enabledCommands.useless = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
