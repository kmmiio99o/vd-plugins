import { findByProps } from "@vendetta/metro";
import { alerts } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

const MessageActions = findByProps("sendMessage");
const messageUtil = findByProps("sendBotMessage", "sendMessage", "receiveMessage");

interface NekosLifeResult {
  url: string;
}

// Simplified categories - only the most common ones to avoid choice overload
const categories = [
  { name: "neko", value: "neko" },
  { name: "waifu", value: "waifu" },
  { name: "avatar", value: "avatar" },
  { name: "cuddle", value: "cuddle" },
  { name: "kiss", value: "kiss" },
  { name: "smug", value: "smug" },
  { name: "tickle", value: "tickle" },
  { name: "wallpaper", value: "wallpaper" },
  { name: "kemonomimi", value: "kemonomimi" },
  { name: "fox girl", value: "fox_girl" },
  { name: "classic", value: "classic" },
  { name: "gecg", value: "gecg" },
  { name: "woof", value: "woof" },
  { name: "holo", value: "holo" },
  { name: "neko gif", value: "ngif" },
  { name: "spank", value: "spank" },
  // NSFW categories
  { name: "neko nsfw", value: "nsfw_neko_gif" },
  { name: "lewd", value: "lewd" },
  { name: "ero", value: "ero" },
  { name: "yuri", value: "yuri" },
  { name: "trap", value: "trap" },
  { name: "futanari", value: "futanari" },
  { name: "hentai", value: "hentai" },
  { name: "boobs", value: "boobs" },
  { name: "anal", value: "anal" }
];

const limitOptions = [
  { name: "1", value: "1" },
  { name: "2", value: "2" },
  { name: "3", value: "3" },
  { name: "5", value: "5" }
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
    "nsfw_neko_gif", "lewd", "ero", "yuri", "trap", "futanari", "hentai", 
    "boobs", "anal", "cum", "pussy", "tits", "blowjob", "bj", "femdom",
    "feet", "feetg", "gasm", "kuni", "holoero", "hololewd", "les",
    "lewdkemo", "lewdk", "eron", "eroyuri", "erofeet", "erokemo", "erok",
    "nsfw_avatar", "pussy_jpg", "pwankg", "Random_hentai_gif", "smallboobs",
    "solo", "solog", "cum_jpg"
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
      choices: categories
    },
    {
      name: "limit",
      displayName: "limit",
      description: "Number of images to get (default: 1)",
      displayDescription: "Number of images to get (default: 1)",
      type: 3, // String
      required: false,
      choices: limitOptions
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
      
      // Simple argument parsing like other commands
      const category = args.find((arg: any) => arg.name === "category")?.value;
      const limitStr = args.find((arg: any) => arg.name === "limit")?.value || "1";
      const shouldSend = args.find((arg: any) => arg.name === "send")?.value || false;
      const isEphemeral = args.find((arg: any) => arg.name === "ephemeral")?.value || false;

      console.log('[NekosLife] Parsed values:', { category, limitStr, shouldSend, isEphemeral });
      
      if (!category) {
        const errorMsg = "❌ Category is required!";
        console.error('[NekosLife] No category provided');
        
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
        messageUtil.sendBotMessage(ctx.channel.id, content);
        return { type: 4 };
      }
    } catch (error) {
      console.error('[NekosLife] Command error:', error);
      const errorMessage = "❌ An error occurred while fetching images.";
      
      const isEphemeral = args?.find?.((arg: any) => arg.name === "ephemeral")?.value ?? false;
      
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
