import { findByProps } from "@vendetta/metro";

const MessageActions = findByProps("sendMessage");

interface RedditPost {
  kind: string;
  data: {
    title: string;
    url: string;
    is_video: boolean;
    over_18: boolean;
    thumbnail: string;
    thumbnail_width?: number;
    thumbnail_height?: number;
    preview?: {
      images: Array<{
        source: {
          url: string;
          width: number;
          height: number;
        };
        resolutions: Array<{
          url: string;
          width: number;
          height: number;
        }>;
      }>;
    };
    secure_media?: {
      oembed?: {
        thumbnail_url: string;
        type: string;
      };
    };
    media_embed?: {
      content: string;
    };
    url_overridden_by_dest?: string;
    domain: string;
    post_hint?: string;
  };
}

interface RedditResponse {
  kind: string;
  data: {
    children: RedditPost[];
    after: string;
    dist: number;
  };
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Check for direct image URLs
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
    return true;
  }
  
  // Known image hosting domains
  const imageHosts = [
    'i.redd.it',
    'i.imgur.com',
    'preview.redd.it'
  ];
  
  return imageHosts.some(host => lowerUrl.includes(host));
}

function extractImageUrl(post: RedditPost): string | null {
  const postData = post.data;
  
  // Skip videos and GIFs from redgifs/etc
  if (postData.is_video || postData.domain.includes('redgifs.com') || postData.domain.includes('gfycat.com')) {
    return null;
  }
  
  // Check post hint for image types
  if (postData.post_hint && !['image', 'hosted:video'].includes(postData.post_hint)) {
    return null;
  }
  
  // Try the main URL first
  const mainUrl = postData.url;
  if (isValidImageUrl(mainUrl)) {
    return mainUrl;
  }
  
  // Try preview images
  if (postData.preview?.images?.[0]) {
    const previewImage = postData.preview.images[0];
    
    // Try source image first (highest quality)
    if (previewImage.source?.url) {
      const sourceUrl = previewImage.source.url.replace(/&amp;/g, '&');
      if (isValidImageUrl(sourceUrl)) {
        return sourceUrl;
      }
    }
    
    // Try highest resolution preview
    if (previewImage.resolutions?.length > 0) {
      const highestRes = previewImage.resolutions[previewImage.resolutions.length - 1];
      if (highestRes?.url) {
        const resUrl = highestRes.url.replace(/&amp;/g, '&');
        if (isValidImageUrl(resUrl)) {
          return resUrl;
        }
      }
    }
  }
  
  // Try secure_media oembed thumbnail for some cases
  if (postData.secure_media?.oembed?.thumbnail_url && postData.secure_media.oembed.type === 'photo') {
    const thumbUrl = postData.secure_media.oembed.thumbnail_url;
    if (isValidImageUrl(thumbUrl)) {
      return thumbUrl;
    }
  }
  
  // Try regular thumbnail as last resort (but only if it's not a default thumbnail)
  if (postData.thumbnail && 
      postData.thumbnail !== 'self' && 
      postData.thumbnail !== 'default' && 
      postData.thumbnail !== 'nsfw' &&
      postData.thumbnail.startsWith('http')) {
    if (isValidImageUrl(postData.thumbnail)) {
      return postData.thumbnail;
    }
  }
  
  return null;
}

async function getFemboyImage(includeNsfw: boolean = false): Promise<{ url: string; isNsfw: boolean; title: string } | null> {
  try {
    console.log(`[LoveFemboys] Fetching images, includeNsfw: ${includeNsfw}`);
    
    // Fetch more posts to increase chances of finding images
    const response = await fetch('https://reddit.com/r/femboys.json?limit=100&raw_json=1');
    if (!response.ok) {
      console.log('[LoveFemboys] Failed to fetch from Reddit API:', response.status, response.statusText);
      return null;
    }

    const data: RedditResponse = await response.json();
    console.log(`[LoveFemboys] Fetched ${data.data.children.length} posts`);
    
    // Filter posts that are images and match NSFW preference
    const validPosts = [];
    
    for (const post of data.data.children) {
      const postData = post.data;
      
      console.log(`[LoveFemboys] Checking post: "${postData.title}" (NSFW: ${postData.over_18}, Domain: ${postData.domain})`);
      
      // Filter by NSFW preference first
      if (!includeNsfw && postData.over_18) {
        console.log(`[LoveFemboys] Skipping NSFW post: ${postData.title}`);
        continue;
      }
      
      // Try to extract image URL
      const imageUrl = extractImageUrl(post);
      if (imageUrl) {
        console.log(`[LoveFemboys] Found valid image: ${imageUrl}`);
        validPosts.push({
          url: imageUrl,
          isNsfw: postData.over_18,
          title: postData.title
        });
      } else {
        console.log(`[LoveFemboys] No valid image URL found for: ${postData.title}`);
      }
    }

    console.log(`[LoveFemboys] Found ${validPosts.length} valid image posts (includeNsfw: ${includeNsfw})`);

    if (validPosts.length === 0) {
      console.log('[LoveFemboys] No suitable images found');
      return null;
    }

    // Get random image
    const randomPost = validPosts[Math.floor(Math.random() * validPosts.length)];
    console.log(`[LoveFemboys] Selected: ${randomPost.title} - ${randomPost.url}`);
    
    return randomPost;
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
      
      console.log(`[LoveFemboys] Command executed with nsfw: ${includeNsfw}, ephemeral: ${isEphemeral}`);
      
      const result = await getFemboyImage(includeNsfw);

      if (!result) {
        const errorMessage = includeNsfw 
          ? "❌ Failed to fetch femboy image. Reddit might be having issues or no images available."
          : "❌ No SFW femboy images found. Try with `nsfw:true` or try again later.";
        
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

      const nsfwTag = result.isNsfw ? " 🔞" : " ✅";
      const modeTag = includeNsfw ? " (NSFW allowed)" : " (SFW only)";
      const content = `💖 **Femboy Image**${nsfwTag}${modeTag}\n*${result.title}*\n${result.url}`;

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
      const errorMessage = "❌ An error occurred while fetching femboy image. Check console for details.";
      
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
