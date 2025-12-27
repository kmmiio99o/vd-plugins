import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import {
  ScrollView,
  Stack,
  TableRowGroup,
  TableCheckboxRow,
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

  const handleListeningToChange = () => {
    const newValue = !isListeningTo;
    setStorage("listeningTo", newValue);

    if (!newValue && showTimestamp) {
      setStorage("showTimestamp", false);
    }

    forceUpdate();
  };

  const handleTimestampChange = () => {
    if (!isListeningTo) return;
    setStorage("showTimestamp", !showTimestamp);
    forceUpdate();
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <RPCPreview />
      <Stack spacing={8}>
        <TableRowGroup title="RPC Display Options">
          <TableCheckboxRow
            label="Show as Listening"
            subLabel="Display as 'Listening to' instead of 'Playing'"
            checked={isListeningTo}
            onPress={handleListeningToChange}
          />

          <TableCheckboxRow
            label="Show Tooltip Text"
            subLabel="Show album name and track duration in Discord activity tooltip"
            checked={getStorage("showLargeText", true)}
            onPress={() => {
              const current = getStorage("showLargeText", true);
              setStorage("showLargeText", !current);
              forceUpdate();
            }}
          />

          {!isListeningTo && (
            <TableRow
              label="Timestamp Unavailable"
              subLabel="Enable 'Show as Listening' to use timestamp feature"
              disabled={true}
              dimmed={true}
            />
          )}

          <TableCheckboxRow
            label="Show Timestamp"
            subLabel="Display track progress and duration"
            checked={showTimestamp}
            onPress={handleTimestampChange}
            disabled={!isListeningTo}
          />

          <TableCheckboxRow
            label="Show Album in Tooltip"
            subLabel="Include album name in the tooltip text"
            checked={getStorage("showAlbumInTooltip", true)}
            onPress={() => {
              const current = getStorage("showAlbumInTooltip", true);
              setStorage("showAlbumInTooltip", !current);
              forceUpdate();
            }}
          />

          <TableCheckboxRow
            label="Show Duration in Tooltip"
            subLabel="Include track duration in the tooltip text"
            checked={getStorage("showDurationInTooltip", true)}
            onPress={() => {
              const current = getStorage("showDurationInTooltip", true);
              setStorage("showDurationInTooltip", !current);
              forceUpdate();
            }}
          />
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}
