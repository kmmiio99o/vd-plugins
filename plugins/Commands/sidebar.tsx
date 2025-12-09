import { storage } from "@vendetta/plugin";
import { React, NavigationNative } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { after } from "@vendetta/patcher";
import { Forms } from "@vendetta/ui/components";
import { findInReactTree } from "@vendetta/utils";
import { findByProps } from "@vendetta/metro";
import { logger } from "@vendetta";
import Settings from "./settings/settings";

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
const createListModule = bunny?.metro?.findByPropsLazy("createList");
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
        bunny?.metro?.findByPropsLazy(["renderTitle", "sections"], false),
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
  if (!settingConstants || !tabsNavigationRef) {
    console.warn(
      "[Commands Plugin] Missing required constants for tabs UI patch",
    );
    return;
  }

  const row = {
    [tabs.key]: {
      type: "pressable",
      title: tabs.title,
      icon: tabs.icon,
      IconComponent:
        tabs.icon &&
        (() => React.createElement(TableRowIcon, { source: tabs.icon })),
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
    },
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

  const firstRender = Symbol("pinToSettings meow meow");

  try {
    if (!createListModule) return;
    patches.push(
      after("createList", createListModule, function (args, ret) {
        if (!args[0][firstRender]) {
          args[0][firstRender] = true;

          const [config] = args;
          const sections = config.sections;

          const section = sections?.find((x: any) =>
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
  } catch {
    if (!SettingsOverviewScreen) return;
    patches.push(
      after("default", SettingsOverviewScreen, (args, ret) => {
        if (!args[0][firstRender]) {
          args[0][firstRender] = true;

          const { sections } = findInReactTree(
            ret,
            (i) => i.props?.sections,
          ).props;
          const section = sections?.find((x: any) =>
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
  // Check if sidebar is enabled in storage
  if (storage.sidebarEnabled === false) {
    console.log("[Commands Plugin] Sidebar disabled in settings");
    return () => {};
  }

  console.log("[Commands Plugin] Patching sidebar...");

  try {
    const unpatch = patchSettingsPin({
      key: "CommandsPlugin",
      icon: getAssetIDByName("SettingsIcon"),
      title: () => "Commands",
      predicate: () => storage.sidebarEnabled !== false,
      page: Settings,
    });

    console.log("[Commands Plugin] Successfully patched sidebar");
    return unpatch;
  } catch (error) {
    console.error("[Commands Plugin] Failed to patch sidebar:", error);
    return () => {};
  }
}
