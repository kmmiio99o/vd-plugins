import { findByProps, findByStoreName } from "@vendetta/metro";
import { themes } from "@vendetta/themes";
import { plugins } from "@vendetta/plugins";
import { storage } from "@vendetta/plugin";
import { alerts } from "@vendetta/ui";
import { validateChannelForCommand } from "../utils/messages";

import {
    ALERT,
    ARGS,
    EMPTY,
    FAILED_TO_SEND_LIST,
    JOINERS,
    NOTHING_TO_SEE,
    SPLIT_LARGE_MESSAGES_PLUGIN,
    STATUS
} from "../consts";

const MessageActions = findByProps('sendMessage', 'receiveMessage');
const Clyde = findByProps('sendBotMessage');

const maxMessageLength = findByStoreName('UserStore')
    .getCurrentUser()
    ?.premiumType === 2
        ? 4000
        : 2000;

const isSLMPluginInstalled = (installedPlugins: typeof plugins) =>
    Object.keys(installedPlugins)
        .includes(SPLIT_LARGE_MESSAGES_PLUGIN);
const isSLMPluginEnabled = (installedPlugins: typeof plugins) =>
    Object.values(installedPlugins)
        .find((plugin) => plugin.id == SPLIT_LARGE_MESSAGES_PLUGIN)
        ?.enabled;

const getArgumentValue = (args: any[]): any | false =>
    args
        .find((arg) => arg.name === ARGS.DETAILED)
        ?.value ?? false;

// Fixed addonAuthors function to handle malformed authors
const addonAuthors = (authors: any) => {
    // Handle cases where authors might be undefined, null, not an array, or contain invalid objects
    if (!authors) return "Unknown";
    if (!Array.isArray(authors)) return "Unknown";
    if (authors.length === 0) return "Unknown";

    return authors
        .filter(author => author && (typeof author === 'string' || (typeof author === 'object' && author.name)))
        .map(author => typeof author === 'string' ? author : (author.name || "Unknown"))
        .join(JOINERS.SEMICOL) || "Unknown";
};

const formatList = (list: string[]) =>
    list
        .join(JOINERS.NEW_LINE)
        .trimEnd();

const getListLength = (list: string[]) => formatList(list).length;

const sendList = async (channelID: string, list: string[]) => {
    // Use consistent nonce generation
    const nonce = (BigInt(Date.now()) * BigInt(4194304) + BigInt(Math.floor(Math.random() * 4194304))).toString();

    await MessageActions.sendMessage(channelID, {
        content: formatList(list)
    }, void 0, { nonce });
};

const baseListHeader = (type: 'Plugin' | 'Theme', length: number) => [
    `**My ${type} List | ${length} ${type}s**`,
    EMPTY
];

export async function themeList(args: any[], ctx: CommandContext) {
    const channelValidation = validateChannelForCommand(ctx);
    if (channelValidation) return channelValidation;

    try {
        const detailed = getArgumentValue(args);
        const alwaysDetailed = storage.themeListAlwaysDetailed ?? false;

        // Ensure themes is valid
        if (!themes || typeof themes !== 'object') {
            const channelID: string = ctx.channel.id;
            Clyde.sendBotMessage(channelID, "No themes found or themes not loaded yet.");
            return { type: 4 };
        }

        const objectValues = Object.values(themes);

        const channelID: string = ctx.channel.id;

        const themeList = baseListHeader('Theme', Object.keys(themes).length);

        if (objectValues.length) {
            for (const theme of objectValues) {
                if (!theme || typeof theme !== 'object') continue;

                const { selected, data, id } = theme;

                // Safe destructuring with fallbacks
                const name = data?.name || "Unknown Theme";
                const description = data?.description || "No description";
                const authors = data?.authors;

                if (detailed || alwaysDetailed)
                    themeList.push(
                        `> **Name**: ${name}`,
                        `> **Selected**: ${selected ? STATUS.SELECTED : STATUS.NOT_SELECTED}`,
                        `> **Description**: ${description}`,
                        `> **Authors**: ${addonAuthors(authors)}`,
                        `> **[Install!](${id || "unknown"})**`,
                        EMPTY
                    );
                else
                    themeList.push(`> ${selected ? STATUS.SELECTED : STATUS.NOT_SELECTED} **${name}** by ${addonAuthors(authors)}`);
            }
        } else
            themeList.push(NOTHING_TO_SEE);

        const isListTooLong = getListLength(themeList) > maxMessageLength;

        if (isListTooLong && !isSLMPluginInstalled(plugins))
            Clyde.sendBotMessage(channelID, FAILED_TO_SEND_LIST.SLM_NOT_INSTALLED);
        else if (isListTooLong && !isSLMPluginEnabled(plugins))
            Clyde.sendBotMessage(channelID, FAILED_TO_SEND_LIST.SLM_NOT_ENABLED);
        else {
            if (getListLength(themeList) > 2000)
                return alerts.showConfirmationAlert({
                    content: ALERT.CONTENT,
                    confirmText: ALERT.CONFIRM,
                    cancelText: ALERT.CANCEL,
                    onConfirm: async () => await sendList(channelID, themeList)
                });

            await sendList(channelID, themeList);
        }
    } catch (error) {
        console.error('[ThemeList] Error:', error);
        return { type: 4 };
    }
}

export async function pluginList(args: any[], ctx: CommandContext) {
    const channelValidation = validateChannelForCommand(ctx);
    if (channelValidation) return channelValidation;

    try {
        const detailed = getArgumentValue(args);
        const alwaysDetailed = storage.pluginListAlwaysDetailed ?? false;

        const channelID: string = ctx.channel.id;

        // Ensure plugins is valid
        if (!plugins || typeof plugins !== 'object') {
            Clyde.sendBotMessage(channelID, "No plugins found or plugins not loaded yet.");
            return { type: 4 };
        }

        const pluginList = baseListHeader('Plugin', Object.keys(plugins).length);

        for (const plugin of Object.values(plugins)) {
            if (!plugin || typeof plugin !== 'object') continue;

            const { enabled, manifest, id } = plugin;

            // Safe destructuring with fallbacks
            const name = manifest?.name || "Unknown Plugin";
            const description = manifest?.description || "No description";
            const authors = manifest?.authors;

            if (detailed || alwaysDetailed)
                pluginList.push(
                    `> **Name**: ${name}`,
                    `> **Status**: ${enabled ? STATUS.ENABLED : STATUS.DISABLED}`,
                    `> **Description**: ${description}`,
                    `> **Authors**: ${addonAuthors(authors)}`,
                    `> **[Install!](${id || "unknown"})**`,
                    EMPTY
                );
            else
                pluginList.push(`> ${enabled ? STATUS.ENABLED : STATUS.DISABLED} **${name}** by ${addonAuthors(authors)}`);
        }

        const isListTooLong = getListLength(pluginList) > maxMessageLength;

        if (isListTooLong && !isSLMPluginInstalled(plugins))
            Clyde.sendBotMessage(channelID, FAILED_TO_SEND_LIST.SLM_NOT_INSTALLED);
        else if (isListTooLong && !isSLMPluginEnabled(plugins))
            Clyde.sendBotMessage(channelID, FAILED_TO_SEND_LIST.SLM_NOT_ENABLED);
        else {
            if (getListLength(pluginList) > 2000)
                return alerts.showConfirmationAlert({
                    content: ALERT.CONTENT,
                    confirmText: ALERT.CONFIRM,
                    cancelText: ALERT.CANCEL,
                    onConfirm: async () => await sendList(channelID, pluginList)
                });

            await sendList(channelID, pluginList);
        }
    } catch (error) {
        console.error('[PluginList] Error:', error);
        return { type: 4 };
    }
}

// Export commands for your existing structure
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
  execute: pluginList,
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
  execute: themeList,
  applicationId: "-1", 
  inputType: 1,
  type: 1,
};
