import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React } from "@vendetta/metro/common";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableSwitchRow,
} from "../components/TableComponents";

export default function ImageSettingsPage() {
    useProxy(storage);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={12}>
                <TableRowGroup title="Image Commands">
                    <TableSwitchRow
                        label="/petpet"
                        subLabel="Create pet-pet GIF of a user"
                        value={storage.enabledCommands.petpet}
                        onValueChange={(v) => {
                            storage.enabledCommands.petpet = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="KonoChan Commands">
                    <TableSwitchRow
                        label="/konoself"
                        subLabel="Get random image from KonoChan (private)"
                        value={storage.enabledCommands.konoself}
                        onValueChange={(v) => {
                            storage.enabledCommands.konoself = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                    <TableSwitchRow
                        label="/konosend"
                        subLabel="Send random image from KonoChan to channel"
                        value={storage.enabledCommands.konosend}
                        onValueChange={(v) => {
                            storage.enabledCommands.konosend = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
