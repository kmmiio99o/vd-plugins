import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React } from "@vendetta/metro/common";
import {
    ScrollView,
    Stack,
    TableRowGroup,
    TableRow,
    TableSwitchRow,
} from "../components/TableComponents";

export default function SpotifySettingsPage() {
    useProxy(storage);
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
            <Stack spacing={12}>
                <TableRowGroup title="Spotify Commands">
                    <TableSwitchRow
                        label="/spotify track"
                        subLabel="Share your current Spotify track"
                        value={storage.enabledCommands.spotifyTrack}
                        onValueChange={(v) => {
                            storage.enabledCommands.spotifyTrack = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                    <TableSwitchRow
                        label="/spotify album"
                        subLabel="Share your current track's album"
                        value={storage.enabledCommands.spotifyAlbum}
                        onValueChange={(v) => {
                            storage.enabledCommands.spotifyAlbum = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                    <TableSwitchRow
                        label="/spotify artists"
                        subLabel="Share your current track's artists"
                        value={storage.enabledCommands.spotifyArtists}
                        onValueChange={(v) => {
                            storage.enabledCommands.spotifyArtists = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                    <TableSwitchRow
                        label="/spotify cover"
                        subLabel="Share your current track's cover"
                        value={storage.enabledCommands.spotifyCover}
                        onValueChange={(v) => {
                            storage.enabledCommands.spotifyCover = v;
                            storage.pendingRestart = true;
                            forceUpdate();
                        }}
                    />
                </TableRowGroup>

                <TableRowGroup title="About Spotify Commands">
                    <TableRow
                        label="Spotify Integration"
                        subLabel="These commands allow you to share your current Spotify activity in Discord. Make sure you have Spotify connected to Discord for these commands to work properly."
                    />
                </TableRowGroup>
            </Stack>
        </ScrollView>
    );
}
