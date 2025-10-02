import { findByProps } from "@vendetta/metro";
import { alerts } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

const MessageActions = findByProps("sendMessage");
const messageUtil = findByProps("sendBotMessage", "sendMessage", "receiveMessage");

interface NekosLifeResult {
  url: string;
}

// Available categories as a simple array for validation
const validCategories = [
  // SFW categories
  "neko", "waifu", "avatar", "cuddle", "kiss", "smug", "tickle", "wallpaper", 
  "kemonomimi", "fox_girl", "classic", "gecg", "woof", "holo", "ngif", "spank",
  
  // NSFW categories  
  "nsfw_neko_gif", "lewd", "ero", "yuri", "trap", "futanari", "hentai", 
  "boobs", "anal", "blowjob", "bj", "cum", "cum_jpg", "pussy", "pussy_jpg",
  "tits", "femdom", "feet", "feetg", "gasm", "kuni", "holoero", "hololewd",
  "les", "lewdkemo", "lewdk", "eron", "eroyuri", "erofeet", "erokemo", "erok",
  "nsfw_avatar", "pwankg", "Random_hentai_gif", "smallboobs", "solo", "solog"
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

function isValidCategory(category: string): boolean {
  if (!category || typeof category !== 'string') return false;
  return validCategories.includes(category.toLowerCase());
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
      description: "Category: neko, waifu, hentai, lewd, etc. (type the name)",
      displayDescription: "Category: neko, waifu, hentai, lewd, etc. (type the name)",
      type: 3, // String - no choices, just free text input
      required: true,
    },
    {
      name: "limit",
      displayName: "limit",
      description: "Number of images (1-5, default: 1)",
      displayDescription: "Number of images (1-5, default: 1)",
      type: 4, // Integer
      required: false,
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
      
      // Parse arguments like other commands
      const category = args.find((arg: any) => arg.name === "category")?.value;
      const limitValue = args.find((arg: any) => arg.name === "limit")?.value;
      const shouldSend = args.find((arg: any) => arg.name === "send")?.value || false;
      const isEphemeral = args.find((arg: any) => arg.name === "ephemeral")?.value || false;

      console.log('[NekosLife] Parsed values:', { category, limitValue, shouldSend, isEphemeral });
      
      if (!category || typeof category !== 'string') {
        const errorMsg = "❌ Category is required! Examples: neko, waifu, hentai, lewd";
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

      // Validate category
      const categoryLower = category.toLowerCase().trim();
      if (!isValidCategory(categoryLower)) {
        const errorMsg = `❌ Invalid category "${category}". Available: neko, waifu, hentai, lewd, yuri, etc.`;
        
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

      // Parse limit
      let limit = 1;
      if (limitValue !== undefined && limitValue !== null) {
        limit = parseInt(String(limitValue)) || 1;
        limit = Math.max(1, Math.min(5, limit)); // Clamp between 1-5
      }

      const isNsfw = isNsfwCategory(categoryLower);

      console.log('[NekosLife] Processing request:', { category: categoryLower, limit, isNsfw, shouldSend, isEphemeral });

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

      const urls = await fetchNekosLifeImages(categoryLower, limit);

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
