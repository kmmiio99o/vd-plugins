import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";

const MessageActions = findByProps("sendMessage");

export const sendMessage = async (
  channelId: string,
  content: string,
  replyToId?: string,
  storage?: any,
) => {
  // Only return acknowledgment for slash command
  if (!content) return { type: 4 };

  const message = {
    content,
    ...(replyToId && storage?.factSettings?.sendAsReply
      ? { messageReference: { messageId: replyToId } }
      : {}),
  };

  // Use a promise to ensure message is sent before returning
  await MessageActions.sendMessage(channelId, message, void 0, {
    nonce: (Date.now() * 4194304).toString(),
  });

  // Return acknowledgment without content to prevent double sending
  return { type: 4 };
};

export const showAlert = (message: string) => {
  showToast(message, findByProps("Alerts").Alerts.ERROR);
};
