import { findByProps } from "@vendetta/metro";

const MessageActions = findByProps("sendMessage");

interface RedditPost {
  data: {
    title: string;
    url: string;
    is_video: boolean;
    over_18: boolean;
    preview?: {
      images: Array<{
        source: {
          url: string;
        };
      }>;
    };
    url_overridden_by_dest?: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

async function getFemboyImage(includeNsfw: boolean = false): Promise<string | null> {
  try {
    const response = await fetch('https://reddit.com/r/femboys.json');
    if (!response.ok) {
      console.log('[LoveFemboys] Failed to fetch from Reddit API');
      return null;
    }

    const data: RedditResponse = await response.json();
    
    // Filter posts that are images and match NSFW preference
    const imagePosts = data.data.children.filter(post => {
      const postData = post.data;
      
      // Skip videos
      if (postData.is_video) return false;
      
      // Check NSFW filter
      if (!includeNsfw && postData.over_18) return false;
      
      // Check if it's an image URL
      const url = postData.url_overridden_by_dest || postData.url;
      return url && (
        url.includes('.jpg') || 
        url.includes('.jpeg') || 
        url.includes('.png') || 
        url.includes('.gif') ||
        url.includes('i.redd.it') ||
        url.includes('i.imgur.com')
      );
    });

    if (imagePosts.length === 0) {
      console.log('[LoveFemboys] No suitable images found');
      return null;
    }

    // Get random image
    const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)];
    const imageUrl = randomPost.data.url_overridden_by_dest || randomPost.data.url;
    
    // Handle Reddit preview images
    if (imageUrl.includes('reddit.com') && randomPost.data.preview?.images?.[0]?.source?.url) {
      return randomPost.data.preview.images[0].source.url.replace(/&amp;/g, '&');
    }
    
    return imageUrl;
  } catch (error) {
    console.error('[LoveFemboys] Error fetching image:', error);
    return null;
  }
}

export const lovefemboysCommand = {
  name: "lovefemboys",
  displayName: "lovefemboys",
  description: "Get a random femboy image from r/femboys",
  displayDescription: "Get a random femboy image from r/femboys",
  options: [
    {
      name: "nsfw",
      displayName: "nsfw",
      description: "Include NSFW images",
      displayDescription: "Include NSFW images",
      type: 5, // Boolean
      required: false,
    },
    {
      name: "ephemeral",
      displayName: "ephemeral", 
      description: "Send as ephemeral message (only you can see)",
      displayDescription: "Send as ephemeral message (only you can see)",
      type: 5, // Boolean
      required: false,
    }
  ],
  execute: async (args: any, ctx: any) => {
    try {
      const includeNsfw = args.find((arg: any) => arg.name === "nsfw")?.value || false;
      const isEphemeral = args.find((arg: any) => arg.name === "ephemeral")?.value || false;
      
      const imageUrl = await getFemboyImage(includeNsfw);

      if (!imageUrl) {
        const errorMessage = "❌ Failed to fetch femboy image. Try again later!";
        
        if (isEphemeral) {
          return {
            type: 4,
            data: {
              content: errorMessage,
              flags: 64, // Ephemeral flag
            },
          };
        } else {
          const fixNonce = Date.now().toString();
          MessageActions.sendMessage(ctx.channel.id, { content: errorMessage }, void 0, {
            nonce: fixNonce,
          });
          return { type: 4 };
        }
      }

      const content = `💖 **Femboy Image** ${includeNsfw ? '(NSFW included)' : '(SFW only)'}\n${imageUrl}`;

      if (isEphemeral) {
        return {
          type: 4,
          data: {
            content,
            flags: 64, // Ephemeral flag
          },
        };
      } else {
        const fixNonce = Date.now().toString();
        MessageActions.sendMessage(ctx.channel.id, { content }, void 0, {
          nonce: fixNonce,
        });
        return { type: 4 };
      }
    } catch (error) {
      console.error('[LoveFemboys] Command error:', error);
      const errorMessage = "❌ An error occurred while fetching femboy image.";
      
      const isEphemeral = args.find((arg: any) => arg.name === "ephemeral")?.value || false;
      
      if (isEphemeral) {
        return {
          type: 4,
          data: {
            content: errorMessage,
            flags: 64, // Ephemeral flag
          },
        };
      } else {
        const fixNonce = Date.now().toString();
        MessageActions.sendMessage(ctx.channel.id, { content: errorMessage }, void 0, {
          nonce: fixNonce,
        });
        return { type: 4 };
      }
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
