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

function containsNsfwKeywords(text: string): boolean {
  const nsfwKeywords = [
    'nsfw', 'nude', 'naked', 'dick', 'cock', 'penis', 'pussy', 'vagina', 'ass', 'boobs', 'tits',
    'sex', 'fuck', 'cum', 'orgasm', 'horny', 'slutty', 'daddy', 'kinky', 'bdsm', 'anal',
    'blow', 'suck', 'stroke', 'masturbat', 'jerk', 'hard', 'wet', 'tight', 'deep', 'throat',
    '18+', 'xxx', 'porn', 'sexual', 'erotic', 'explicit', 'adult', 'mature'
  ];
  
  const lowerText = text.toLowerCase();
  return nsfwKeywords.some(keyword => lowerText.includes(keyword));
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

async function getFemboyMedia(includeNsfw: boolean = false): Promise<{ url: string; isNsfw: boolean; title: string } | null> {
  try {
    console.log(`[LoveFemboys] Fetching media, includeNsfw: ${includeNsfw}`);
    
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
      
      console.log(`[LoveFemboys] Checking post: "${postData.title}" (Reddit NSFW: ${postData.over_18})`);
      
      // Check for NSFW keywords in title/content
      const hasNsfwKeywords = containsNsfwKeywords(postData.title + ' ' + postData.selftext);
      const isNsfwContent = postData.over_18 || hasNsfwKeywords;
      
      console.log(`[LoveFemboys] NSFW analysis - Reddit flag: ${postData.over_18}, Keywords detected: ${hasNsfwKeywords}, Final NSFW: ${isNsfwContent}`);
      
      // Filter by NSFW preference
      if (!includeNsfw && isNsfwContent) {
        console.log(`[LoveFemboys] Skipping NSFW content: ${postData.title}`);
        continue;
      }
      
      // Try to extract media URL
      const mediaUrl = extractMediaUrl(post);
      if (mediaUrl) {
        console.log(`[LoveFemboys] Found valid media: ${mediaUrl}`);
        validPosts.push({
          url: mediaUrl,
          isNsfw: isNsfwContent,
          title: postData.title
        });
      } else {
        console.log(`[LoveFemboys] No valid media URL found for: ${postData.title}`);
      }
    }

    console.log(`[LoveFemboys] Found ${validPosts.length} valid media posts (includeNsfw: ${includeNsfw})`);

    if (validPosts.length === 0) {
      console.log('[LoveFemboys] No suitable media found');
      return null;
    }

    // Get random media
    const randomPost = validPosts[Math.floor(Math.random() * validPosts.length)];
    console.log(`[LoveFemboys] Selected: ${randomPost.title} - ${randomPost.url}`);
    
    return randomPost;
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
      name: "nsfw",
      displayName: "nsfw",
      description: "Include NSFW content",
      displayDescription: "Include NSFW content",
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
      const includeNsfw = args?.find?.((arg: any) => arg.name === "nsfw")?.value ?? false;
      const isEphemeral = args?.find?.((arg: any) => arg.name === "ephemeral")?.value ?? false;
      
      console.log(`[LoveFemboys] Command executed with nsfw: ${includeNsfw}, ephemeral: ${isEphemeral}`);
      console.log(`[LoveFemboys] Args received:`, args);
      
      const result = await getFemboyMedia(includeNsfw);

      if (!result) {
        const errorMessage = includeNsfw 
          ? "❌ No femboy content found. Reddit might be having issues."
          : "❌ No SFW femboy content found. Try with `nsfw:true` or try again later.";
        
        if (isEphemeral) {
          return {
            type: 4,
            data: {
              content: errorMessage,
              flags: 64, // Ephemeral flag
            },
          };
        } else {
          MessageActions.sendMessage(ctx.channel.id, { 
            content: errorMessage 
          });
          return { type: 4 };
        }
      }

      // Simple content without extra text
      const content = result.url;

      if (isEphemeral) {
        console.log(`[LoveFemboys] Sending ephemeral response`);
        return {
          type: 4,
          data: {
            content,
            flags: 64, // Ephemeral flag
          },
        };
      } else {
        console.log(`[LoveFemboys] Sending public message`);
        MessageActions.sendMessage(ctx.channel.id, { 
          content 
        });
        return { type: 4 };
      }
    } catch (error) {
      console.error('[LoveFemboys] Command error:', error);
      const errorMessage = "❌ An error occurred while fetching femboy content.";
      
      const isEphemeral = args?.find?.((arg: any) => arg.name === "ephemeral")?.value ?? false;
      
      if (isEphemeral) {
        return {
          type: 4,
          data: {
            content: errorMessage,
            flags: 64, // Ephemeral flag
          },
        };
      } else {
        MessageActions.sendMessage(ctx.channel.id, { 
          content: errorMessage 
        });
        return { type: 4 };
      }
    }
  },
  applicationId: "-1",
  inputType: 1,
  type: 1,
};
