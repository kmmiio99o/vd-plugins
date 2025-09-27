import { registerCommand } from "@vendetta/commands";
import { findByStoreName, findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { themes } from "@vendetta/themes";
import { plugins } from "@vendetta/plugins";
import { alerts } from "@vendetta/ui";
import settings from "./settings";

const UserStore = findByStoreName("UserStore");
const MessageActions = findByProps("sendMessage");
const Clyde = findByProps("sendBotMessage");

const maxMessageLength =
  UserStore.getCurrentUser()?.premiumType === 2 ? 4000 : 2000;

let commands: Array<() => void> = [];

// Constants
const STATUS = {
  ENABLED: "🟢",
  DISABLED: "🔴",
  SELECTED: "🔶",
  NOT_SELECTED: "🔷",
} as const;

const SPLIT_LARGE_MESSAGES_PLUGIN =
  "https://vd-plugins.github.io/proxy/actuallythesun.github.io/vendetta-plugins/SplitLargeMessages/";

// API Functions
const uselessFact = async () => {
  const response = await fetch(
    "https://uselessfacts.jsph.pl/api/v2/facts/random",
  );
  const resp = await response.json();
  return {
    text: resp["text"],
    source: resp["source"],
    language: resp["language"],
  };
};

const dogFact = async () => {
  const response = await fetch("https://dogapi.dog/api/v2/facts?limit=1");
  const resp = await response.json();
  return {
    text: resp["data"]["0"]["attributes"]["body"],
  };
};

const catFact = async () => {
  const response = await fetch("https://catfact.ninja/fact");
  const resp = await response.json();
  return {
    text: resp["fact"],
    length: resp["length"],
  };
};

async function getPetPetData(image: string) {
  const data = await fetch(
    `https://api.obamabot.me/v2/image/petpet?image=${image.replace("webp", "png")}`,
  );
  const body = await data.json();
  return body;
}

// Helper Functions
const formatFactResponse = (fact: { text: string; source?: string }) => {
  let response = fact.text;
  if (storage.factSettings?.includeCitation && fact.source) {
    response += `\n\nSource: ${fact.source}`;
  }
  return response;
};

const sendMessage = (
  channelId: string,
  content: string,
  replyToId?: string,
) => {
  const message = {
    content,
    ...(replyToId && storage.factSettings?.sendAsReply
      ? { messageReference: { messageId: replyToId } }
      : {}),
  };

  MessageActions.sendMessage(channelId, message, void 0, {
    nonce: (Date.now() * 4194304).toString(),
  });
  return { type: 4 }; // Acknowledge the command
};

const addonAuthors = (authors: Array<{ name: string }>) =>
  authors.map((author) => author.name).join(", ");

const formatList = (list: string[]) => list.join("\n").trimEnd();

const getListLength = (list: string[]) => formatList(list).length;

const sendList = async (channelID: string, list: string[]) => {
  MessageActions.sendMessage(channelID, { content: formatList(list) }, void 0, {
    nonce: (Date.now() * 4194304).toString(),
  });
};

const isSLMPluginInstalled = () =>
  Object.keys(plugins).includes(SPLIT_LARGE_MESSAGES_PLUGIN);

const isSLMPluginEnabled = () => {
  const plugin = Object.values(plugins).find(
    (p) => p.id === SPLIT_LARGE_MESSAGES_PLUGIN,
  );
  return plugin?.enabled ?? false;
};

// Command Handlers
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

  const isListTooLong = getListLength(themeList) > maxMessageLength;

  if (isListTooLong && !isSLMPluginInstalled()) {
    Clyde.sendBotMessage(
      ctx.channel.id,
      `Your list is too long to send it! Please install the [Split Large Messages](${SPLIT_LARGE_MESSAGES_PLUGIN}) plugin.`,
      void 0,
      { nonce: (Date.now() * 4194304).toString() },
    );
    return { type: 4 };
  } else if (isListTooLong && !isSLMPluginEnabled()) {
    Clyde.sendBotMessage(
      ctx.channel.id,
      "Your list is too long to send it! You have the Split Large Messages plugin installed, but it's not enabled!\n> Please enable it in order to send the list.",
      void 0,
      { nonce: (Date.now() * 4194304).toString() },
    );
    return { type: 4 };
  }

  if (getListLength(themeList) > 2000) {
    return alerts.showConfirmationAlert({
      content: "Your list is over than 2000 characters. Are you sure?",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => await sendList(ctx.channel.id, themeList),
    });
  }

  await sendList(ctx.channel.id, themeList);
  return { type: 4 };
}

async function handlePluginList(detailed: boolean, ctx: any) {
  const alwaysDetailed = storage.pluginListAlwaysDetailed ?? false;
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

  const isListTooLong = getListLength(pluginList) > maxMessageLength;

  if (isListTooLong && !isSLMPluginInstalled()) {
    Clyde.sendBotMessage(
      ctx.channel.id,
      `Your list is too long to send it! Please install the [Split Large Messages](${SPLIT_LARGE_MESSAGES_PLUGIN}) plugin.`,
      void 0,
      { nonce: (Date.now() * 4194304).toString() },
    );
    return { type: 4 };
  } else if (isListTooLong && !isSLMPluginEnabled()) {
    Clyde.sendBotMessage(
      ctx.channel.id,
      "Your list is too long to send it! You have the Split Large Messages plugin installed, but it's not enabled!\n> Please enable it in order to send the list.",
      void 0,
      { nonce: (Date.now() * 4194304).toString() },
    );
    return { type: 4 };
  }

  if (getListLength(pluginList) > 2000) {
    return alerts.showConfirmationAlert({
      content: "Your list is over than 2000 characters. Are you sure?",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => await sendList(ctx.channel.id, pluginList),
    });
  }

  await sendList(ctx.channel.id, pluginList);
  return { type: 4 };
}

// Register Commands
const registerCommands = () => {
  // Cat Facts Command
  commands.push(
    registerCommand({
      name: "catfact",
      displayName: "catfact",
      description: "Sends a random cat fact.",
      displayDescription: "Sends a random cat fact.",
      applicationId: "-1",
      inputType: 1,
      type: 1,
      execute: async (args, ctx) => {
        const fact = await catFact();
        return sendMessage(
          ctx.channel.id,
          formatFactResponse(fact),
          ctx.message?.id,
        );
      },
    }),
  );

  // Dog Facts Command
  commands.push(
    registerCommand({
      name: "dogfact",
      displayName: "dogfact",
      description: "Sends a dog fact.",
      displayDescription: "Sends a dog fact.",
      applicationId: "-1",
      inputType: 1,
      type: 1,
      execute: async (args, ctx) => {
        const fact = await dogFact();
        return sendMessage(
          ctx.channel.id,
          formatFactResponse(fact),
          ctx.message?.id,
        );
      },
    }),
  );

  // Useless Facts Command
  commands.push(
    registerCommand({
      name: "useless",
      displayName: "useless",
      description: "Sends a useless fact.",
      displayDescription: "Sends a useless fact.",
      applicationId: "-1",
      inputType: 1,
      type: 1,
      execute: async (args, ctx) => {
        const fact = await uselessFact();
        return sendMessage(
          ctx.channel.id,
          formatFactResponse(fact),
          ctx.message?.id,
        );
      },
    }),
  );

  // PetPet Command
  commands.push(
    registerCommand({
      name: "petpet",
      displayName: "petpet",
      description: "PetPet someone",
      displayDescription: "PetPet someone",
      options: [
        {
          name: "user",
          description: "The user(or their id) to be patted",
          type: 6,
          required: true,
          displayName: "user",
          displayDescription: "The user(or their id) to be patted",
        },
      ],
      execute: async (args, ctx) => {
        const user = await UserStore.getUser(args[0].value);
        const image = user.getAvatarURL(512);
        const data = await getPetPetData(image);
        return sendMessage(ctx.channel.id, data.url, ctx.message?.id);
      },
      applicationId: "-1",
      inputType: 1,
      type: 1,
    }),
  );

  // Plugin List Command
  commands.push(
    registerCommand({
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
          displayDescription:
            "Whether to send a list with detailed information.",
        },
      ],
      execute: async (args, ctx) => {
        const detailed =
          args.find((arg) => arg.name === "detailed")?.value ?? false;
        return handlePluginList(detailed, ctx);
      },
      applicationId: "-1",
      inputType: 1,
      type: 1,
    }),
  );

  // Theme List Command
  commands.push(
    registerCommand({
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
          displayDescription:
            "Whether to send a list with detailed information.",
        },
      ],
      execute: async (args, ctx) => {
        const detailed =
          args.find((arg) => arg.name === "detailed")?.value ?? false;
        return handleThemeList(detailed, ctx);
      },
      applicationId: "-1",
      inputType: 1,
      type: 1,
    }),
  );
};

// Initialize storage
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

export default {
  onLoad: () => {
    console.log("[All-In-One Commands] Plugin loaded!");
    registerCommands();
  },
  onUnload: () => {
    console.log("[All-In-One Commands] Plugin unloaded!");
    commands.forEach((unregister) => unregister());
    commands = [];
  },
  settings,
};
