import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";

const MessageActions = findByProps("sendMessage");

// Helper function to format fact response
const formatFactResponse = (fact: { text: string; source?: string }) => {
  let response = fact.text;
  if (storage.factSettings?.includeCitation && fact.source) {
    response += `\n\nSource: ${fact.source}`;
  }
  return response;
};

export const catFactCommand = {
  name: "catfact",
  displayName: "catfact",
  description: "Sends a random cat fact.",
  displayDescription: "Sends a random cat fact.",
  applicationId: "-1",
  inputType: 1,
  type: 1,
  execute: async (args: any, ctx: any) => {
    try {
      const fact = await catFact();
      const fixNonce = Date.now().toString();
      MessageActions.sendMessage(
        ctx.channel.id,
        { content: formatFactResponse(fact) },
        void 0,
        { nonce: fixNonce }
      );
      return { type: 4 };
    } catch (error) {
      console.error('[CatFact] Error:', error);
      // Silent fail - no error message in chat
      return { type: 4 };
    }
  },
};

export const dogFactCommand = {
  name: "dogfact",
  displayName: "dogfact",
  description: "Sends a dog fact.",
  displayDescription: "Sends a dog fact.",
  applicationId: "-1",
  inputType: 1,
  type: 1,
  execute: async (args: any, ctx: any) => {
    try {
      const fact = await dogFact();
      const fixNonce = Date.now().toString();
      MessageActions.sendMessage(
        ctx.channel.id,
        { content: formatFactResponse(fact) },
        void 0,
        { nonce: fixNonce }
      );
      return { type: 4 };
    } catch (error) {
      console.error('[DogFact] Error:', error);
      // Silent fail - no error message in chat
      return { type: 4 };
    }
  },
};

export const uselessFactCommand = {
  name: "useless",
  displayName: "useless",
  description: "Sends a useless fact.",
  displayDescription: "Sends a useless fact.",
  applicationId: "-1",
  inputType: 1,
  type: 1,
  execute: async (args: any, ctx: any) => {
    try {
      const fact = await uselessFact();
      const fixNonce = Date.now().toString();
      MessageActions.sendMessage(
        ctx.channel.id,
        { content: formatFactResponse(fact) },
        void 0,
        { nonce: fixNonce }
      );
      return { type: 4 };
    } catch (error) {
      console.error('[UselessFact] Error:', error);
      // Silent fail - no error message in chat
      return { type: 4 };
    }
  },
};

// Mock API functions since we don't have the actual implementations
async function catFact(): Promise<{ text: string; source?: string }> {
  return { text: "Cats can jump up to 6 times their height.", source: "catfacts.com" };
}

async function dogFact(): Promise<{ text: string; source?: string }> {
  return { text: "Dogs have an exceptional sense of smell.", source: "dogfacts.com" };
}

async function uselessFact(): Promise<{ text: string; source?: string }> {
  return { text: "Bananas are berries, but strawberries aren't.", source: "uselessfacts.com" };
}
