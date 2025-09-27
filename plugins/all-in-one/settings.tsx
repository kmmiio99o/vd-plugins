import { ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { ErrorBoundary, Forms } from "@vendetta/ui/components";

const { FormSwitchRow, FormIcon, FormSection, FormDivider } = Forms;
const Icons = {
    List: getAssetIDByName('ic_list'),
    Copy: getAssetIDByName('ic_copy_message_link'),
    Settings: getAssetIDByName('ic_settings'),
    Fact: getAssetIDByName('ic_info')
};

// Initialize storage with default values if not set
if (!storage.factSettings) {
    storage.factSettings = {
        sendAsReply: true,
        includeCitation: false
    };
}

if (!storage.listSettings) {
    storage.listSettings = {
        pluginListAlwaysDetailed: false,
        themeListAlwaysDetailed: false
    };
}

export default () => {
    useProxy(storage);

    return (
        <ErrorBoundary>
            <ReactNative.ScrollView style={{ flex: 1 }}>
                {/* Plugin List Settings */}
                <FormSection title="Plugin List Settings" titleStyleType="no_border">
                    <FormSwitchRow
                        label="Always send detailed plugin list"
                        subLabel='Always use detailed mode when listing plugins'
                        leading={<FormIcon source={Icons.List} />}
                        onValueChange={(value: boolean) => {
                            storage.listSettings.pluginListAlwaysDetailed = value;
                        }}
                        value={storage.listSettings.pluginListAlwaysDetailed}
                    />
                    <FormDivider />
                    <FormSwitchRow
                        label="Always send detailed theme list"
                        subLabel='Always use detailed mode when listing themes'
                        leading={<FormIcon source={Icons.List} />}
                        onValueChange={(value: boolean) => {
                            storage.listSettings.themeListAlwaysDetailed = value;
                        }}
                        value={storage.listSettings.themeListAlwaysDetailed}
                    />
                </FormSection>

                {/* Fact Command Settings */}
                <FormSection title="Fact Commands Settings" titleStyleType="no_border">
                    <FormSwitchRow
                        label="Send as Reply"
                        subLabel='Send facts as a reply to the command message'
                        leading={<FormIcon source={Icons.Copy} />}
                        onValueChange={(value: boolean) => {
                            storage.factSettings.sendAsReply = value;
                        }}
                        value={storage.factSettings.sendAsReply}
                    />
                    <FormDivider />
                    <FormSwitchRow
                        label="Include Source Citation"
                        subLabel='Include the source of the fact when available'
                        leading={<FormIcon source={Icons.Fact} />}
                        onValueChange={(value: boolean) => {
                            storage.factSettings.includeCitation = value;
                        }}
                        value={storage.factSettings.includeCitation}
                    />
                </FormSection>
            </ReactNative.ScrollView>
        </ErrorBoundary>
    );
};
