import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import {
  ScrollView,
  Stack,
  TableRowGroup,
  TableRow,
  TableSwitchRow,
} from "./components/TableComponents";
import { plugin } from "@vendetta";
import Constants from "../../../constants";
import { getStorage, setStorage } from "../Settings";

export default function LoggingSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Logging Options">
          <TableSwitchRow
            label="Verbose Logging"
            subLabel="Enable detailed console logging for debugging"
            value={getStorage(
              "verboseLogging",
              Constants.DEFAULT_SETTINGS.verboseLogging,
            )}
            onValueChange={(value: boolean) => {
              setStorage("verboseLogging", value);
              forceUpdate();
            }}
          />
        </TableRowGroup>

        <TableRowGroup title="Debug Information">
          <TableRow
            label="Console Logging"
            subLabel="Logs are written to the browser/app console when verbose is enabled"
          />
          <TableRow
            label="Error Tracking"
            subLabel="Connection errors and API failures are automatically logged"
          />
        </TableRowGroup>

        <TableRowGroup title="Log Information">
          <TableRow
            label="API Calls"
            subLabel="All API requests are logged when verbose is enabled"
          />
          <TableRow
            label="Track Updates"
            subLabel="Song changes and RPC updates are logged"
          />
          <TableRow
            label="Error Details"
            subLabel="Connection errors and retries are logged"
          />
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}
