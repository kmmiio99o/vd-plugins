import { plugin } from "@vendetta";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { React } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableSwitchRow, Stack } = findByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "Stack",
);

const get = (k: string, fallback: any = "") => plugin.storage[k] ?? fallback;
const set = (k: string, v: any) => (plugin.storage[k] = v);

export default function Settings() {
  const [_, forceUpdate] = React.useReducer((x) => ~x, 0);
  const update = () => forceUpdate();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        {/* Facts Commands Settings */}
        <TableRowGroup title="Facts Settings">
          <TableSwitchRow
            label="Send as Reply"
            subLabel="Send facts as a reply to the command message"
            icon={getAssetIDByName("ic_reply_24px")}
            value={get("factSettings.sendAsReply", true)}
            onValueChange={(value: boolean) => {
              set("factSettings", {
                ...get("factSettings", {}),
                sendAsReply: value,
              });
              update();
            }}
          />
          <TableSwitchRow
            label="Include Source Citation"
            subLabel="Include the source of facts when available"
            icon={getAssetIDByName("ic_info")}
            value={get("factSettings.includeCitation", false)}
            onValueChange={(value: boolean) => {
              set("factSettings", {
                ...get("factSettings", {}),
                includeCitation: value,
              });
              update();
            }}
          />
        </TableRowGroup>

        {/* Plugin List Settings */}
        <TableRowGroup title="Plugin List Settings">
          <TableSwitchRow
            label="Always Send Detailed List"
            subLabel="Always use detailed mode when listing plugins"
            icon={getAssetIDByName("ic_message_copy")}
            value={get("listSettings.pluginListAlwaysDetailed", false)}
            onValueChange={(value: boolean) => {
              set("listSettings", {
                ...get("listSettings", {}),
                pluginListAlwaysDetailed: value,
              });
              update();
            }}
          />
        </TableRowGroup>

        {/* Theme List Settings */}
        <TableRowGroup title="Theme List Settings">
          <TableSwitchRow
            label="Always Send Detailed List"
            subLabel="Always use detailed mode when listing themes"
            icon={getAssetIDByName("ic_theme")}
            value={get("listSettings.themeListAlwaysDetailed", false)}
            onValueChange={(value: boolean) => {
              set("listSettings", {
                ...get("listSettings", {}),
                themeListAlwaysDetailed: value,
              });
              update();
            }}
          />
        </TableRowGroup>

        {/* Commands Overview */}
        <TableRowGroup title="Available Commands">
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
          <TableSwitchRow
            label="/petpet"
            subLabel="Create pet-pet GIF of a user"
            icon={getAssetIDByName("ic_image")}
            value={true}
            disabled={true}
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
          <TableSwitchRow
            label="/konoself, /konosend"
            subLabel="Get random images from KonoChan"
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
  );
}
