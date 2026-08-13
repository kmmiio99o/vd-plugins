import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { TableRowGroup, TableSwitchRow } from "../utils/table";
import NoteBox from "./NoteBox";

const { ScrollView, View } = ReactNative;

export default function Settings() {
    useProxy(storage);

    return (
        <ScrollView style={{ flex: 1 }}>
            <NoteBox>
                Server Drawer takes over the Quest Dock (the strip above the tab bar) to show your
                servers as a grid instead - tap to expand, long-press a server for its usual context
                menu, and the + button creates or joins a server through Discord's own modal.
            </NoteBox>
            <TableRowGroup title="Layout">
                <TableSwitchRow
                    label="Hide the DMs tile"
                    subLabel="Remove the DMs tile from the drawer entirely"
                    value={!!storage.hideDmTile}
                    onValueChange={(v: boolean) => { storage.hideDmTile = v; }}
                />
                <TableSwitchRow
                    label="Show server names"
                    subLabel="Print each server's name under its icon in the drawer"
                    value={!!storage.showGuildNames}
                    onValueChange={(v: boolean) => { storage.showGuildNames = v; }}
                />
            </TableRowGroup>
            <View style={{ height: 24 }} />
        </ScrollView>
    );
}
