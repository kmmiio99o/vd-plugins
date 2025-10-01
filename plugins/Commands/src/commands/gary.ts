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
      // Determine which API to use based on switches
      let source = "gary"; // default
      if (storage.garySettings?.useCatAPI) source = "catapi";
      else if (storage.garySettings?.useMinkerAPI) source = "minker";
      else if (storage.garySettings?.useGooberAPI) source = "goober";
      
      const imageUrl = await getGaryUrl(source);

      if (!imageUrl) {
        // Silent fail - no error message
        return { type: 4 };
      }

      const fixNonce = Date.now().toString();
      MessageActions.sendMessage(ctx.channel.id, { content: imageUrl }, void 0, {
        nonce: fixNonce,
      });
      return { type: 4 };
    } catch (error) {
      console.error('[Gary] Error:', error);
      // Silent fail - no error message in chat
      return { type: 4 };
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
