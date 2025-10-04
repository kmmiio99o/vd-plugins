import { clipboard } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { changelog, currentVersion } from "../changelog";
import { React } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const { TableRowGroup, TableRow, Stack } = findByProps(
    "TableSwitchRow",
    "TableRowGroup",
    "Stack",
    "TableRow",
);
const { ScrollView } = General;

export default function ChangelogView() {
    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={8}>
                <TableRowGroup title="CURRENT VERSION">
                    <TableRow
                        label={currentVersion}
                        trailing={
                            <General.TouchableOpacity
                                onPress={() => {
                                    clipboard.setString(currentVersion);
                                    showToast(
                                        "Version copied to clipboard",
                                        getAssetIDByName("toast_copy_link"),
                                    );
                                }}
                            >
                                <General.Text style={{ color: "#72767d", fontSize: 16 }}>
                  Copy
                                </General.Text>
                            </General.TouchableOpacity>
                        }
                    />
                </TableRowGroup>

                <TableRowGroup title="CHANGELOG">
                    {changelog.map((entry, index) => (
                        <Stack
                            key={index}
                            spacing={4}
                            style={{
                                padding: 12,
                                borderBottomWidth: index === changelog.length - 1 ? 0 : 0.5,
                                borderBottomColor: "#292929",
                            }}
                        >
                            <General.View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <General.Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Version {entry.version}
                                </General.Text>
                                <General.Text style={{ color: "#72767d" }}>
                                    {entry.date}
                                </General.Text>
                            </General.View>
                            {entry.changes.map((change, changeIndex) => (
                                <General.Text
                                    key={changeIndex}
                                    style={{ color: "#dcddde", marginLeft: 8, marginTop: 2 }}
                                >
                  • {change}
                                </General.Text>
                            ))}
                        </Stack>
                    ))}
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
