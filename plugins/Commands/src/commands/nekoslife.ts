import { findByProps } from "@vendetta/metro";
import { alerts } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

const MessageActions = findByProps("sendMessage");
const messageUtil = findByProps("sendBotMessage", "sendMessage", "receiveMessage");

interface NekosLifeResult {
  url: string;
}

const categories = [
  { name: "anal", value: "anal" },
  { name: "avatar", value: "avatar" },
  { name: "boobs", value: "boobs" },
  { name: "blowjob image", value: "blowjob" },
  { name: "blowjob gif", value: "bj" },
  { name: "classic", value: "classic" },
  { name: "cuddle", value: "cuddle" },
  { name: "cum", value: "cum" },
  { name: "cum jpg", value: "cum_jpg" },
  { name: "ero", value: "ero" },
  { name: "ero feet", value: "erofeet" },
  { name: "ero kemo", value: "erokemo" },
  { name: "ero kitsune", value: "erok" },
  { name: "ero neko", value: "eron" },
  { name: "ero yuri", value: "eroyuri" },
  { name: "femdom", value: "femdom" },
  { name: "feet", value: "feet" },
  { name: "feet gif", value: "feetg" },
  { name: "fox girl", value: "fox_girl" },
  { name: "futanari", value: "futanari" },
  { name: "gasm", value: "gasm" },
  { name: "gecg", value: "gecg" },
  { name: "kemonomimi", value: "kemonomimi" },
  { name: "kiss", value: "kiss" },
  { name: "kuni", value: "kuni" },
  { name: "hentai", value: "hentai" },
  { name: "holo", value: "holo" },
  { name: "holo ero", value: "holoero" },
  { name: "holo lewd", value: "hololewd" },
  { name: "lesbian", value: "les" },
  { name: "lewd", value: "lewd" },
  { name: "lewd kemo", value: "lewdkemo" },
  { name: "lewd kitsune", value: "lewdk" },
  { name: "neko", value: "neko" },
  { name: "neko gif", value: "ngif" },
  { name: "neko gif nsfw", value: "nsfw_neko_gif" },
  { name: "nsfw avatar", value: "nsfw_avatar" },
  { name: "pussy", value: "pussy" },
  { name: "pussy jpg", value: "pussy_jpg" },
  { name: "pwank", value: "pwankg" },
  { name: "random hentai gif", value: "Random_hentai_gif" },
  { name: "small boobs", value: "smallboobs" },
  { name: "smug", value: "smug" },
  { name: "solo", value: "solo" },
  { name: "solo gif", value: "solog" },
  { name: "spank", value: "spank" },
  { name: "tits", value: "tits" },
  { name: "tickle", value: "tickle" },
  { name: "trap", value: "trap" },
  { name: "waifu", value: "waifu" },
  { name: "wallpaper", value: "wallpaper" },
  { name: "woof", value: "woof" },
  { name: "yuri", value: "yuri" }
];

const limitOptions = [
  { name: "1", value: "1" },
  { name: "2", value: "2" },
  { name: "5", value: "5" },
  { name: "8", value: "8" },
  { name: "10", value: "10" }
];

async function fetchNekosLifeImages(category: string, count: number): Promise<string[]> {
  const urls: string[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      // Add delay between requests to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const response = await fetch(`https://nekos.life/api/v2/img/${category}`);
      if (!response.ok) {
        console.error(`[NekosLife] API request failed: ${response.status}`);
        continue;
      }
      
      const data: NekosLifeResult = await response.json();
      if (data.url) {
        urls.push(data.url);
      }
    } catch (error) {
      console.error(`[NekosLife] Error fetching image ${i + 1}:`, error);
    }
  }
  
  return urls;
}

function isNsfwCategory(category: string): boolean {
  if (!category || typeof category !== 'string') return false;
  
  const nsfwCategories = [
    "anal", "boobs", "blowjob", "bj", "cum", "cum_jpg", "ero", "erofeet", 
    "erokemo", "erok", "eron", "eroyuri", "femdom", "feet", "feetg", 
    "futanari", "gasm", "kuni", "hentai", "holoero", "hololewd", "les", 
    "lewd", "lewdkemo", "lewdk", "nsfw_neko_gif", "nsfw_avatar", "pussy", 
    "pussy_jpg", "pwankg", "Random_hentai_gif", "smallboobs", "solo", 
    "solog", "tits", "trap", "yuri"
  ];
  return nsfwCategories.includes(category.toLowerCase());
}

export const nekoslifeCommand = {
  name: "nekoslife",
  displayName: "nekoslife",
  description: "Get images/gifs from nekos.life",
  displayDescription: "Get images/gifs from nekos.life",
  options: [
    {
      name: "category",
      displayName: "category",
      description: "Category of image/gif to get",
      displayDescription: "Category of image/gif to get",
      type: 3, // String
      required: true,
      choices: categories.map(cat => ({
        name: cat.name,
        value: cat.value
      }))
    },
    {
      name: "limit",
      displayName: "limit",
      description: "Number of images to get (default: 1)",
      displayDescription: "Number of images to get (default: 1)",
      type: 3, // String
      required: false,
      choices: limitOptions.map(opt => ({
        name: opt.name,
        value: opt.value
      }))
    },
    {
      name: "send",
      displayName: "send",
      description: "Send to chat (WARNING: Use NSFW channel for NSFW content)",
      displayDescription: "Send to chat (WARNING: Use NSFW channel for NSFW content)",
      type: 5, // Boolean
      required: false,
    },
    {
      name: "ephemeral",
      displayName: "ephemeral",
      description: "Send as ephemeral message (only you can see)",
      displayDescription: "Send as ephemeral message (only you can see)",
      type: 5, // Boolean
      required: false,
    }
  ],
  execute: async (args: any, ctx: any) => {
    try {
      console.log('[NekosLife] Command executed with args:', args);
      
      // Better argument parsing with fallbacks
      let category: string | undefined;
      let limitStr: string = "1";
      let shouldSend: boolean = false;
      let isEphemeral: boolean = false;

      // Handle different argument formats
      if (Array.isArray(args)) {
        category = args.find((arg: any) => arg?.name === "category")?.value;
        limitStr = args.find((arg: any) => arg?.name === "limit")?.value || "1";
        shouldSend = args.find((arg: any) => arg?.name === "send")?.value || false;
        isEphemeral = args.find((arg: any) => arg?.name === "ephemeral")?.value || false;
      } else if (args && typeof args === 'object') {
        category = args.category?.value || args.category;
        limitStr = args.limit?.value || args.limit || "1";
        shouldSend = args.send?.value || args.send || false;
        isEphemeral = args.ephemeral?.value || args.ephemeral || false;
      }

      console.log('[NekosLife] Parsed values:', { category, limitStr, shouldSend, isEphemeral });
      
      if (!category || typeof category !== 'string') {
        const errorMsg = "❌ Category is required and must be a valid string!";
        console.error('[NekosLife] Invalid category:', category);
        
        if (isEphemeral) {
          return {
            type: 4,
            data: {
              content: errorMsg,
              flags: 64,
            },
          };
        }
        showToast(errorMsg, getAssetIDByName("CircleXIcon"));
        return { type: 4 };
      }

      const limit = parseInt(limitStr) || 1;
      const isNsfw = isNsfwCategory(category);

      console.log('[NekosLife] Processing request:', { category, limit, isNsfw, shouldSend, isEphemeral });

      // Check if trying to send NSFW content in non-NSFW channel
      if (shouldSend && !isEphemeral && isNsfw && !ctx.channel?.nsfw) {
        alerts.showConfirmationAlert({
          title: "⚠️ NSFW Content Warning",
          content: "This category contains NSFW content and can only be sent in NSFW channels!",
          confirmText: "Okay",
          cancelText: null,
        });
        return { type: 4 };
      }

      // Show loading toast
      if (!isEphemeral) {
        showToast(`Fetching ${limit} image(s) from nekos.life...`, getAssetIDByName("DownloadIcon"));
      }

      const urls = await fetchNekosLifeImages(category, limit);

      if (urls.length === 0) {
        const errorMsg = "❌ Failed to fetch images from nekos.life. Try again later!";
        if (isEphemeral) {
          return {
            type: 4,
            data: {
              content: errorMsg,
              flags: 64,
            },
          };
        }
        showToast(errorMsg, getAssetIDByName("CircleXIcon"));
        return { type: 4 };
      }

      const content = urls.join("\n");

      if (isEphemeral) {
        console.log('[NekosLife] Sending ephemeral response');
        return {
          type: 4,
          data: {
            content,
            flags: 64,
          },
        };
      } else if (shouldSend) {
        console.log('[NekosLife] Sending to chat');
        const fixNonce = Date.now().toString();
        MessageActions.sendMessage(ctx.channel.id, { content }, void 0, { nonce: fixNonce });
        return { type: 4 };
      } else {
        console.log('[NekosLife] Sending as bot message');
        // Send as bot message (ephemeral-like)
        messageUtil.sendBotMessage(ctx.channel.id, content);
        return { type: 4 };
      }
    } catch (error) {
      console.error('[NekosLife] Command error:', error);
      const errorMessage = "❌ An error occurred while fetching images.";
      
      const isEphemeral = Array.isArray(args) 
        ? args?.find?.((arg: any) => arg?.name === "ephemeral")?.value ?? false
        : args?.ephemeral?.value || args?.ephemeral || false;
      
      if (isEphemeral) {
        return {
          type: 4,
          data: {
            content: errorMessage,
            flags: 64,
          },
        };
      }
      showToast(errorMessage, getAssetIDByName("CircleXIcon"));
      return { type: 4 };
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
