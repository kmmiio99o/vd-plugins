// pages/RPCCustomizationSettingsPage.tsx
import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import {
  ScrollView,
  Stack,
  TableRowGroup,
  TableSwitchRow,
  TableRow,
} from "./components/TableComponents";
import { plugin } from "@vendetta";
import Constants from "../../../constants";
import { getStorage, setStorage } from "../Settings";
import RPCPreview from "./components/RPCPreview";

export default function RPCCustomizationSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const isListeningTo = getStorage(
    "listeningTo",
    Constants.DEFAULT_SETTINGS.listeningTo,
  );
  const showTimestamp = getStorage(
    "showTimestamp",
    Constants.DEFAULT_SETTINGS.showTimestamp,
  );

  const handleListeningToChange = (value: boolean) => {
    setStorage("listeningTo", value);

    // If turning off "Show as Listening", also turn off "Show Timestamp"
    if (!value && showTimestamp) {
      setStorage("showTimestamp", false);
    }

    forceUpdate();
  };

  const handleTimestampChange = (value: boolean) => {
    // Only allow turning on timestamp if "Show as Listening" is enabled
    if (value && !isListeningTo) {
      return;
    }
    setStorage("showTimestamp", value);
    forceUpdate();
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <RPCPreview />
      <Stack spacing={8}>
        <TableRowGroup title="RPC Display Options">
          <TableSwitchRow
            label="Show as Listening"
            subLabel="Display as 'Listening to' instead of 'Playing'"
            value={isListeningTo}
            onValueChange={handleListeningToChange}
          />
          <TableSwitchRow
            label="Show Tooltip Text"
            subLabel="Show album name and track duration in Discord activity tooltip"
            value={getStorage("showLargeText", true)}
            onValueChange={(value: boolean) => {
              setStorage("showLargeText", value);
              forceUpdate();
            }}
          />

          {/* Warning row when timestamp is disabled */}
          {!isListeningTo && (
            <TableRow
              label="Timestamp Unavailable"
              subLabel="Enable 'Show as Listening' to use timestamp feature"
              disabled={true}
              dimmed={true}
            />
          )}

          <TableSwitchRow
            label="Show Timestamp"
            subLabel="Display track progress and duration"
            value={showTimestamp}
            onValueChange={handleTimestampChange}
            disabled={!isListeningTo}
            dimmed={!isListeningTo}
          />

          <TableSwitchRow
            label="Show Album in Tooltip"
            subLabel="Include album name in the tooltip text"
            value={getStorage("showAlbumInTooltip", true)}
            onValueChange={(value: boolean) => {
              setStorage("showAlbumInTooltip", value);
              forceUpdate();
            }}
          />
          <TableSwitchRow
            label="Show Duration in Tooltip"
            subLabel="Include track duration in the tooltip text"
            value={getStorage("showDurationInTooltip", true)}
            onValueChange={(value: boolean) => {
              setStorage("showDurationInTooltip", value);
              forceUpdate();
            }}
          />
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}
