import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React } from "@vendetta/metro/common";
import { alerts } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableRow,
    TableSwitchRow,
} from "../components/TableComponents";

export default function HiddenSettingsPage() {
    useProxy(storage);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={12}>
                <TableRowGroup title="Warning">
                    <TableRow
                        label="Hidden Commands Warning"
                        subLabel="These are hidden commands that may contain mature content or experimental features. Use at your own discretion. Commands in this section are disabled by default."
                    />
                </TableRowGroup>

                <TableRowGroup title="Hidden Commands">
                    <TableSwitchRow
                        label="/lovefemboys"
                        subLabel="Get random femboy images from r/femboys (NSFW content available)"
                        value={storage.enabledCommands.lovefemboys}
                        onValueChange={(v) => {
                            storage.enabledCommands.lovefemboys = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="NSFW Bypass Options">
                    <TableSwitchRow
                        label="KonoChan NSFW Bypass"
                        subLabel="Allow NSFW KonoChan content in non-NSFW channels (USE WITH CAUTION)"
                        value={storage.hiddenSettings.konochanBypassNsfw}
                        onValueChange={(v) => {
                            if (v) {
                                alerts.showConfirmationAlert({
                                    title: "NSFW Bypass Warning",
                                    content:
                    "Enabling this allows NSFW content from KonoChan to be sent in any channel, including non-NSFW channels. This could violate server rules or Discord ToS. Use responsibly!",
                                    confirmText: "I Understand",
                                    cancelText: "Cancel",
                                    onConfirm: () => {
                                        storage.hiddenSettings.konochanBypassNsfw = true;
                                        forceUpdate();
                                    },
                                    onCancel: () => {},
                                });
                            } else {
                                storage.hiddenSettings.konochanBypassNsfw = false;
                                forceUpdate();
                            }
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="Hidden Settings Control">
                    <TableSwitchRow
                        label="Keep Hidden Settings Visible"
                        subLabel="Keep this section visible even when navigating away"
                        value={storage.hiddenSettings.visible}
                        onValueChange={(v) => {
                            storage.hiddenSettings.visible = v;
                        }}
                    />
                    <TableRow
                        label="Reset Hidden Settings"
                        subLabel="Hide this section and disable all hidden commands"
                        onPress={() => {
                            alerts.showConfirmationAlert({
                                title: "Reset Hidden Settings",
                                content:
                "This will hide the hidden settings section and disable all hidden commands. Are you sure?",
                                confirmText: "Reset",
                                onConfirm: () => {
                                    storage.hiddenSettings.enabled = false;
                                    storage.hiddenSettings.visible = false;
                                    storage.hiddenSettings.konochanBypassNsfw = false;
                                    storage.enabledCommands.lovefemboys = false;

                                    storage.pendingRestart = true;
                                    showToast(
                                        "Hidden settings reset",
                                        getAssetIDByName("CheckmarkIcon"),
                                    );
                                },
                                cancelText: "Cancel",
                            });
                        }}
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
