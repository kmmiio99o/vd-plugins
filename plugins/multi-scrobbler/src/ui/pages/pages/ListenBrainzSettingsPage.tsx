import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { Linking } from "react-native";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import {
  ScrollView,
  Stack,
  TableRowGroup,
  TableRow,
  TextInput,
} from "./components/TableComponents";
import { plugin } from "@vendetta";
import { serviceFactory, getStorage, setStorage } from "../Settings";

export default function ListenBrainzSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const testConnection = async () => {
    showToast(
      "Testing ListenBrainz connection...",
      getAssetIDByName("ClockIcon"),
    );
    try {
      const isValid = await serviceFactory.testService("listenbrainz");
      if (isValid) {
        showToast(
          "✅ ListenBrainz connection successful!",
          getAssetIDByName("CheckIcon"),
        );
      } else {
        showToast(
          "❌ ListenBrainz connection failed",
          getAssetIDByName("XIcon"),
        );
      }
    } catch (error) {
      showToast("❌ Connection error", getAssetIDByName("XIcon"));
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Credentials">
          <Stack spacing={4}>
            <TextInput
              placeholder="ListenBrainz Username"
              value={getStorage("listenbrainzUsername")}
              onChange={(v: string) => {
                setStorage("listenbrainzUsername", v);
                forceUpdate();
              }}
              isClearable
            />
            <TextInput
              placeholder="ListenBrainz Token (for private profiles)"
              value={getStorage("listenbrainzToken")}
              onChange={(v: string) => {
                setStorage("listenbrainzToken", v);
                forceUpdate();
              }}
              secureTextEntry={true}
              isClearable
            />
          </Stack>
        </TableRowGroup>

        <TableRowGroup title="Actions">
          <TableRow
            label="Test Connection"
            subLabel="Verify your ListenBrainz credentials"
            trailing={<TableRow.Arrow />}
            onPress={testConnection}
          />
          <TableRow
            label="Get User Token"
            subLabel="Get your ListenBrainz user token at listenbrainz.org/settings/"
            trailing={<TableRow.Arrow />}
            onPress={async () => {
              try {
                await Linking.openURL("https://listenbrainz.org/settings/");
              } catch (error) {
                console.error(
                  "Failed to open ListenBrainz settings URL:",
                  error,
                );
                showToast(
                  "Failed to open web browser. Please visit: https://listenbrainz.org/settings/",
                  getAssetIDByName("XIcon"),
                );
              }
            }}
          />
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}
