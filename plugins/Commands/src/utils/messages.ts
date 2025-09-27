import { findByProps } from "@vendetta/metro";

const MessageActions = findByProps("sendMessage");

export const sendMessage = (
  channelId: string,
  content: string,
  replyToId?: string,
  storage?: any,
  ephemeral?: boolean,
) => {
  // If no content, just acknowledge the command
  if (!content) return { type: 4 };

  // For ephemeral messages, return special format
  if (ephemeral) {
    return {
      type: 4,
      data: {
        content,
        flags: 64,
      },
    };
  }

  // For normal messages, send through MessageActions
  const message = {
    content,
    ...(replyToId && storage?.factSettings?.sendAsReply
      ? { messageReference: { messageId: replyToId } }
      : {}),
  };

  MessageActions.sendMessage(channelId, message, void 0, {
    nonce: (Date.now() * 4194304).toString(),
  });

  return { type: 4 }; // Acknowledge the command
};
