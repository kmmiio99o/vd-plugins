import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { alerts } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
import BetterTableRowGroup from "../components/BetterTableRowGroup";

const { FormSwitchRow, FormRow } = Forms;

export default function HiddenSettingsPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const styles = stylesheet.createThemedStyleSheet({
    container: {
      flex: 1,
      backgroundColor: semanticColors.BACKGROUND_PRIMARY,
    },
    warningText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      textAlign: "center",
      lineHeight: 20,
      fontWeight: "600",
    },
    infoText: {
      fontSize: 14,
      color: semanticColors.TEXT_MUTED,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 8,
    },
  });

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
        title="⚠️ Warning"
        icon={getAssetIDByName("WarningIcon")}
        padding={true}
      >
        <RN.Text style={styles.warningText}>
          These are hidden commands that may contain mature content or
          experimental features.
        </RN.Text>
        <RN.Text style={styles.infoText}>
          Use at your own discretion. Commands in this section are disabled by
          default.
        </RN.Text>
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="Hidden Commands"
        icon={getAssetIDByName("EyeIcon")}
      >
        <FormSwitchRow
          label="/lovefemboys"
          subLabel="Get random femboy images from r/femboys (NSFW content available)"
          leading={<FormRow.Icon source={getAssetIDByName("HeartIcon")} />}
          value={storage.enabledCommands.lovefemboys}
          onValueChange={(v) => {
            storage.enabledCommands.lovefemboys = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="NSFW Bypass Options"
        icon={getAssetIDByName("WarningIcon")}
      >
        <FormSwitchRow
          label="KonoChan NSFW Bypass"
          subLabel="Allow NSFW KonoChan content in non-NSFW channels (USE WITH CAUTION)"
          leading={<FormRow.Icon source={getAssetIDByName("ShieldIcon")} />}
          value={storage.hiddenSettings.konochanBypassNsfw}
          onValueChange={(v) => {
            if (v) {
              alerts.showConfirmationAlert({
                title: "⚠️ NSFW Bypass Warning",
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
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="Hidden Settings Control"
        icon={getAssetIDByName("SettingsIcon")}
      >
        <FormSwitchRow
          label="Keep Hidden Settings Visible"
          subLabel="Keep this section visible even when navigating away"
          leading={<FormRow.Icon source={getAssetIDByName("EyeIcon")} />}
          value={storage.hiddenSettings.visible}
          onValueChange={(v) => {
            storage.hiddenSettings.visible = v;
          }}
        />
        <FormRow
          label="Reset Hidden Settings"
          subLabel="Hide this section and disable all hidden commands"
          leading={<FormRow.Icon source={getAssetIDByName("TrashIcon")} />}
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
      </BetterTableRowGroup>
    </RN.ScrollView>
  );
}
