import { findByProps } from "@vendetta/metro";

const MessageActions = findByProps("sendMessage");

export const sendMessage = (
  channelId: string,
  content: string,
  replyToId?: string,
  storage?: any
) => {
  const message = {
    content,
    ...(replyToId && storage?.factSettings?.sendAsReply
      ? { messageReference: { messageId: replyToId } }
      : {}),
  };

  MessageActions.sendMessage(channelId, message, void 0, {
    nonce: BigInt(Date.now()) << 22n,
  });
  return { type: 4 }; // Acknowledge the command
};
