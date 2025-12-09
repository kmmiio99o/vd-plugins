import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative as RN, stylesheet } from "@vendetta/metro/common";
import { NavigationNative } from "@vendetta/metro/common";
import { semanticColors } from "@vendetta/ui";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import BetterTableRowGroup from "../components/BetterTableRowGroup";
import NekosLifeCategoriesPage from "./NekosLifeCategoriesPage";

const { FormSwitchRow, FormRow } = Forms;

export default function AliucordPage() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const navigation = NavigationNative.useNavigation();

  return (
    <RN.ScrollView
      style={{ flex: 1, backgroundColor: semanticColors.BACKGROUND_PRIMARY }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 16,
        maxWidth: "100%",
      }}
    >
      <BetterTableRowGroup
        title="IP Commands"
        icon={getAssetIDByName("GlobeEarthIcon")}
      >
        <FormSwitchRow
          label="/ip"
          subLabel="Get your current IP address"
          leading={<FormRow.Icon source={getAssetIDByName("GlobeEarthIcon")} />}
          value={storage.enabledCommands.ip}
          onValueChange={(v) => {
            storage.enabledCommands.ip = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
      </BetterTableRowGroup>

      <BetterTableRowGroup
        title="NekosLife Commands"
        icon={getAssetIDByName("ImageIcon")}
      >
        <FormSwitchRow
          label="/nekoslife"
          subLabel="Get images/gifs from nekos.life"
          leading={<FormRow.Icon source={getAssetIDByName("ImageIcon")} />}
          value={storage.enabledCommands.nekoslife}
          onValueChange={(v) => {
            storage.enabledCommands.nekoslife = v;
            storage.pendingRestart = true;
            forceUpdate();
          }}
        />
        <FormRow
          label="View Categories"
          subLabel="See all 16 available categories"
          leading={<FormRow.Icon source={getAssetIDByName("BookOpenIcon")} />}
          trailing={<FormRow.Arrow />}
          onPress={() =>
            navigation.push("VendettaCustomPage", {
              title: "NekosLife Categories",
              render: NekosLifeCategoriesPage,
            })
          }
        />
      </BetterTableRowGroup>

      <RN.View style={{ height: 32 }} />
    </RN.ScrollView>
  );
}
