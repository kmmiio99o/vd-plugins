import { plugin } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { React } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { View } from "react-native";
import { alerts } from "@vendetta/ui";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableSwitchRow, Stack } = findByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "Stack",
);

// Initialize default settings if not exist
if (!storage.factSettings) {
  storage.factSettings = {
    sendAsReply: true,
    includeCitation: false,
  };
}

if (!storage.listSettings) {
  storage.listSettings = {
    pluginListAlwaysDetailed: false,
    themeListAlwaysDetailed: false,
  };
}

if (!storage.enabledCommands) {
  storage.enabledCommands = {
    catfact: true,
    dogfact: true,
    useless: true,
    petpet: true,
    pluginList: true,
    themeList: true,
    konoself: true,
    konosend: true,
  };
}

const askForRestart = (commandName: string, enabled: boolean) => {
  return alerts.showConfirmationAlert({
    title: "Restart Required",
    content: `${enabled ? "Enabling" : "Disabling"} the ${commandName} command requires a Discord restart to take effect. Would you like to restart now?`,
    confirmText: "Restart",
    cancelText: "Later",
    confirmColor: "brand",
    onConfirm: () => {
      storage.enabledCommands[commandName] = enabled;
      window.enmity.plugins.reload("vendetta");
    },
    onCancel: () => {
      storage.enabledCommands[commandName] = !enabled; // Revert change if user doesn't want to restart
    },
  });
};

export default function Settings() {
  useProxy(storage);
  const [rerender, forceRerender] = React.useReducer((x) => x + 1, 0);

  const handleCommandToggle = (commandName: string, value: boolean) => {
    askForRestart(commandName, value);
    forceRerender();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <Stack spacing={8}>
          {/* Facts Commands */}
          <TableRowGroup title="Facts Commands">
            <TableSwitchRow
              label="Send as Reply"
              subLabel="Send facts as a reply to the command message"
              icon={getAssetIDByName("ic_reply_24px")}
              value={storage.factSettings.sendAsReply}
              onValueChange={(v: boolean) => {
                storage.factSettings.sendAsReply = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="Include Source Citation"
              subLabel="Include the source of facts when available"
              icon={getAssetIDByName("ic_info")}
              value={storage.factSettings.includeCitation}
              onValueChange={(v: boolean) => {
                storage.factSettings.includeCitation = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="/catfact"
              subLabel="Get random cat facts"
              icon={getAssetIDByName("ic_info")}
              value={storage.enabledCommands.catfact}
              onValueChange={(v) => handleCommandToggle("catfact", v)}
            />
            <TableSwitchRow
              label="/dogfact"
              subLabel="Get random dog facts"
              icon={getAssetIDByName("ic_info")}
              value={storage.enabledCommands.dogfact}
              onValueChange={(v) => handleCommandToggle("dogfact", v)}
            />
            <TableSwitchRow
              label="/useless"
              subLabel="Get random useless facts"
              icon={getAssetIDByName("ic_info")}
              value={storage.enabledCommands.useless}
              onValueChange={(v) => handleCommandToggle("useless", v)}
            />
          </TableRowGroup>

          {/* List Commands Settings */}
          <TableRowGroup title="List Commands">
            <TableSwitchRow
              label="Always Send Detailed Plugin List"
              subLabel="Always use detailed mode when listing plugins"
              icon={getAssetIDByName("ic_message_copy")}
              value={storage.listSettings.pluginListAlwaysDetailed}
              onValueChange={(v: boolean) => {
                storage.listSettings.pluginListAlwaysDetailed = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="Always Send Detailed Theme List"
              subLabel="Always use detailed mode when listing themes"
              icon={getAssetIDByName("ic_theme")}
              value={storage.listSettings.themeListAlwaysDetailed}
              onValueChange={(v: boolean) => {
                storage.listSettings.themeListAlwaysDetailed = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="/plugin-list"
              subLabel="List all installed plugins"
              icon={getAssetIDByName("ic_plugins")}
              value={storage.enabledCommands.pluginList}
              onValueChange={(v) => handleCommandToggle("pluginList", v)}
            />
            <TableSwitchRow
              label="/theme-list"
              subLabel="List all installed themes"
              icon={getAssetIDByName("ic_theme")}
              value={storage.enabledCommands.themeList}
              onValueChange={(v) => handleCommandToggle("themeList", v)}
            />
          </TableRowGroup>

          {/* Image Commands */}
          <TableRowGroup title="Image Commands">
            <TableSwitchRow
              label="/petpet"
              subLabel="Create pet-pet GIF of a user"
              icon={getAssetIDByName("ic_image")}
              value={storage.enabledCommands.petpet}
              onValueChange={(v) => handleCommandToggle("petpet", v)}
            />
          </TableRowGroup>

          {/* KonoChan Commands */}
          <TableRowGroup title="KonoChan Commands">
            <TableSwitchRow
              label="/konoself"
              subLabel="Get random image from KonoChan (private)"
              icon={getAssetIDByName("ic_image")}
              value={storage.enabledCommands.konoself}
              onValueChange={(v) => handleCommandToggle("konoself", v)}
            />
            <TableSwitchRow
              label="/konosend"
              subLabel="Send random image from KonoChan to channel"
              icon={getAssetIDByName("ic_image")}
              value={storage.enabledCommands.konosend}
              onValueChange={(v) => handleCommandToggle("konosend", v)}
            />
          </TableRowGroup>

          {/* About Section */}
          <TableRowGroup title="About">
            <TableSwitchRow
              label="All-In-One Commands"
              subLabel="A collection of useful commands"
              icon={getAssetIDByName("ic_badge_staff")}
              value={true}
              disabled={true}
            />
          </TableRowGroup>
        </Stack>
      </ScrollView>
    </View>
  );
}
