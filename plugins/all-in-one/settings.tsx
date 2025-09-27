import { ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { ErrorBoundary, Forms } from "@vendetta/ui/components";

const { FormSwitchRow, FormIcon, FormSection, FormDivider } = Forms;

const Icons = {
  List: getAssetIDByName("ic_list"),
  Message: getAssetIDByName("ic_message"),
  Copy: getAssetIDByName("ic_copy_message_link"),
  Info: getAssetIDByName("ic_info"),
  Theme: getAssetIDByName("ic_theme"),
  Plugin: getAssetIDByName("ic_plugins"),
};

export default () => {
  useProxy(storage);

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

  return (
    <ErrorBoundary>
      <ReactNative.ScrollView style={{ flex: 1 }}>
        {/* Fact Commands Settings */}
        <FormSection title="Fact Commands" titleStyleType="no_border">
          <FormSwitchRow
            label="Send as Reply"
            subLabel="Send facts as a reply to the command message"
            leading={<FormIcon source={Icons.Message} />}
            onValueChange={(value: boolean) => {
              storage.factSettings.sendAsReply = value;
            }}
            value={storage.factSettings.sendAsReply}
          />
          <FormDivider />
          <FormSwitchRow
            label="Include Source Citation"
            subLabel="Include the source of facts when available"
            leading={<FormIcon source={Icons.Info} />}
            onValueChange={(value: boolean) => {
              storage.factSettings.includeCitation = value;
            }}
            value={storage.factSettings.includeCitation}
          />
        </FormSection>

        {/* Plugin List Settings */}
        <FormSection title="Plugin List" titleStyleType="no_border">
          <FormSwitchRow
            label="Always Send Detailed List"
            subLabel="Always use detailed mode when listing plugins"
            leading={<FormIcon source={Icons.Plugin} />}
            onValueChange={(value: boolean) => {
              storage.listSettings.pluginListAlwaysDetailed = value;
            }}
            value={storage.listSettings.pluginListAlwaysDetailed}
          />
        </FormSection>

        {/* Theme List Settings */}
        <FormSection title="Theme List" titleStyleType="no_border">
          <FormSwitchRow
            label="Always Send Detailed List"
            subLabel="Always use detailed mode when listing themes"
            leading={<FormIcon source={Icons.Theme} />}
            onValueChange={(value: boolean) => {
              storage.listSettings.themeListAlwaysDetailed = value;
            }}
            value={storage.listSettings.themeListAlwaysDetailed}
          />
        </FormSection>
      </ReactNative.ScrollView>
    </ErrorBoundary>
  );
};
