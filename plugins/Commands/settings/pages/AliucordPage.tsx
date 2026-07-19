import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React } from "@vendetta/metro/common";
import { NavigationNative } from "@vendetta/metro/common";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableRow,
    TableSwitchRow,
} from "../components/TableComponents";
import NekosLifeCategoriesPage from "./NekosLifeCategoriesPage";

export default function AliucordPage() {
    useProxy(storage);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
    const navigation = NavigationNative.useNavigation();

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={12}>
                <TableRowGroup title="IP Commands">
                    <TableSwitchRow
                        label="/ip"
                        subLabel="Get your current IP address"
                        value={storage.enabledCommands.ip}
                        onValueChange={(v) => {
                            storage.enabledCommands.ip = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="NekosLife Commands">
                    <TableSwitchRow
                        label="/nekoslife"
                        subLabel="Get images/gifs from nekos.life"
                        value={storage.enabledCommands.nekoslife}
                        onValueChange={(v) => {
                            storage.enabledCommands.nekoslife = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                    <TableRow
                        label="View Categories"
                        subLabel="See all 16 available categories"
                        trailing={<TableRow.Arrow />}
                        onPress={() =>
                            navigation.push("VendettaCustomPage", {
                                title: "NekosLife Categories",
                                render: NekosLifeCategoriesPage,
                            })
                        }
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
