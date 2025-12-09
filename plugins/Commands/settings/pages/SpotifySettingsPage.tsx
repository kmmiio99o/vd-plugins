import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import BetterTableRowGroup from "../components/BetterTableRowGroup";

const { FormSwitchRow, FormRow } = Forms;

export default function SpotifySettingsPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const styles = stylesheet.createThemedStyleSheet({
    infoText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      textAlign: "center",
      lineHeight: 20,
    },
  });

  return (
    <RN.ScrollView
      style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 16,
        maxWidth: "100%",
      }}
    >
      <BetterTableRowGroup
        title="Spotify Commands"
        icon={getAssetIDByName("SpotifyNeutralIcon")}
      >
        <FormSwitchRow
          label="/spotify track"
          subLabel="Share your current Spotify track"
          leading={
            <FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />
          }
          value={storage.enabledCommands.spotifyTrack}
          onValueChange={(v) => {
            storage.enabledCommands.spotifyTrack = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
        <FormSwitchRow
          label="/spotify album"
          subLabel="Share your current track's album"
          leading={
            <FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />
          }
          value={storage.enabledCommands.spotifyAlbum}
          onValueChange={(v) => {
            storage.enabledCommands.spotifyAlbum = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
        <FormSwitchRow
          label="/spotify artists"
          subLabel="Share your current track's artists"
          leading={
            <FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />
          }
          value={storage.enabledCommands.spotifyArtists}
          onValueChange={(v) => {
            storage.enabledCommands.spotifyArtists = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
        <FormSwitchRow
          label="/spotify cover"
          subLabel="Share your current track's cover"
          leading={
            <FormRow.Icon source={getAssetIDByName("SpotifyNeutralIcon")} />
          }
          value={storage.enabledCommands.spotifyCover}
          onValueChange={(v) => {
            storage.enabledCommands.spotifyCover = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="About Spotify Commands"
        icon={getAssetIDByName("InfoIcon")}
        padding={true}
      >
        <RN.Text style={styles.infoText}>
          These commands allow you to share your current Spotify activity in
          Discord. Make sure you have Spotify connected to Discord for these
          commands to work properly.
        </RN.Text>
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
