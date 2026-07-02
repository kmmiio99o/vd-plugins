import { plugin } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableRadioGroup, TableRadioRow, TableSwitchRow, Stack } = findByProps(
    "TableRadioGroup",
    "TableRadioRow",
    "TableSwitchRow",
    "TableRowGroup",
    "Stack",
);

const get = (key: string, fallback: any) => plugin.storage[key] ?? fallback;
const set = (key: string, value: any) => { plugin.storage[key] = value; };

export default function ChatboxAvatarSettings() {
    const [, forceUpdate] = React.useReducer((x: number) => ~x, 0);

    return (
        <ScrollView style={{ flex: 1 }}>
            <Stack style={{ padding: 16 }} spacing={16}>
                <TableRowGroup title="Press Action">
                    <TableRadioGroup
                        value={get("pressAction", "profile")}
                        onChange={(v: string) => { set("pressAction", v); forceUpdate(); }}
                    >
                        <TableRadioRow value="profile" label="Open Profile" />
                        <TableRadioRow value="server" label="Open Account Sheet" />
                    </TableRadioGroup>
                </TableRowGroup>
                <TableRowGroup title="Long Press Action">
                    <TableRadioGroup
                        value={get("longPressAction", "server")}
                        onChange={(v: string) => { set("longPressAction", v); forceUpdate(); }}
                    >
                        <TableRadioRow value="profile" label="Open Profile" />
                        <TableRadioRow value="server" label="Open Account Sheet" />
                    </TableRadioGroup>
                </TableRowGroup>
                <TableRowGroup title="Profile Type">
                    <TableRadioGroup
                        value={get("profileType", "server")}
                        onChange={(v: string) => { set("profileType", v); forceUpdate(); }}
                    >
                        <TableRadioRow value="server" label="Prefer Server Profile" />
                        <TableRadioRow value="main" label="Prefer Main Profile" />
                    </TableRadioGroup>
                </TableRowGroup>
                <TableRowGroup title="Position">
                    <TableRadioGroup
                        value={get("position", "after_actions")}
                        onChange={(v: string) => { set("position", v); forceUpdate(); }}
                    >
                        <TableRadioRow value="before_actions" label="Before Action Buttons" />
                        <TableRadioRow value="after_actions" label="After Action Buttons" />
                        <TableRadioRow value="near_send" label="Near Send Button" />
                    </TableRadioGroup>
                </TableRowGroup>
                <TableRowGroup title="Status Icon">
                    <TableRadioGroup
                        value={get("showStatusCutout", true) ? "true" : "false"}
                        onChange={(v: string) => { set("showStatusCutout", v === "true"); forceUpdate(); }}
                    >
                        <TableRadioRow value="true" label="Show" />
                        <TableRadioRow value="false" label="Hide" />
                    </TableRadioGroup>
                </TableRowGroup>
                <TableRowGroup title="Visibility">
                    <TableSwitchRow
                        label="Show in DMs"
                        value={get("showInDms", true)}
                        onValueChange={(v: boolean) => { set("showInDms", v); forceUpdate(); }}
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
