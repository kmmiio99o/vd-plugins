import { plugin } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableSwitchRow, Stack } = findByProps(
    "TableSwitchRow",
    "TableRowGroup",
    "Stack",
);

export default function MoyaiSettings() {
    const [, forceUpdate] = React.useReducer((x: number) => ~x, 0);

    return (
        <ScrollView style={{ flex: 1 }}>
            <Stack style={{ padding: 16 }} spacing={16}>
                <TableRowGroup title="General">
                    <TableSwitchRow
                        label="Play on reactions"
                        subLabel="Play the sound when someone reacts with moyai"
                        value={plugin.storage.allowReactions ?? true}
                        onValueChange={(v: boolean) => {
                            plugin.storage.allowReactions = v;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
