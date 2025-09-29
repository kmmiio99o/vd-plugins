import { plugins, themes } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { alerts } from "@vendetta/ui";
import { sendMessage, validateChannelForCommand } from "../utils/messages";

const SPLIT_LARGE_MESSAGES_PLUGIN = "github.com/fres621/vendetta-plugins";

const STATUS = {
  ENABLED: "✅",
  DISABLED: "❌",
  SELECTED: "✅",
  NOT_SELECTED: "❌",
};

// Helper functions
const addonAuthors = (authors: any[]) => {
  if (!authors || authors.length === 0) return "Unknown";
  return authors.map((author) => author.name).join(", ");
};

const formatList = (list: string[]) => list.join("\n");

const getListLength = (list: string[]) => formatList(list).length;

const isSLMPluginInstalled = () => {
  return Object.values(plugins).some((plugin) => plugin.id === SPLIT_LARGE_MESSAGES_PLUGIN);
};

const isSLMPluginEnabled = () => {
  const slmPlugin = Object.values(plugins).find((p) => p.id === SPLIT_LARGE_MESSAGES_PLUGIN);
  return slmPlugin?.enabled ?? false;
};

const showSplitPluginDialog = () => {
  return alerts.showConfirmationAlert({
    title: "Install Split Large Messages Plugin",
    content: "This list is over 2000 characters. Install the Split Large Messages plugin to send it.",
    confirmText: "Install",
    cancelText: "Cancel",
    onConfirm: () => {
      // Implementation to install plugin would go here
    },
  });
};

const showEnablePluginDialog = () => {
  return alerts.showConfirmationAlert({
    title: "Enable Split Large Messages Plugin",
    content: "This list is over 2000 characters. Enable the Split Large Messages plugin to send it.",
    confirmText: "Enable",
    cancelText: "Cancel",
    onConfirm: () => {
      const slmPlugin = Object.values(plugins).find((p) => p.id === SPLIT_LARGE_MESSAGES_PLUGIN);
      if (slmPlugin) {
        slmPlugin.enabled = true;
      }
    },
  });
};

// Command handlers
async function handlePluginList(detailed: boolean, ctx: any) {
  const alwaysDetailed = storage.listSettings?.pluginListAlwaysDetailed ?? false;
  const pluginList = [
    `**My Plugin List | ${Object.keys(plugins).length} Plugins**`,
    "",
  ];

  for (const plugin of Object.values(plugins)) {
    const { enabled, manifest, id } = plugin;
    const { name, description, authors } = manifest;

    if (detailed || alwaysDetailed) {
      pluginList.push(
        `> **Name**: ${name}`,
        `> **Status**: ${enabled ? STATUS.ENABLED : STATUS.DISABLED}`,
        `> **Description**: ${description}`,
        `> **Authors**: ${addonAuthors(authors)}`,
        `> **[Install!](${id})**`,
        "",
      );
    } else {
      pluginList.push(
        `> ${enabled ? STATUS.ENABLED : STATUS.DISABLED} **${name}** by ${addonAuthors(authors)}`,
      );
    }
  }

  if (getListLength(pluginList) > 2000) {
    if (!isSLMPluginInstalled()) {
      return showSplitPluginDialog();
    }
    if (!isSLMPluginEnabled()) {
      return showEnablePluginDialog();
    }

    return alerts.showConfirmationAlert({
      title: "Large Message",
      content: "This list is over 2000 characters. Send anyway?",
      confirmText: "Send",
      cancelText: "Cancel",
      onConfirm: () => sendMessage(ctx.channel.id, formatList(pluginList)),
    });
  }

  return sendMessage(ctx.channel.id, formatList(pluginList));
}

async function handleThemeList(detailed: boolean, ctx: any) {
  const alwaysDetailed = storage.themeListAlwaysDetailed ?? false;
  const themeList = [
    `**My Theme List | ${Object.keys(themes).length} Themes**`,
    "",
  ];

  const themeValues = Object.values(themes);
  if (themeValues.length) {
    for (const theme of themeValues) {
      const { selected, data, id } = theme;
      const { name, description, authors } = data;

      if (detailed || alwaysDetailed) {
        themeList.push(
          `> **Name**: ${name}`,
          `> **Selected**: ${selected ? STATUS.SELECTED : STATUS.NOT_SELECTED}`,
          `> **Description**: ${description}`,
          `> **Authors**: ${addonAuthors(authors)}`,
          `> **[Install!](${id})**`,
          "",
        );
      } else {
        themeList.push(
          `> ${selected ? STATUS.SELECTED : STATUS.NOT_SELECTED} **${name}** by ${addonAuthors(authors)}`,
        );
      }
    }
  } else {
    themeList.push("Nothing to see here, huh...");
  }

  if (getListLength(themeList) > 2000) {
    if (!isSLMPluginInstalled()) {
      return showSplitPluginDialog();
    }
    if (!isSLMPluginEnabled()) {
      return showEnablePluginDialog();
    }

    return alerts.showConfirmationAlert({
      title: "Large Message",
      content: "This list is over 2000 characters. Send anyway?",
      confirmText: "Send",
      cancelText: "Cancel",
      onConfirm: () => sendMessage(ctx.channel.id, formatList(themeList)),
    });
  }

  return sendMessage(ctx.channel.id, formatList(themeList));
}

export const pluginListCommand = {
  name: "plugin-list",
  displayName: "plugin list",
  description: "Send your plugin list to the current channel",
  displayDescription: "Send your plugin list to the current channel",
  options: [
    {
      name: "detailed",
      description: "Whether to send a list with detailed information.",
      type: 5,
      required: false,
      displayName: "detailed",
      displayDescription: "Whether to send a list with detailed information.",
    },
  ],
  execute: async (args: any, ctx: any) => {
    const channelValidation = validateChannelForCommand(ctx);
    if (channelValidation) return channelValidation;

    try {
      const detailed = args.find((arg: any) => arg.name === "detailed")?.value ?? false;
      return handlePluginList(detailed, ctx);
    } catch (error) {
      console.error('[PluginList] Error:', error);
      // Silent fail - no error message in chat
      return { type: 4 };
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};

export const themeListCommand = {
  name: "theme-list",
  displayName: "theme list",
  description: "Send your theme list to the current channel",
  displayDescription: "Send your theme list to the current channel",
  options: [
    {
      name: "detailed",
      description: "Whether to send a list with detailed information.",
      type: 5,
      required: false,
      displayName: "detailed",
      displayDescription: "Whether to send a list with detailed information.",
    },
  ],
  execute: async (args: any, ctx: any) => {
    const channelValidation = validateChannelForCommand(ctx);
    if (channelValidation) return channelValidation;

    try {
      const detailed = args.find((arg: any) => arg.name === "detailed")?.value ?? false;
      return handleThemeList(detailed, ctx);
    } catch (error) {
      console.error('[ThemeList] Error:', error);
      // Silent fail - no error message in chat
      return { type: 4 };
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
