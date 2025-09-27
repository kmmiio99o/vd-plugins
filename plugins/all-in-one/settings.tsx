import { plugin } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { React } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { View } from "react-native";

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

export default function Settings() {
  useProxy(storage);
  const [rerender, forceRerender] = React.useReducer((x) => x + 1, 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <Stack spacing={8}>
          {/* Facts Commands Settings */}
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
              value={true}
              disabled={true}
            />
            <TableSwitchRow
              label="/dogfact"
              subLabel="Get random dog facts"
              icon={getAssetIDByName("ic_info")}
              value={true}
              disabled={true}
            />
            <TableSwitchRow
              label="/useless"
              subLabel="Get random useless facts"
              icon={getAssetIDByName("ic_info")}
              value={true}
              disabled={true}
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
              value={true}
              disabled={true}
            />
            <TableSwitchRow
              label="/theme-list"
              subLabel="List all installed themes"
              icon={getAssetIDByName("ic_theme")}
              value={true}
              disabled={true}
            />
          </TableRowGroup>

          {/* Image Commands */}
          <TableRowGroup title="Image Commands">
            <TableSwitchRow
              label="/petpet"
              subLabel="Create pet-pet GIF of a user"
              icon={getAssetIDByName("ic_image")}
              value={true}
              disabled={true}
            />
          </TableRowGroup>

          {/* KonoChan Commands */}
          <TableRowGroup title="KonoChan Commands">
            <TableSwitchRow
              label="/konoself"
              subLabel="Get random image from KonoChan (private)"
              icon={getAssetIDByName("ic_image")}
              value={true}
              disabled={true}
            />
            <TableSwitchRow
              label="/konosend"
              subLabel="Send random image from KonoChan to channel"
              icon={getAssetIDByName("ic_image")}
              value={true}
              disabled={true}
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
