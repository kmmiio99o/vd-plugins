import { clipboard } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { ErrorBoundary, Forms, General } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";
import { changelog, currentVersion } from "../changelog";
import { React } from "@vendetta/metro/common";

const { FormRow, FormSection } = Forms;
const { View, ScrollView, Text, TouchableOpacity } = General;

export default function ChangelogView() {
    return (
        <ErrorBoundary>
            <ScrollView style={{ flex: 1 }}>
                <FormSection title="CURRENT VERSION">
                    <FormRow
                        label={currentVersion}
                        trailing={
                            <TouchableOpacity
                                onPress={() => {
                                    clipboard.setString(currentVersion);
                                    showToast("Version copied to clipboard", getAssetIDByName("toast_copy_link"));
                                }}
                            >
                                <Text style={{ color: "#72767d", fontSize: 16 }}>Copy</Text>
                            </TouchableOpacity>
                        }
                    />
                </FormSection>

                <FormSection title="CHANGELOG">
                    {changelog.map((entry, index) => (
                        <View key={index} style={{ padding: 16, borderBottomWidth: index === changelog.length - 1 ? 0 : 0.5, borderBottomColor: "#292929" }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                <Text style={{ color: "#fff", fontWeight: "bold" }}>Version {entry.version}</Text>
                                <Text style={{ color: "#72767d" }}>{entry.date}</Text>
                            </View>
                            {entry.changes.map((change, changeIndex) => (
                                <Text key={changeIndex} style={{ color: "#dcddde", marginLeft: 16, marginTop: 4 }}>
                                    • {change}
                                </Text>
                            ))}
                        </View>
                    ))}
                </FormSection>
            </ScrollView>
        </ErrorBoundary>
    );
}
