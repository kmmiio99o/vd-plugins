import { findByProps } from "@vendetta/metro";
import { sendMessage } from "../utils/messages";
import { alerts } from "@vendetta/ui";

/**
 * Fetches a random image from KonoChan.
 * @param isNSFW - Whether to include NSFW content.
 * @returns The URL of the fetched image or null if none are found.
 */
const fetchImage = async (isNSFW: boolean): Promise<string | null> => {
  const baseURL = "https://konachan.com/post.json";
  const tag = isNSFW ? "rating:explicit" : "rating:safe";
  const randomPage = Math.floor(Math.random() * 100);

  try {
    const response = await fetch(
      `${baseURL}?tags=${tag}&limit=1&page=${randomPage}`,
    );
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }
    return data[0].file_url;
  } catch (error) {
    console.error("[KonoChan Randomizer] Error fetching image:", error);
    return null;
  }
};

const showNSFWWarning = () => {
  return alerts.showConfirmationAlert({
    title: "NSFW Content Warning",
    content: "NSFW content can only be sent in NSFW channels!",
    confirmText: "Okay",
    cancelText: null,
    confirmColor: "brand",
    isDismissable: true,
  });
};

// Common options for both commands
const nsfwOption = {
  name: "nsfw",
  description: "Include NSFW content?",
  type: 5,
  required: false,
  displayName: "nsfw",
  displayDescription: "Include NSFW content?",
};

export const konoSelfCommand = {
  name: "konoself",
  displayName: "konoself",
  description: "Fetch a random image from KonoChan for yourself.",
  displayDescription: "Fetch a random image from KonoChan for yourself.",
  options: [nsfwOption],
  execute: async (args: any, ctx: any) => {
    const options = new Map(args.map((option: any) => [option.name, option]));
    const isNSFW = options.get("nsfw")?.value || false;

    // Check if channel is NSFW for NSFW content
    if (isNSFW && !ctx.channel.nsfw) {
      showNSFWWarning();
      return { type: 4 };
    }

    const imageUrl = await fetchImage(isNSFW);

    if (!imageUrl) {
      return sendMessage(
        ctx.channel.id,
        "No image found. Try again later.",
        undefined,
        undefined,
        true,
      );
    }

    return sendMessage(
      ctx.channel.id,
      `Here's your random image: ${imageUrl}`,
      undefined,
      undefined,
      true,
    );
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};

export const konoSendCommand = {
  name: "konosend",
  displayName: "konosend",
  description: "Fetch a random image from KonoChan and send it to the channel.",
  displayDescription:
    "Fetch a random image from KonoChan and send it to the channel.",
  options: [nsfwOption],
  execute: async (args: any, ctx: any) => {
    const options = new Map(args.map((option: any) => [option.name, option]));
    const isNSFW = options.get("nsfw")?.value || false;

    // Check if channel is NSFW for NSFW content
    if (isNSFW && !ctx.channel.nsfw) {
      showNSFWWarning();
      return { type: 4 };
    }

    const imageUrl = await fetchImage(isNSFW);

    if (!imageUrl) {
      return sendMessage(ctx.channel.id, "No image found. Try again later.");
    }

    return sendMessage(ctx.channel.id, imageUrl);
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
