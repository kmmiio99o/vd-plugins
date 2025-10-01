import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { alerts } from "@vendetta/ui";

const MessageActions = findByProps("sendMessage");

interface RedditPost {
  kind: string;
  data: {
    title: string;
    url: string;
    is_video: boolean;
    over_18: boolean;
    thumbnail: string;
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
      reddit_video?: {
        fallback_url: string;
        width: number;
        height: number;
      };
    };
    media?: {
      reddit_video?: {
        fallback_url: string;
        width: number;
        height: number;
      };
    };
    media_embed?: {
      content: string;
    };
    url_overridden_by_dest?: string;
    domain: string;
    post_hint?: string;
    selftext: string;
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

function isValidMediaUrl(url: string): boolean {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Check for image/video/gif extensions
  const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov'];
  if (mediaExtensions.some(ext => lowerUrl.includes(ext))) {
    return true;
  }
  
  // Known media hosting domains (including video/gif hosts)
  const mediaHosts = [
    'i.redd.it',
    'i.imgur.com',
    'preview.redd.it',
    'v.redd.it',
    'redgifs.com',
    'gfycat.com',
    'imgur.com'
  ];
  
  return mediaHosts.some(host => lowerUrl.includes(host));
}

function extractMediaUrl(post: RedditPost): string | null {
  const postData = post.data;
  
  // Try Reddit video first
  if (postData.secure_media?.reddit_video?.fallback_url) {
    return postData.secure_media.reddit_video.fallback_url;
  }
  
  if (postData.media?.reddit_video?.fallback_url) {
    return postData.media.reddit_video.fallback_url;
  }
  
  // Try the main URL
  const mainUrl = postData.url;
  if (isValidMediaUrl(mainUrl)) {
    return mainUrl;
  }
  
  // Try preview images
  if (postData.preview?.images?.[0]) {
    const previewImage = postData.preview.images[0];
    
    // Try source image first (highest quality)
    if (previewImage.source?.url) {
      const sourceUrl = previewImage.source.url.replace(/&amp;/g, '&');
      if (isValidMediaUrl(sourceUrl)) {
        return sourceUrl;
      }
    }
    
    // Try highest resolution preview
    if (previewImage.resolutions?.length > 0) {
      const highestRes = previewImage.resolutions[previewImage.resolutions.length - 1];
      if (highestRes?.url) {
        const resUrl = highestRes.url.replace(/&amp;/g, '&');
        if (isValidMediaUrl(resUrl)) {
          return resUrl;
        }
      }
    }
  }
  
  // Try secure_media oembed thumbnail
  if (postData.secure_media?.oembed?.thumbnail_url) {
    const thumbUrl = postData.secure_media.oembed.thumbnail_url;
    if (isValidMediaUrl(thumbUrl)) {
      return thumbUrl;
    }
  }
  
  // Try regular thumbnail as last resort
  if (postData.thumbnail && 
      postData.thumbnail !== 'self' && 
      postData.thumbnail !== 'default' && 
      postData.thumbnail !== 'nsfw' &&
      postData.thumbnail.startsWith('http')) {
    if (isValidMediaUrl(postData.thumbnail)) {
      return postData.thumbnail;
    }
  }
  
  return null;
}

async function getFemboyMedia(): Promise<string | null> {
  try {
    console.log(`[LoveFemboys] Fetching random media`);
    
    const response = await fetch('https://reddit.com/r/femboys.json?limit=100&raw_json=1');
    if (!response.ok) {
      console.log('[LoveFemboys] Failed to fetch from Reddit API:', response.status, response.statusText);
      return null;
    }

    const data: RedditResponse = await response.json();
    console.log(`[LoveFemboys] Fetched ${data.data.children.length} posts`);
    
    const validPosts = [];
    
    for (const post of data.data.children) {
      const postData = post.data;
      
      // Skip text-only posts
      if (postData.selftext && !postData.url) {
        continue;
      }
      
      // Try to extract media URL
      const mediaUrl = extractMediaUrl(post);
      if (mediaUrl) {
        console.log(`[LoveFemboys] Found valid media: ${mediaUrl}`);
        validPosts.push(mediaUrl);
      }
    }

    console.log(`[LoveFemboys] Found ${validPosts.length} valid media posts`);

    if (validPosts.length === 0) {
      console.log('[LoveFemboys] No suitable media found');
      return null;
    }

    // Get random media
    const randomUrl = validPosts[Math.floor(Math.random() * validPosts.length)];
    console.log(`[LoveFemboys] Selected: ${randomUrl}`);
    
    return randomUrl;
  } catch (error) {
    console.error('[LoveFemboys] Error fetching media:', error);
    return null;
  }
}

export const lovefemboysCommand = {
  name: "lovefemboys",
  displayName: "lovefemboys",
  description: "Get random femboy content from r/femboys",
  displayDescription: "Get random femboy content from r/femboys",
  options: [
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
      const isEphemeral = args?.find?.((arg: any) => arg.name === "ephemeral")?.value ?? false;
      
      console.log(`[LoveFemboys] Command executed with ephemeral: ${isEphemeral}`);
      
      // Show NSFW warning popup before proceeding
      const shouldProceed = await new Promise<boolean>((resolve) => {
        alerts.showConfirmationAlert({
          title: "⚠️ NSFW Content Warning",
          content: "This command will send potentially NSFW (Not Safe For Work) content from r/femboys. Are you sure you want to continue?",
          confirmText: "Yes, Continue",
          onConfirm: () => resolve(true),
          cancelText: "Cancel",
          onCancel: () => resolve(false),
        });
      });

      if (!shouldProceed) {
        console.log(`[LoveFemboys] User cancelled the command`);
        return { type: 4 }; // Just dismiss the command
      }

      const mediaUrl = await getFemboyMedia();

      if (!mediaUrl) {
        showToast("❌ Failed to fetch femboy content", getAssetIDByName("CircleXIcon"));
        return { type: 4 };
      }

      if (isEphemeral) {
        console.log(`[LoveFemboys] Sending ephemeral response`);
        return {
          type: 4,
          data: {
            content: mediaUrl,
            flags: 64, // Ephemeral flag
          },
        };
      } else {
        console.log(`[LoveFemboys] Sending public message`);
        const fixNonce = Date.now().toString();
        MessageActions.sendMessage(ctx.channel.id, { content: mediaUrl }, void 0, {nonce: fixNonce});
        return { type: 4 };
      }
    } catch (error) {
      console.error('[LoveFemboys] Command error:', error);
      showToast("❌ An error occurred while fetching content", getAssetIDByName("CircleXIcon"));
      return { type: 4 };
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
