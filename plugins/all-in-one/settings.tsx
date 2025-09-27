import { plugin } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { React } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { View } from "react-native";
import { BundleUpdaterManager } from "@vendetta/metro/common";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableSwitchRow, Stack, TableRow } = findByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "Stack",
  "TableRow",
);

// Initialize storage with default values
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

if (!storage.pendingRestart) {
  storage.pendingRestart = false;
}

export default function Settings() {
  useProxy(storage);
  const [rerender, forceRerender] = React.useReducer((x) => x + 1, 0);

  // Check for pending restart when unmounting
  React.useEffect(() => {
    return () => {
      if (storage.pendingRestart) {
        storage.pendingRestart = false;
        BundleUpdaterManager.reload();
      }
    };
  }, []);

  const handleCommandToggle = (commandName: string, value: boolean) => {
    storage.enabledCommands[commandName] = value;
    storage.pendingRestart = true;
    forceRerender();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 38 }}
      >
        <Stack spacing={8}>
          {/* Facts Commands */}
          <TableRowGroup title="Facts Commands">
            <TableSwitchRow
              label="Send as Reply"
              subLabel="Send facts as a reply to the command message"
              icon={getAssetIDByName("ic_reply_24px")}
              value={storage.factSettings?.sendAsReply ?? true}
              onValueChange={(v: boolean) => {
                storage.factSettings.sendAsReply = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="Include Source Citation"
              subLabel="Include the source of facts when available"
              icon={getAssetIDByName("ic_info")}
              value={storage.factSettings?.includeCitation ?? false}
              onValueChange={(v: boolean) => {
                storage.factSettings.includeCitation = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="/catfact"
              subLabel="Get random cat facts"
              icon={getAssetIDByName("ic_info")}
              value={storage.enabledCommands?.catfact ?? true}
              onValueChange={(v) => handleCommandToggle("catfact", v)}
            />
            <TableSwitchRow
              label="/dogfact"
              subLabel="Get random dog facts"
              icon={getAssetIDByName("ic_info")}
              value={storage.enabledCommands?.dogfact ?? true}
              onValueChange={(v) => handleCommandToggle("dogfact", v)}
            />
            <TableSwitchRow
              label="/useless"
              subLabel="Get random useless facts"
              icon={getAssetIDByName("ic_info")}
              value={storage.enabledCommands?.useless ?? true}
              onValueChange={(v) => handleCommandToggle("useless", v)}
            />
          </TableRowGroup>

          {/* List Commands */}
          <TableRowGroup title="List Commands">
            <TableSwitchRow
              label="Always Send Detailed Plugin List"
              subLabel="Always use detailed mode when listing plugins"
              icon={getAssetIDByName("ic_message_copy")}
              value={storage.listSettings?.pluginListAlwaysDetailed ?? false}
              onValueChange={(v: boolean) => {
                storage.listSettings.pluginListAlwaysDetailed = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="Always Send Detailed Theme List"
              subLabel="Always use detailed mode when listing themes"
              icon={getAssetIDByName("ic_theme")}
              value={storage.listSettings?.themeListAlwaysDetailed ?? false}
              onValueChange={(v: boolean) => {
                storage.listSettings.themeListAlwaysDetailed = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="/plugin-list"
              subLabel="List all installed plugins"
              icon={getAssetIDByName("ic_plugins")}
              value={storage.enabledCommands?.pluginList ?? true}
              onValueChange={(v) => handleCommandToggle("pluginList", v)}
            />
            <TableSwitchRow
              label="/theme-list"
              subLabel="List all installed themes"
              icon={getAssetIDByName("ic_theme")}
              value={storage.enabledCommands?.themeList ?? true}
              onValueChange={(v) => handleCommandToggle("themeList", v)}
            />
          </TableRowGroup>

          {/* Image Commands */}
          <TableRowGroup title="Image Commands">
            <TableSwitchRow
              label="/petpet"
              subLabel="Create pet-pet GIF of a user"
              icon={getAssetIDByName("ic_image")}
              value={storage.enabledCommands?.petpet ?? true}
              onValueChange={(v) => handleCommandToggle("petpet", v)}
            />
          </TableRowGroup>

          {/* KonoChan Commands */}
          <TableRowGroup title="KonoChan Commands">
            <TableSwitchRow
              label="/konoself"
              subLabel="Get random image from KonoChan (private)"
              icon={getAssetIDByName("ic_image")}
              value={storage.enabledCommands?.konoself ?? true}
              onValueChange={(v) => handleCommandToggle("konoself", v)}
            />
            <TableSwitchRow
              label="/konosend"
              subLabel="Send random image from KonoChan to channel"
              icon={getAssetIDByName("ic_image")}
              value={storage.enabledCommands?.konosend ?? true}
              onValueChange={(v) => handleCommandToggle("konosend", v)}
            />
          </TableRowGroup>

          {/* Credits */}
          <TableRowGroup title="Credits">
            <TableRow
              label="Facts Commands"
              subLabel="by jdev082"
              icon={getAssetIDByName("ic_info")}
            />
            <TableRow
              label="List Commands"
              subLabel="by Kitomanari"
              icon={getAssetIDByName("ic_list")}
            />
            <TableRow
              label="PetPet Command"
              subLabel="by wolfieeee"
              icon={getAssetIDByName("ic_image")}
            />
            <TableRow
              label="KonoChan Commands"
              subLabel="by btmc727 & Rico040"
              icon={getAssetIDByName("ic_image")}
            />
          </TableRowGroup>

          {/* Actions */}
          <TableRowGroup title="Actions">
            <TableRow
              label="Reload Discord"
              subLabel="Apply command changes"
              icon={getAssetIDByName("ic_message_retry")}
              onPress={() => BundleUpdaterManager.reload()}
            />
          </TableRowGroup>

          {/* About */}
          <TableRowGroup title="About">
            <TableRow
              label="All-In-One Commands"
              subLabel="A collection of useful commands"
              icon={getAssetIDByName("ic_badge_staff")}
            />
          </TableRowGroup>
        </Stack>
      </ScrollView>
    </View>
  );
}
