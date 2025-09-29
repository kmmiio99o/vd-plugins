import { plugin } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
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
    firstmessage: true,
    sysinfo: true,
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
        alerts.showConfirmationAlert({
          title: "Restart Required",
          content:
            "You have made changes to commands. Please restart Discord to apply these changes.",
          confirmText: "Okay",
          cancelText: null,
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
              value={storage.factSettings?.sendAsReply ?? true}
              onValueChange={(v: boolean) => {
                storage.factSettings.sendAsReply = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="Include Source Citation"
              subLabel="Include the source of facts when available"
              value={storage.factSettings?.includeCitation ?? false}
              onValueChange={(v: boolean) => {
                storage.factSettings.includeCitation = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="/catfact"
              subLabel="Get random cat facts"
              value={storage.enabledCommands?.catfact ?? true}
              onValueChange={(v) => handleCommandToggle("catfact", v)}
            />
            <TableSwitchRow
              label="/dogfact"
              subLabel="Get random dog facts"
              value={storage.enabledCommands?.dogfact ?? true}
              onValueChange={(v) => handleCommandToggle("dogfact", v)}
            />
            <TableSwitchRow
              label="/useless"
              subLabel="Get random useless facts"
              value={storage.enabledCommands?.useless ?? true}
              onValueChange={(v) => handleCommandToggle("useless", v)}
            />
          </TableRowGroup>

          {/* List Commands */}
          <TableRowGroup title="List Commands">
            <TableSwitchRow
              label="Always Send Detailed Plugin List"
              subLabel="Always use detailed mode when listing plugins"
              value={storage.listSettings?.pluginListAlwaysDetailed ?? false}
              onValueChange={(v: boolean) => {
                storage.listSettings.pluginListAlwaysDetailed = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="Always Send Detailed Theme List"
              subLabel="Always use detailed mode when listing themes"
              value={storage.listSettings?.themeListAlwaysDetailed ?? false}
              onValueChange={(v: boolean) => {
                storage.listSettings.themeListAlwaysDetailed = v;
                forceRerender();
              }}
            />
            <TableSwitchRow
              label="/plugin-list"
              subLabel="List all installed plugins"
              value={storage.enabledCommands?.pluginList ?? true}
              onValueChange={(v) => handleCommandToggle("pluginList", v)}
            />
            <TableSwitchRow
              label="/theme-list"
              subLabel="List all installed themes"
              value={storage.enabledCommands?.themeList ?? true}
              onValueChange={(v) => handleCommandToggle("themeList", v)}
            />
          </TableRowGroup>

          {/* Image Commands */}
          <TableRowGroup title="Image Commands">
            <TableSwitchRow
              label="/petpet"
              subLabel="Create pet-pet GIF of a user"
              value={storage.enabledCommands?.petpet ?? true}
              onValueChange={(v) => handleCommandToggle("petpet", v)}
            />
          </TableRowGroup>

          {/* KonoChan Commands */}
          <TableRowGroup title="KonoChan Commands">
            <TableSwitchRow
              label="/konoself"
              subLabel="Get random image from KonoChan (private)"
              value={storage.enabledCommands?.konoself ?? true}
              onValueChange={(v) => handleCommandToggle("konoself", v)}
            />
            <TableSwitchRow
              label="/konosend"
              subLabel="Send random image from KonoChan to channel"
              value={storage.enabledCommands?.konosend ?? true}
              onValueChange={(v) => handleCommandToggle("konosend", v)}
            />
          </TableRowGroup>

          {/* Message Commands */}
          <TableRowGroup title="Message Commands">
            <TableSwitchRow
              label="/firstmessage"
              subLabel="Get the first message in a channel"
              value={storage.enabledCommands?.firstmessage ?? true}
              onValueChange={(v) => handleCommandToggle("firstmessage", v)}
            />
          </TableRowGroup>

          {/* System Commands */}
          <TableRowGroup title="System Commands">
            <TableSwitchRow
              label="/sysinfo"
              subLabel="Display system information"
              value={storage.enabledCommands?.sysinfo ?? true}
              onValueChange={(v) => handleCommandToggle("sysinfo", v)}
            />
          </TableRowGroup>

          {/* Credits */}
          <TableRowGroup title="Credits">
            <TableRow label="Facts Commands" subLabel="by jdev082" />
            <TableRow label="List Commands" subLabel="by Kitomanari" />
            <TableRow label="PetPet Command" subLabel="by wolfieeee" />
            <TableRow
              label="KonoChan Commands"
              subLabel="by btmc727 & Rico040"
            />
            <TableRow label="FirstMessage Command" subLabel="by sapphire" />
            <TableRow label="Sysinfo Command" subLabel="by kmmiio99o" />
          </TableRowGroup>

          {/* About */}
          <TableRowGroup title="About">
            <TableRow
              label="All-In-One Commands"
              subLabel="A collection of useful commands"
            />
          </TableRowGroup>
        </Stack>
      </ScrollView>
    </View>
  );
}
