import { findByProps } from "@vendetta/metro";
import { url } from "@vendetta/metro/common";
import { validateChannelForCommand } from "../utils/messages";

const APIUtils = findByProps("getAPIBaseURL", "get");
const MessageActions = findByProps("sendMessage");
const messageUtil = findByProps("sendBotMessage", "sendMessage", "receiveMessage");

// Generate consistent nonce
const generateNonce = () => {
  return (BigInt(Date.now()) * BigInt(4194304) + BigInt(Math.floor(Math.random() * 4194304))).toString();
};

// Helper functions for fetching messages
const getFirstGuildMessage = async (
  guildId: string,
  userId?: string,
  channelId?: string,
) => {
  const userParam = userId ? `&author_id=${userId}` : "";
  const channelParam = channelId ? `&channel_id=${channelId}` : "";
  const minIdParam = userId ? "" : `&min_id=0`;
  return (
    await APIUtils.get({
      url: `/guilds/${guildId}/messages/search`,
      query: `include_nsfw=true${userParam}${channelParam}${minIdParam}&sort_by=timestamp&sort_order=asc&offset=0`,
    })
  ).body.messages[0][0];
};

const getFirstDMMessage = async (dmId: string, userId?: string) => {
  const userParam = userId ? `&author_id=${userId}` : "";
  const minIdParam = userId ? "" : `&min_id=0`;
  return (
    await APIUtils.get({
      url: `/channels/${dmId}/messages/search`,
      query: `&sort_by=timestamp&sort_order=asc&offset=0${userParam}${minIdParam}`,
    })
  ).body.messages[0][0];
};

export const firstMessageCommand = {
  name: "firstmessage",
  displayName: "firstmessage",
  description: "Tired of scrolling to first message?",
  displayDescription: "Tired of scrolling to first message?",
  options: [
    {
      name: "user",
      displayName: "user",
      description: "Target user to get their first message in this server/dm",
      displayDescription: "Target user to get their first message in this server/dm",
      type: 6, // USER type
      required: false,
    },
    {
      name: "channel",
      displayName: "channel",
      description: "Target channel to get first message of",
      displayDescription: "Target channel to get first message of",
      type: 7, // CHANNEL type
      required: false,
    },
    {
      name: "send",
      displayName: "send",
      description: "Whether to send the resulting url",
      displayDescription: "Whether to send the resulting url",
      type: 5, // BOOLEAN type
      required: false,
    },
  ],
  execute: async (args: any, ctx: any) => {
    // Special handling for threads/forum channels
    if (ctx.channel.type >= 10 && ctx.channel.type <= 15) {
      return {
        type: 4,
        data: { 
          content: "FirstMessage command doesn't work in thread or forum channels.", 
          flags: 64 
        }
      };
    }

    const channelValidation = validateChannelForCommand(ctx);
    if (channelValidation) return channelValidation;

    try {
      const options = new Map(args.map((option: any) => [option.name, option]));
      const user = options.get("user")?.value;
      const channel = options.get("channel")?.value;
      const send = options.get("send")?.value;

      const guildId = ctx.guild?.id;
      const channelId = ctx.channel.id;
      const isDM = ctx.channel.type === 1;

      let result = "https://discord.com/channels/";

      let message;
      if (!user && !channel) {
        if (isDM) {
          message = await getFirstDMMessage(channelId);
          result += `@me/${channelId}/${message.id}`;
        } else {
          message = await getFirstGuildMessage(guildId);
          result += `${guildId}/${message.channel_id}/${message.id}`;
        }
      } else if (user) {
        if (isDM) {
          message = await getFirstDMMessage(channelId, user);
          result += `@me/${channelId}/${message.id}`;
        } else {
          message = await getFirstGuildMessage(guildId, user);
          result += `${guildId}/${message.channel_id}/${message.id}`;
        }
      } else if (channel) {
        if (isDM) {
          // Silent fail for invalid combination
          return { type: 4 };
        }
        message = await getFirstGuildMessage(guildId, null, channel);
        result += `${guildId}/${channel}/${message.id}`;
      } else {
        // both user and channel specified
        if (isDM) {
          // Silent fail for invalid combination
          return { type: 4 };
        }
        message = await getFirstGuildMessage(guildId, user, channel);
        result += `${guildId}/${channel}/${message.id}`;
      }

      if (send) {
        const nonce = generateNonce();
        MessageActions.sendMessage(
          ctx.channel.id,
          { content: result },
          void 0,
          { nonce }
        );
        return { type: 4 };
      } else {
        url.openDeeplink(result);
        return { type: 4 };
      }
    } catch (error) {
      console.error("[FirstMessage] Error:", error);
      // Silent fail - no error message in chat
      return { type: 4 };
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
