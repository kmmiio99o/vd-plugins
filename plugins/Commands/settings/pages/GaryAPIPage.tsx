import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import BetterTableRowGroup from "../components/BetterTableRowGroup";

const { FormSwitchRow, FormRow } = Forms;

export default function GaryAPIPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
    infoText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      marginBottom: 16,
      textAlign: "center",
    },
    currentText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      textAlign: "center",
      fontWeight: "600",
    },
  });

  const currentSource = storage.garySettings.imageSource;

  return (
    <RN.ScrollView
      style={styles.container}
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 16,
        maxWidth: "100%",
      }}
    >
      <BetterTableRowGroup
        title="Gary Command Settings"
        icon={getAssetIDByName("SettingsIcon")}
      >
        <FormSwitchRow
          label="/gary"
          subLabel="Send random Gary images to channel"
          leading={<FormRow.Icon source={getAssetIDByName("AttachmentIcon")} />}
          value={storage.enabledCommands.gary}
          onValueChange={(v) => {
            storage.enabledCommands.gary = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="Image Source Selection"
        icon={getAssetIDByName("DownloadIcon")}
        padding={true}
      >
        <RN.Text style={styles.infoText}>
          Choose which API the /gary command should use to fetch images.
        </RN.Text>
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="API Options"
        icon={getAssetIDByName("CloudIcon")}
      >
        <FormSwitchRow
          label="Gary API"
          subLabel="Original Gary the cat images from api.garythe.cat"
          leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
          value={currentSource === "gary"}
          onValueChange={(v) => {
            if (v) {
              storage.garySettings.imageSource = "gary";
              forceUpdate();
            }
          }}
        />
        <FormSwitchRow
          label="Cat API"
          subLabel="Random cat pictures from thecatapi.com"
          leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
          value={currentSource === "catapi"}
          onValueChange={(v) => {
            if (v) {
              storage.garySettings.imageSource = "catapi";
              forceUpdate();
            }
          }}
        />
        <FormSwitchRow
          label="Minker API"
          subLabel="Minky images from minky.materii.dev"
          leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
          value={currentSource === "minker"}
          onValueChange={(v) => {
            if (v) {
              storage.garySettings.imageSource = "minker";
              forceUpdate();
            }
          }}
        />
        <FormSwitchRow
          label="Goober API"
          subLabel="Goober images from api.garythe.cat/goober"
          leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
          value={currentSource === "goober"}
          onValueChange={(v) => {
            if (v) {
              storage.garySettings.imageSource = "goober";
              forceUpdate();
            }
          }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="Current Selection"
        icon={getAssetIDByName("CheckmarkIcon")}
        padding={true}
      >
        <RN.Text style={styles.currentText}>
          Currently using:{" "}
          {currentSource === "gary"
            ? "Gary API"
            : currentSource === "catapi"
              ? "Cat API"
              : currentSource === "minker"
                ? "Minker API"
                : currentSource === "goober"
                  ? "Goober API"
                  : "Gary API"}
        </RN.Text>
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
