import { plugin } from "@vendetta";
import { React, NavigationNative } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { after } from "@vendetta/patcher";
import { Forms } from "@vendetta/ui/components";
import { findInReactTree } from "@vendetta/utils";
import { findByProps } from "@vendetta/metro";
import { logger } from "@vendetta";
import Settings from "./ui/pages/Settings";

const { FormSection, FormRow } = Forms;
const { TableRowIcon } = findByProps("TableRowIcon");
const bunny = window.bunny;
declare global {
  interface Window {
    bunny: any;
  }
}

const tabsNavigationRef = bunny?.metro?.findByPropsLazy("getRootNavigationRef");
const settingConstants = bunny?.metro?.findByPropsLazy(
  "SETTING_RENDERER_CONFIG",
);
const SettingsOverviewScreen = bunny?.metro?.findByNameLazy(
  "SettingsOverviewScreen",
  false,
);

function Section({ tabs }) {
  const navigation = NavigationNative.useNavigation();

  return React.createElement(FormRow, {
    label: tabs.title(),
    leading: React.createElement(FormRow.Icon, { source: tabs.icon }),
    trailing: React.createElement(React.Fragment, {}, [
      tabs.trailing ? tabs.trailing() : null,
      React.createElement(FormRow.Arrow, { key: "arrow" }),
    ]),
    onPress: () => {
      const Component = tabs.page;
      navigation.navigate("VendettaCustomPage", {
        title: tabs.title(),
        render: () => React.createElement(Component),
      });
    },
  });
}

function patchPanelUI(tabs, patches) {
  try {
    patches.push(
      after(
        "default",
        bunny?.metro?.findByNameLazy("UserSettingsOverviewWrapper", false),
        (_, ret) => {
          const UserSettingsOverview = findInReactTree(
            ret.props.children,
            (n) => n.type?.name === "UserSettingsOverview",
          );

          if (UserSettingsOverview) {
            patches.push(
              after(
                "render",
                UserSettingsOverview.type.prototype,
                (_args, res) => {
                  const sections = findInReactTree(
                    res.props.children,
                    (n) => n?.children?.[1]?.type === FormSection,
                  )?.children;

                  if (sections) {
                    const index = sections.findIndex((c) =>
                      ["BILLING_SETTINGS", "PREMIUM_SETTINGS"].includes(
                        c?.props?.label,
                      ),
                    );

                    sections.splice(
                      -~index || 4,
                      0,
                      React.createElement(Section, { key: tabs.key, tabs }),
                    );
                  }
                },
              ),
            );
          }
        },
        true,
      ),
    );
  } catch (error) {
    logger.info("Panel UI patch failed graciously 💔", error);
  }
}

function patchTabsUI(tabs, patches) {
  if (!settingConstants || !SettingsOverviewScreen || !tabsNavigationRef) {
    console.warn("[LastFm] Missing required constants for tabs UI patch");
    return;
  }

  const row = {};
  row[tabs.key] = {
    type: "pressable",
    title: tabs.title,
    icon: tabs.icon,
    IconComponent:
      tabs.icon &&
      (() => {
        const actualIconSource =
          typeof tabs.icon === "object" && tabs.icon.uri !== undefined
            ? tabs.icon.uri
            : tabs.icon;
        return React.createElement(TableRowIcon, { source: actualIconSource });
      }),
    usePredicate: tabs.predicate,
    useTrailing: tabs.trailing,
    onPress: () => {
      const navigation = tabsNavigationRef.getRootNavigationRef();
      const Component = tabs.page;

      navigation.navigate("VendettaCustomPage", {
        title: tabs.title(),
        render: () => React.createElement(Component),
      });
    },
    withArrow: true,
  };

  let rendererConfigValue = settingConstants.SETTING_RENDERER_CONFIG;

  Object.defineProperty(settingConstants, "SETTING_RENDERER_CONFIG", {
    enumerable: true,
    configurable: true,
    get: () => ({
      ...rendererConfigValue,
      ...row,
    }),
    set: (v) => (rendererConfigValue = v),
  });

  const firstRender = Symbol("LastFm-pinToSettings");

  patches.push(
    after("default", SettingsOverviewScreen, (args, ret) => {
      if (!(args[0] as { [key: symbol]: boolean })[firstRender]) {
        (args[0] as { [key: symbol]: boolean })[firstRender] = true;

        const { sections } = findInReactTree(
          ret,
          (i) => i.props?.sections,
        ).props;

        const section = sections?.find((x) =>
          ["Bunny", "Revenge", "Kettu", "Vencore", "ShiggyCord"].some(
            (mod) => x.label === mod && x.title === mod,
          ),
        );

        if (section?.settings) {
          section.settings = [...section.settings, tabs.key];
        }
      }
    }),
  );
}

function patchSettingsPin(tabs) {
  const patches = [];

  let disabled = false;

  const realPredicate = tabs.predicate || (() => true);
  tabs.predicate = () => (disabled ? false : realPredicate());

  patchPanelUI(tabs, patches);
  patchTabsUI(tabs, patches);
  patches.push(() => (disabled = true));

  return () => {
    for (const x of patches) {
      x();
    }
  };
}

export default function patchSidebar() {
  // Check if sidebar option is enabled in plugin settings
  if (!plugin.storage.addToSidebar) {
    console.log("[Multi Scrobbler] Sidebar disabled in settings");
    return () => {};
  }

  console.log(
    "[Multi Scrobbler] Patching sidebar using custom patchSettingsPin...",
  );

  try {
    const unpatch = patchSettingsPin({
      key: "LastFmScrobbler",
      icon: getAssetIDByName("MusicIcon"),
      title: () => "Multi Scrobbler",
      predicate: () => plugin.storage.addToSidebar === true,
      page: Settings,
    });

    console.log("[Multi Scrobbler] Successfully patched sidebar");
    return unpatch;
  } catch (error) {
    console.error("[Multi Scrobbler] Failed to patch sidebar:", error);
    return () => {};
  }
}
