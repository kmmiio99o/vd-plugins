import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";

const ClydeUtils = findByProps("sendBotMessage", "sendMessage");
const inviteModule = findByProps("getAllFriendInvites", "createFriendInvite", "revokeFriendInvites");
const api = findByProps("get", "post");
const getCurrentUser = findByProps("getCurrentUser")?.getCurrentUser;

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
        showToast("You need a phone number connected to your account!", getAssetIDByName("Small"));
        return { type: 4 };
      }

      // Main method: Create friend invite directly
      const createInvite = await inviteModule.createFriendInvite({
        code: null,
        recipient_phone_number_or_email: null,
        contact_visibility: 0,
        filter_visibilities: [],
        filtered_invite_suggestions_index: 0,
      });

      if (createInvite?.code) {
        const expires = Math.floor(new Date(createInvite.expires_at).getTime() / 1000);
        const message = `https://discord.gg/${createInvite.code} · Expires: <t:${expires}:R>`;
        send(ctx, message);
        showToast("Friend invite created!", getAssetIDByName("Check"));
      } else {
        throw new Error("No invite code generated");
      }

      return { type: 4 };
    } catch (e) {
      console.error("[FriendInvite] Create error:", e);
      showToast("Error creating friend invite", getAssetIDByName("Small"));
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
        showToast("No active friend invites found", getAssetIDByName("Info"));
        return { type: 4 };
      }
      
      const friendInviteList = invites.map(i => {
        const expires = Math.floor(new Date(i.expires_at).getTime() / 1000);
        return `_https://discord.gg/${i.code}_ · Expires: <t:${expires}:R> · Uses: \`${i.uses}/${i.max_uses}\``;
      });
      
      send(ctx, `**Your Active Friend Invites:**\n${friendInviteList.join("\n")}`);
      return { type: 4 };
    } catch (e) {
      console.error("[FriendInvite] View error:", e);
      showToast("Error viewing friend invites", getAssetIDByName("Small"));
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
      const invitesBefore = await inviteModule.getAllFriendInvites();
      
      if (!invitesBefore?.length) {
        showToast("No active friend invites to revoke", getAssetIDByName("Info"));
        return { type: 4 };
      }
      
      await inviteModule.revokeFriendInvites();
      
      // Verify revocation worked
      const invitesAfter = await inviteModule.getAllFriendInvites();
      
      if (invitesAfter.length === 0) {
        send(ctx, `✅ Successfully revoked all ${invitesBefore.length} friend invite(s)!`);
        showToast(`Revoked ${invitesBefore.length} invite(s)`, getAssetIDByName("Check"));
      } else {
        send(ctx, `⚠️ Partially revoked invites. ${invitesAfter.length} invite(s) remain active.`);
        showToast("Partial revocation", getAssetIDByName("Warning"));
      }
      
      return { type: 4 };
    } catch (e) {
      console.error("[FriendInvite] Revoke error:", e);
      showToast("Error revoking friend invites", getAssetIDByName("Small"));
      return { type: 4 };
    }
  },
};
