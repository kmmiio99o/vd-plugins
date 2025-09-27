import { plugin } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { React } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { View } from "react-native";
import { alerts } from "@vendetta/ui";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableSwitchRow, Stack, TableRow } = findByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "Stack",
  "TableRow",
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

if (!storage.pendingRestart) {
  storage.pendingRestart = false;
}

const Credits = {
  PETPET: "wolfieeee",
  FACTS: "jdev082",
  LISTS: "Kitomanari",
  KONOCHAN: ["btmc727", "Rico040"],
};

export default function Settings() {
  useProxy(storage);
  const [rerender, forceRerender] = React.useReducer((x) => x + 1, 0);

  // Check for changes when component unmounts
  React.useEffect(() => {
    return () => {
      if (storage.pendingRestart) {
        alerts.showConfirmationAlert({
          title: "Restart Required",
          content:
            "Command changes require Discord to restart. Would you like to restart now?",
          confirmText: "Restart",
          cancelText: "Later",
          confirmColor: "brand",
          onConfirm: () => {
            window.enmity.plugins.reload("vendetta");
          },
        });
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
            <TableRow
              label="Credits"
              subLabel={`Facts commands by ${Credits.FACTS}`}
              icon={getAssetIDByName("ic_info")}
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

          {/* List Commands */}
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
            <TableRow
              label="Credits"
              subLabel={`List commands by ${Credits.LISTS}`}
              icon={getAssetIDByName("ic_info")}
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
            <TableRow
              label="Credits"
              subLabel={`PetPet command by ${Credits.PETPET}`}
              icon={getAssetIDByName("ic_info")}
            />
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
            <TableRow
              label="Credits"
              subLabel={`KonoChan commands by ${Credits.KONOCHAN.join(" & ")}`}
              icon={getAssetIDByName("ic_info")}
            />
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
