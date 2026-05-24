import { plugin } from "@vendetta";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const { ScrollView } = ReactNative;
const { TableRowGroup, TableCheckboxRow, Stack } = findByProps(
    "TableCheckboxRow", "TableRowGroup", "Stack"
);

plugin.storage.pressAction ??= "profile";
plugin.storage.longPressAction ??= "server";
plugin.storage.showStatusCutout ??= false;
plugin.storage.collapseWhileTyping ??= false;

export default function ChatboxAvatarSettings() {
    useProxy(plugin.storage);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={8}>
                <TableRowGroup title="Avatar Press Action">
                    <TableCheckboxRow
                        label="Open Profile"
                        checked={plugin.storage.pressAction === "profile"}
                        onPress={() => {
                            plugin.storage.pressAction = "profile";
                            forceUpdate();
                        }}
                    />
                    <TableCheckboxRow
                        label="Open Status Picker"
                        checked={plugin.storage.pressAction === "server"}
                        onPress={() => {
                            plugin.storage.pressAction = "server";
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="Avatar Long-Press Action">
                    <TableCheckboxRow
                        label="Open Profile"
                        checked={plugin.storage.longPressAction === "profile"}
                        onPress={() => {
                            plugin.storage.longPressAction = "profile";
                            forceUpdate();
                        }}
                    />
                    <TableCheckboxRow
                        label="Open Status Picker"
                        checked={plugin.storage.longPressAction === "server"}
                        onPress={() => {
                            plugin.storage.longPressAction = "server";
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="Status Icon">
                    <TableCheckboxRow
                        label="Show"
                        checked={!!plugin.storage.showStatusCutout}
                        onPress={() => {
                            plugin.storage.showStatusCutout = true;
                            forceUpdate();
                        }}
                    />
                    <TableCheckboxRow
                        label="Hide"
                        checked={!plugin.storage.showStatusCutout}
                        onPress={() => {
                            plugin.storage.showStatusCutout = false;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="Collapse While Typing">
                    <TableCheckboxRow
                        label="Collapse avatar while typing"
                        checked={!!plugin.storage.collapseWhileTyping}
                        onPress={() => {
                            plugin.storage.collapseWhileTyping = true;
                            forceUpdate();
                        }}
                    />
                    <TableCheckboxRow
                        label="Always show avatar"
                        checked={!plugin.storage.collapseWhileTyping}
                        onPress={() => {
                            plugin.storage.collapseWhileTyping = false;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
