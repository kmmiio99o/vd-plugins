import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { ScrollView, Stack, TableRowGroup, TableSwitchRow } from "../lib/table";

export default function Settings() {
    useProxy(storage);

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={8}>
                <TableRowGroup title="Gestures">
                    <TableSwitchRow
                        label="Triple-tap to delete"
                        subLabel="Triple-tap your own message to delete it instantly"
                        value={!!storage.tripleTapDelete}
                        onValueChange={(v: boolean) => { storage.tripleTapDelete = v; }}
                    />
                    <TableSwitchRow
                        label="Reply to own messages instead of edit"
                        subLabel="Double-tap your own message to reply to it instead of editing"
                        value={!!storage.replyToOwn}
                        onValueChange={(v: boolean) => { storage.replyToOwn = v; }}
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
