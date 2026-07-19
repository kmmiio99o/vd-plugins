import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React } from "@vendetta/metro/common";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableSwitchRow,
    TableRadioGroup,
    TableRadioRow,
} from "../components/TableComponents";

export default function GaryAPIPage() {
    useProxy(storage);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={12}>
                <TableRowGroup title="Gary Command Settings">
                    <TableSwitchRow
                        label="/gary"
                        subLabel="Send random Gary images to channel"
                        value={storage.enabledCommands.gary}
                        onValueChange={(v) => {
                            storage.enabledCommands.gary = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="Image Source Selection">
                    <TableRadioGroup
                        value={storage.garySettings.imageSource}
                        onChange={(v) => {
                            storage.garySettings.imageSource = v;
                            forceUpdate();
                        }}
                    >
                        <TableRadioRow
                            value="gary"
                            label="Gary API"
                            subLabel="Original Gary the cat images from api.garythe.cat"
                        />
                        <TableRadioRow
                            value="catapi"
                            label="Cat API"
                            subLabel="Random cat pictures from thecatapi.com"
                        />
                        <TableRadioRow
                            value="minker"
                            label="Minker API"
                            subLabel="Minky images from minky.materii.dev"
                        />
                        <TableRadioRow
                            value="goober"
                            label="Goober API"
                            subLabel="Goober images from api.garythe.cat/goober"
                        />
                    </TableRadioGroup>
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
