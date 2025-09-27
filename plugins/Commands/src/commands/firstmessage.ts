import { findByProps } from "@vendetta/metro";
import { url } from "@vendetta/metro/common";

const messageUtil = findByProps(
  "sendBotMessage",
  "sendMessage",
  "receiveMessage",
);
const APIUtils = findByProps("getAPIBaseURL", "get");

const getFirstGuildMessage = async (
  guildId: number,
  userId?: number,
  channelId?: number,
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

const getFirstDMMessage = async (dmId: number, userId?: number) => {
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
      displayDescription:
        "Target user to get their first message in this server/dm",
      type: 6,
      required: false,
    },
    {
      name: "channel",
      displayName: "channel",
      description: "Target channel to get first message of",
      displayDescription: "Target channel to get first message of",
      type: 7,
      required: false,
    },
    {
      name: "send",
      displayName: "send",
      description: "Whether to send the resulting url",
      displayDescription: "Whether to send the resulting url",
      type: 5,
      required: false,
    },
  ],
  applicationId: "-1",
  inputType: 1,
  type: 1,
  execute: async (args: any, ctx: any) => {
    const options = new Map(args.map((option: any) => [option.name, option]));
    const user = options.get("user")?.value;
    const channel = options.get("channel")?.value;
    const send = options.get("send")?.value;

    const guildId = ctx.guild?.id;
    const channelId = ctx.channel.id;
    const isDM = ctx.channel.type === 1;

    try {
      // Handle DM error cases first
      if (isDM && (channel || (user && channel))) {
        messageUtil.sendBotMessage(
          channelId,
          "This combination cannot be used in DMs!",
        );
        return { type: 4 };
      }

      let result = "https://discord.com/channels/";

      if (!user && !channel) {
        if (isDM) {
          const message = await getFirstDMMessage(channelId);
          result += `@me/${channelId}/${message.id}`;
        } else {
          const message = await getFirstGuildMessage(guildId);
          result += `${guildId}/${message.channel_id}/${message.id}`;
        }
      } else if (user) {
        if (isDM) {
          const message = await getFirstDMMessage(channelId, user);
          result += `@me/${channelId}/${message.id}`;
        } else {
          const message = await getFirstGuildMessage(guildId, user);
          result += `${guildId}/${message.channel_id}/${message.id}`;
        }
      } else if (channel) {
        const message = await getFirstGuildMessage(guildId, null, channel);
        result += `${guildId}/${channel}/${message.id}`;
      } else {
        const message = await getFirstGuildMessage(guildId, user, channel);
        result += `${guildId}/${channel}/${message.id}`;
      }

      if (send) {
        messageUtil.sendBotMessage(channelId, result);
        return { type: 4 };
      } else {
        return url.openDeeplink(result);
      }
    } catch (error) {
      messageUtil.sendBotMessage(
        channelId,
        "Failed to fetch the first message. Please try again.",
      );
      return { type: 4 };
    }
  },
};
