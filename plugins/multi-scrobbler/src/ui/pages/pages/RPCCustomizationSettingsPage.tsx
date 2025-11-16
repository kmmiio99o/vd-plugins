// pages/RPCCustomizationSettingsPage.tsx
import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import {
  ScrollView,
  Stack,
  TableRowGroup,
  TableSwitchRow,
} from "./components/TableComponents";
import { plugin } from "@vendetta";
import Constants from "../../../constants";
import { getStorage, setStorage } from "../Settings";
import RPCPreview from "./components/RPCPreview";

export default function RPCCustomizationSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <RPCPreview />
      <Stack spacing={8}>
        <TableRowGroup title="RPC Display Options">
          <TableSwitchRow
            label="Show as Listening"
            subLabel="Display as 'Listening to' instead of 'Playing'"
            value={getStorage(
              "listeningTo",
              Constants.DEFAULT_SETTINGS.listeningTo,
            )}
            onValueChange={(value: boolean) => {
              setStorage("listeningTo", value);
              forceUpdate();
            }}
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
          <TableSwitchRow
            label="Show Timestamp"
            subLabel="Display track progress and duration"
            value={getStorage(
              "showTimestamp",
              Constants.DEFAULT_SETTINGS.showTimestamp,
            )}
            onValueChange={(value: boolean) => {
              setStorage("showTimestamp", value);
              forceUpdate();
            }}
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
