import { findByProps } from "@vendetta/metro";

const ClydeUtils = findByProps("sendBotMessage", "sendMessage");
const inviteModule = findByProps("getAllFriendInvites", "createFriendInvite", "revokeFriendInvites");
const api = findByProps("get", "post");
const getCurrentUser = findByProps("getCurrentUser")?.getCurrentUser;
const uuidv4 = findByProps("v4")?.v4;

function send(ctx, content) {
  const fixNonce = Date.now().toString();
  ClydeUtils.sendMessage(ctx.channel.id, { content }, void 0, { nonce: fixNonce });
}

export const friendInviteCreateCommand = {
  name: "invite create",
  displayName: "invite create",
  description: "Generates a friend invite link.",
  displayDescription: "Generates a friend invite link.",
  type: 1,
  applicationId: "-1",
  inputType: 1,
  execute: async (_, ctx) => {
    try {
      if (!getCurrentUser?.().phone) {
        send(ctx, "You need to have a phone number connected to your account to create a friend invite!");
        return { type: 4 };
      }
      const uuid = uuidv4();
      const res = await api.post({
        url: "/friend-finder/find-friends",
        body: { modified_contacts: { [uuid]: [1, "", ""] }, phone_contact_methods_count: 1 },
      });
      const code = res.body?.invite_suggestions?.[0]?.[3];
      if (!code) {
        send(ctx, "Failed to generate invite code.");
        return { type: 4 };
      }
      const createInvite = await inviteModule.createFriendInvite({
        code,
        recipient_phone_number_or_email: uuid,
        contact_visibility: 1,
        filter_visibilities: [],
        filtered_invite_suggestions_index: 1,
      });
      const expires = Math.floor(new Date(createInvite.expires_at).getTime() / 1000);
      const message = `https://discord.gg/${createInvite.code} · Expires: <t:${expires}:R>`;
      send(ctx, message);
      return { type: 4 };
    } catch (e) {
      send(ctx, "Error creating invite.");
      console.error("[FriendInvite] create error:", e);
      return { type: 4 };
    }
  },
};

export const friendInviteViewCommand = {
  name: "view invites",
  displayName: "view invites",
  description: "View your current friend invite links that you've made.",
  displayDescription: "View your current friend invite links that you've made.",
  type: 1,
  applicationId: "-1",
  execute: async (_, ctx) => {
    try {
      const invites = await inviteModule.getAllFriendInvites();
      if (!invites?.length) {
        send(ctx, "You have no active friend invites!");
        return { type: 4 };
      }
      const friendInviteList = invites.map(i => {
        const expires = Math.floor(new Date(i.expires_at).getTime() / 1000);
        return `_https://discord.gg/${i.code}_ · Expires: <t:${expires}:R> · Uses: \`${i.uses}/${i.max_uses}\``;
      });
      send(ctx, friendInviteList.join("\n"));
      return { type: 4 };
    } catch (e) {
      send(ctx, "Error viewing invites.");
      console.error("[FriendInvite] view error:", e);
      return { type: 4 };
    }
  },
};

export const friendInviteRevokeCommand = {
  name: "revoke invites",
  displayName: "revoke invites",
  description: "Revoke all your friend invite links.",
  displayDescription: "Revoke all your friend invite links.",
  type: 1,
  applicationId: "-1",
  inputType: 1,
  execute: async (_, ctx) => {
    try {
      await inviteModule.revokeFriendInvites();
      send(ctx, "All friend invites have been revoked.");
      return { type: 4 };
    } catch (e) {
      send(ctx, "Error revoking invites.");
      console.error("[FriendInvite] revoke error:", e);
      return { type: 4 };
    }
  },
};
