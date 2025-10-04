import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { catFact, dogFact, uselessFact } from "../utils/api";

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
            console.error("[CatFact] Error:", error);
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
            console.error("[DogFact] Error:", error);
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
            console.error("[UselessFact] Error:", error);
            // Silent fail - no error message in chat
            return { type: 4 };
        }
    },
};
