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

export default function LastFmSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const testConnection = async () => {
    showToast("Testing Last.fm connection...", getAssetIDByName("ClockIcon"));
    try {
      const isValid = await serviceFactory.testService("lastfm");
      if (isValid) {
        showToast(
          "✅ Last.fm connection successful!",
          getAssetIDByName("CheckIcon"),
        );
      } else {
        showToast("❌ Last.fm connection failed", getAssetIDByName("XIcon"));
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
              placeholder="Last.fm Username"
              value={getStorage("username")}
              onChange={(v: string) => {
                setStorage("username", v);
                forceUpdate();
              }}
              isClearable
            />
            <TextInput
              placeholder="Last.fm API Key"
              value={getStorage("apiKey")}
              onChange={(v: string) => {
                setStorage("apiKey", v);
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
            subLabel="Verify your Last.fm credentials"
            trailing={<TableRow.Arrow />}
            onPress={testConnection}
          />
          <TableRow
            label="Get API Key"
            subLabel="Create a Last.fm API key at last.fm/api/account/create"
            trailing={<TableRow.Arrow />}
            onPress={async () => {
              try {
                await Linking.openURL("https://www.last.fm/api/account/create");
              } catch (error) {
                console.error("Failed to open Last.fm API URL:", error);
                showToast(
                  "Failed to open web browser. Please visit: https://www.last.fm/api/account/create",
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
