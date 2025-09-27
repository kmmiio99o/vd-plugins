import { registerCommand } from "@vendetta/commands";
import { findByStoreName, findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import settings from "./settings";

const UserStore = findByStoreName("UserStore");
const MessageActions = findByProps("sendMessage");

let commands: Array<() => void> = [];

// Initialize storage with default values if not set
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

// Helper function to format fact response
const formatFactResponse = (fact: { text: string; source?: string }) => {
  let response = fact.text;
  if (storage.factSettings.includeCitation && fact.source) {
    response += `\n\nSource: ${fact.source}`;
  }
  return response;
};

// Helper function to send message
const sendMessage = (
  channelId: string,
  content: string,
  replyToId?: string,
) => {
  const fixNonce = Date.now().toString();
  const message = {
    content,
    ...(replyToId && storage.factSettings.sendAsReply
      ? { messageReference: { messageId: replyToId } }
      : {}),
  };
  MessageActions.sendMessage(channelId, message, undefined, {
    nonce: fixNonce,
  });
  return { type: 4 }; // Acknowledge the command
};

// Command Definitions
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
      displayDescription: "PetPet someone",
      description: "PetPet someone",
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
      execute: async (args: any, ctx: any) => {
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
};

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
