import { React, ReactNative as RN } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import {
  ScrollView,
  Stack,
  TableRowGroup,
  TableRow,
  TextInput,
} from "./components/TableComponents";
import { plugin } from "@vendetta";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { getStorage, setStorage } from "../Settings";

export default function IgnoreListSettingsPage() {
  useProxy(plugin.storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const [newAppName, setNewAppName] = React.useState("");

  const addAppToIgnoreList = () => {
    if (!newAppName.trim()) {
      showToast("Please enter an app name", getAssetIDByName("Small"));
      return;
    }

    const ignoreList = getStorage("ignoreList", []);
    if (!ignoreList.includes(newAppName.trim())) {
      setStorage("ignoreList", [...ignoreList, newAppName.trim()]);
      setNewAppName("");
      forceUpdate();
      showToast("App added to ignore list", getAssetIDByName("Check"));
    } else {
      showToast("App already in ignore list", getAssetIDByName("Warning"));
    }
  };

  const removeAppFromIgnoreList = (appName: string) => {
    const ignoreList = getStorage("ignoreList", []);
    setStorage(
      "ignoreList",
      ignoreList.filter((app: string) => app !== appName),
    );
    forceUpdate();
    showToast("App removed from ignore list", getAssetIDByName("Check"));
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        <TableRowGroup title="Add App to Ignore">
          <Stack spacing={4}>
            <TextInput
              placeholder="Enter app name"
              value={newAppName}
              onChange={setNewAppName}
              isClearable
              onSubmitEditing={addAppToIgnoreList}
              returnKeyType="done"
            />
          </Stack>
        </TableRowGroup>

        <TableRowGroup>
          <TableRow
            label="Add to Ignore List"
            subLabel="Add the current app name to your ignore list"
            trailing={<TableRow.Arrow />}
            onPress={addAppToIgnoreList}
          />
        </TableRowGroup>

        {getStorage("ignoreList", []).length > 0 && (
          <TableRowGroup title="Ignored Apps">
            {getStorage("ignoreList", []).map(
              (appName: string, index: number) => (
                <TableRow
                  key={index}
                  label={appName}
                  trailing={
                    <RN.TouchableOpacity
                      onPress={() => removeAppFromIgnoreList(appName)}
                      style={{
                        padding: 8,
                        backgroundColor: "#ff4d4d",
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <RN.Image
                        source={getAssetIDByName("TrashIcon")}
                        style={{ width: 14, height: 14, tintColor: "#ffffff" }}
                      />
                    </RN.TouchableOpacity>
                  }
                />
              ),
            )}
          </TableRowGroup>
        )}

        <TableRowGroup title="About Ignore List">
          <TableRow
            label="How it Works"
            subLabel="When any app in your ignore list is active, your music status will be hidden"
          />
          <TableRow
            label="Detection"
            subLabel="Apps are detected by their Discord activity name"
          />
          <TableRow
            label="Examples"
            subLabel="Spotify, YouTube Music, Kizzy, Metrolist, echo"
          />
        </TableRowGroup>
      </Stack>
    </ScrollView>
  );
}
