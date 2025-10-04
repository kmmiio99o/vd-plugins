import { findByProps } from "@vendetta/metro";

const MessageActions = findByProps("sendMessage");

// Channel type validation
const isValidChannel = (channelType: number) => {
    // Allow: Text (0), DM (1), Voice (2), Group DM (3), News (5)
    // Block: Threads (10,11,12), Forum (15), Stage (13), Category (4)
    const unsupportedTypes = [4, 10, 11, 12, 13, 15];
    return !unsupportedTypes.includes(channelType);
};

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

    try {
    // For normal messages, send through MessageActions
        const message = {
            content,
            ...(replyToId && storage?.factSettings?.sendAsReply
                ? { messageReference: { messageId: replyToId } }
                : {}),
        };

        // Use consistent, collision-resistant nonce generation
        const nonce = (BigInt(Date.now()) * BigInt(4194304) + BigInt(Math.floor(Math.random() * 4194304))).toString();

        MessageActions.sendMessage(channelId, message, void 0, { nonce });

        return { type: 4 }; // Acknowledge the command
    } catch (error) {
        console.error("[Commands] Message send failed:", error);
        // Silent fail - no error message in chat
        return { type: 4 };
    }
};

// Helper function to validate channel types in commands
export const validateChannelForCommand = (ctx: any) => {
    if (!isValidChannel(ctx.channel.type)) {
        return { 
            type: 4,
            data: { 
                content: "This command cannot be used in threads, forum channels, or voice channels.",
                flags: 64 // Ephemeral
            }
        };
    }
    return null;
};
