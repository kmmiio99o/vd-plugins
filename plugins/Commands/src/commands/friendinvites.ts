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

      // Try the primary method first
      try {
        const uuid = uuidv4();
        const res = await api.post({
          url: "/friend-finder/find-friends",
          body: { modified_contacts: { [uuid]: [1, "", ""] }, phone_contact_methods_count: 1 },
        });

        // Check if the Find Friends feature is available
        if (res.status === 503 || res.body?.code === 40077) {
          throw new Error("Find Friends temporarily unavailable");
        }

        const code = res.body?.invite_suggestions?.[0]?.[3];
        if (!code) {
          throw new Error("No invite code generated");
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
        
      } catch (primaryError) {
        console.error("[FriendInvite] Primary method failed:", primaryError);
        
        // Fallback method: Try to create invite directly without Find Friends
        send(ctx, "⚠️ Find Friends is temporarily unavailable. Trying alternative method...");
        
        try {
          // Alternative: Create a friend invite using a different endpoint
          const fallbackInvite = await inviteModule.createFriendInvite({
            code: null, // Let Discord generate the code
            recipient_phone_number_or_email: null,
            contact_visibility: 0,
            filter_visibilities: [],
            filtered_invite_suggestions_index: 0,
          });

          if (fallbackInvite?.code) {
            const expires = Math.floor(new Date(fallbackInvite.expires_at).getTime() / 1000);
            const message = `https://discord.gg/${fallbackInvite.code} · Expires: <t:${expires}:R>`;
            send(ctx, `✅ Fallback method successful!\n${message}`);
          } else {
            throw new Error("Fallback method also failed");
          }
          
        } catch (fallbackError) {
          console.error("[FriendInvite] Fallback method failed:", fallbackError);
          send(ctx, "❌ Both methods failed. The Find Friends feature is currently unavailable. Please try again later or use Discord's built-in friend invite system.");
        }
      }

      return { type: 4 };
    } catch (e) {
      console.error("[FriendInvite] Create error:", e);
      
      if (e?.body?.code === 40077 || e?.message?.includes("temporarily unavailable")) {
        send(ctx, "❌ The Find Friends feature is temporarily unavailable. Please try again later or use Discord's built-in friend invite system.");
      } else {
        send(ctx, "❌ Error creating friend invite. Please try again later.");
      }
      
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
      
      send(ctx, `**Your Active Friend Invites:**\n${friendInviteList.join("\n")}`);
      return { type: 4 };
    } catch (e) {
      console.error("[FriendInvite] View error:", e);
      send(ctx, "❌ Error viewing your friend invites. Please try again later.");
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
        send(ctx, "You have no active friend invites to revoke!");
        return { type: 4 };
      }
      
      await inviteModule.revokeFriendInvites();
      
      // Verify revocation worked
      const invitesAfter = await inviteModule.getAllFriendInvites();
      
      if (invitesAfter.length === 0) {
        send(ctx, `✅ Successfully revoked all ${invitesBefore.length} friend invite(s)!`);
      } else {
        send(ctx, `⚠️ Partially revoked invites. ${invitesAfter.length} invite(s) remain active.`);
      }
      
      return { type: 4 };
    } catch (e) {
      console.error("[FriendInvite] Revoke error:", e);
      send(ctx, "❌ Error revoking friend invites. Please try again later.");
      return { type: 4 };
    }
  },
};
