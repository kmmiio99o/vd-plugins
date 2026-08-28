import { getUser, getMac, getReply } from "./resolvers";

const TAG = "[Geastures+]";

export function isOwnMessage(message: any): boolean {
    try {
        const me = getUser()?.();
        return !!me && !!message && message?.author?.id === me.id;
    } catch {
        return false;
    }
}

export function editMessage(message: any, channel: any) {
    const fn = getMac()?.startEditMessageRecord;
    if (typeof fn !== "function") { console.error(TAG, "EDIT: not resolved"); return; }
    try { fn(channel?.id ?? message?.channel_id, message, "message_swipe"); }
    catch (e) { console.error(TAG, "EDIT: error", e); }
}

export function replyTo(message: any, channel: any) {
    let fn = getReply();
    if (fn?.default) fn = (...a: any[]) => fn.default(...a);
    if (typeof fn !== "function") { console.error(TAG, "REPLY: not resolved"); return; }
    try { fn({ message, channel, shouldMention: true, showMentionToggle: false, source: "message_swipe" }); }
    catch (e) { console.error(TAG, "REPLY: error", e); }
}

export function deleteMessage(message: any, channel: any) {
    const fn = getMac()?.deleteMessage;
    if (typeof fn !== "function") { console.error(TAG, "DELETE: not resolved"); return; }
    const channelId = channel?.id ?? message?.channel_id;
    const messageId = message?.id;
    try {
        fn(channelId, messageId, false);
    } catch (e) { console.error(TAG, "DELETE: error", e); }
}
