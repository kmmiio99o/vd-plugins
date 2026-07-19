import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React } from "@vendetta/metro/common";
import { NavigationNative } from "@vendetta/metro/common";
import { alerts } from "@vendetta/ui";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableRow,
} from "./components/TableComponents";
import Header from "./components/Header";

import FactsSettingsPage from "./pages/FactsSettingsPage";
import ListSettingsPage from "./pages/ListSettingsPage";
import ImageSettingsPage from "./pages/ImageSettingsPage";
import GaryAPIPage from "./pages/GaryAPIPage";
import SpotifySettingsPage from "./pages/SpotifySettingsPage";
import AliucordPage from "./pages/AliucordPage";
import OtherSettingsPage from "./pages/OtherSettingsPage";
import HiddenSettingsPage from "./pages/HiddenSettingsPage";
import CreditsPage from "./pages/CreditsPage";

if (storage.factSettings == null) {
    storage.factSettings = {
        sendAsReply: true,
        includeCitation: false,
    };
}

if (storage.listSettings == null) {
    storage.listSettings = {
        pluginListAlwaysDetailed: false,
        themeListAlwaysDetailed: false,
    };
}

if (storage.garySettings == null) {
    storage.garySettings = {
        imageSource: "gary",
    };
}

if (storage.enabledCommands == null) {
    storage.enabledCommands = {
        catfact: true,
        dogfact: true,
        useless: true,
        petpet: true,
        pluginList: true,
        themeList: true,
        konoself: true,
        konosend: true,
        firstmessage: true,
        sysinfo: true,
        spotifyTrack: true,
        spotifyAlbum: true,
        spotifyArtists: true,
        spotifyCover: true,
        gary: true,
        ip: true,
        lovefemboys: false,
        nekoslife: false,
        friendInviteCreate: true,
        friendInviteView: true,
        friendInviteRevoke: true,
    };
}

if (storage.pendingRestart == null) {
    storage.pendingRestart = false;
}

if (storage.hiddenSettings == null) {
    storage.hiddenSettings = {
        enabled: false,
        visible: false,
        konochanBypassNsfw: false,
    };
}

if (storage.sidebarEnabled == null) {
    storage.sidebarEnabled = true;
}

export default function Settings() {
    useProxy(storage);
    const navigation = NavigationNative.useNavigation();

    React.useEffect(() => {
        return () => {
            if (storage.pendingRestart) {
                storage.pendingRestart = false;
                alerts.showConfirmationAlert({
                    title: "Restart Required",
                    content:
            "You have made changes to commands. Please restart Discord to apply these changes.",
                    confirmText: "Okay",
                    cancelText: null,
                    onConfirm: () => {},
                });
            }
        };
    }, []);

    const garySourceLabel =
        storage.garySettings.imageSource === "gary"
            ? "Gary API"
            : storage.garySettings.imageSource === "catapi"
                ? "Cat API"
                : storage.garySettings.imageSource === "minker"
                    ? "Minker API"
                    : storage.garySettings.imageSource === "goober"
                        ? "Goober API"
                        : "Gary API";

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Header />
            <Stack spacing={12}>
                <TableRowGroup title="Command Categories">
                    <TableRow
                        label="Facts Commands"
                        subLabel="Cat facts, dog facts, and useless facts"
                        trailing={<TableRow.Arrow />}
                        onPress={() =>
                            navigation.push("VendettaCustomPage", {
                                title: "Facts Commands",
                                render: FactsSettingsPage,
                            })
                        }
                    />
                    <TableRow
                        label="List Commands"
                        subLabel="Plugin lists and theme lists"
                        trailing={<TableRow.Arrow />}
                        onPress={() =>
                            navigation.push("VendettaCustomPage", {
                                title: "List Commands",
                                render: ListSettingsPage,
                            })
                        }
                    />
                    <TableRow
                        label="Image Commands"
                        subLabel="PetPet, KonoChan, and image utilities"
                        trailing={<TableRow.Arrow />}
                        onPress={() =>
                            navigation.push("VendettaCustomPage", {
                                title: "Image Commands",
                                render: ImageSettingsPage,
                            })
                        }
                    />
                    <TableRow
                        label="Gary Commands"
                        subLabel={`Gary images - Current: ${garySourceLabel}`}
                        trailing={<TableRow.Arrow />}
                        onPress={() =>
                            navigation.push("VendettaCustomPage", {
                                title: "Gary Commands",
                                render: GaryAPIPage,
                            })
                        }
                    />
                    <TableRow
                        label="Spotify Commands"
                        subLabel="Share your Spotify activity"
                        trailing={<TableRow.Arrow />}
                        onPress={() =>
                            navigation.push("VendettaCustomPage", {
                                title: "Spotify Commands",
                                render: SpotifySettingsPage,
                            })
                        }
                    />
                    <TableRow
                        label="Aliucord Commands"
                        subLabel="Commands from Aliucord"
                        trailing={<TableRow.Arrow />}
                        onPress={() =>
                            navigation.push("VendettaCustomPage", {
                                title: "Aliucord",
                                render: AliucordPage,
                            })
                        }
                    />
                    <TableRow
                        label="Other Commands"
                        subLabel="Utility and system commands"
                        trailing={<TableRow.Arrow />}
                        onPress={() =>
                            navigation.push("VendettaCustomPage", {
                                title: "Other Commands",
                                render: OtherSettingsPage,
                            })
                        }
                    />
                </TableRowGroup>

                {storage.hiddenSettings?.visible && (
                    <TableRowGroup title="Hidden Settings">
                        <TableRow
                            label="Hidden Commands"
                            subLabel="Access to experimental and NSFW commands"
                            trailing={<TableRow.Arrow />}
                            onPress={() =>
                                navigation.push("VendettaCustomPage", {
                                    title: "Hidden Settings",
                                    render: HiddenSettingsPage,
                                })
                            }
                        />
                    </TableRowGroup>
                )}

                <TableRowGroup title="Other">
                    <TableRow
                        label="Credits"
                        subLabel="View original authors of the plugins"
                        trailing={<TableRow.Arrow />}
                        onPress={() =>
                            navigation.push("VendettaCustomPage", {
                                title: "Credits",
                                render: CreditsPage,
                            })
                        }
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
