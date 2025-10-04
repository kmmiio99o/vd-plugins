import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { getGaryUrl } from "../utils/api";

const MessageActions = findByProps("sendMessage");

export const garyCommand = {
    name: "gary",
    displayName: "gary",
    description: "Send a random Gary image to the channel.",
    displayDescription: "Send a random Gary image to the channel.",
    options: [],
    execute: async (args: any, ctx: any) => {
        try {
            // Ensure garySettings exists and get the source
            if (!storage.garySettings) {
                storage.garySettings = { imageSource: "gary" };
            }
      
            const source = storage.garySettings.imageSource || "gary";
            console.log(`[Gary Command] Using image source: ${source}`); // Debug log
      
            const imageUrl = await getGaryUrl(source);

            if (!imageUrl) {
                console.log("[Gary Command] No image URL received");
                // Silent fail - no error message
                return { type: 4 };
            }

            console.log(`[Gary Command] Sending image: ${imageUrl}`); // Debug log
            const fixNonce = Date.now().toString();
            MessageActions.sendMessage(ctx.channel.id, { content: imageUrl }, void 0, {
                nonce: fixNonce,
            });
            return { type: 4 };
        } catch (error) {
            console.error("[Gary] Error:", error);
            // Silent fail - no error message in chat
            return { type: 4 };
        }
    },
    applicationId: "-1",
    inputType: 1,
    type: 1,
};
