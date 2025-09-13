import { currentSettings } from "..";
import { Track } from "../../../defs";
import Constants from "../constants";
import { setDebugInfo } from "./debug";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

interface LastFMError {
  error: number;
  message: string;
}

interface LastFMResponse {
  recenttracks?: {
    track: LastFMTrack[];
  };
  error?: number;
  message?: string;
}

interface LastFMTrack {
  name: string;
  artist: {
    name: string;
  };
  album: {
    "#text": string;
  };
  image?: {
    size: string;
    "#text": string;
  }[];
  url: string;
  date?: {
    "#text": string;
  };
  "@attr"?: {
    nowplaying: boolean;
  };
  loved: string;
}

class LastFMClient {
  private static instance: LastFMClient;
  private retryCount: number = 0;
  private lastError: number = 0;

  private constructor() {}

  public static getInstance(): LastFMClient {
    if (!LastFMClient.instance) {
      LastFMClient.instance = new LastFMClient();
    }
    return LastFMClient.instance;
  }

  private validateSettings(): void {
    if (!currentSettings.username) {
      throw new Error("Last.fm username is not set");
    }
    if (!currentSettings.apiKey) {
      throw new Error("Last.fm API key is not set");
    }
  }

  private async handleError(error: LastFMError): Promise<never> {
    this.lastError = error.error;

    const errorMessages: { [key: number]: string } = {
      2: "Invalid API key",
      6: "User not found",
      8: "Operation failed - Backend error",
      11: "Service temporarily unavailable",
      16: "Service temporarily unavailable",
      29: "Rate limit exceeded",
    };

    const message =
      errorMessages[error.error] || error.message || "Unknown error";
    showToast(`Last.fm Error: ${message}`, getAssetIDByName("Small"));

    throw new Error(`Last.fm API Error ${error.error}: ${message}`);
  }

  private async makeRequest(
    params: Record<string, string>,
  ): Promise<LastFMResponse> {
    const queryParams = new URLSearchParams({
      ...params,
      api_key: currentSettings.apiKey,
      format: "json",
    }).toString();

    const response = await fetch(
      `${Constants.LFM_API_BASE_URL}?${queryParams}`,
    );
    const data: LastFMResponse = await response.json();

    if (!response.ok || data.error) {
      await this.handleError(data as LastFMError);
    }

    return data;
  }

  public async fetchLatestScrobble(): Promise<Track> {
    try {
      this.validateSettings();

      const data = await this.makeRequest({
        method: "user.getrecenttracks",
        user: currentSettings.username,
        limit: "1",
        extended: "1",
      });

      const lastTrack = data?.recenttracks?.track?.[0];
      setDebugInfo("lastAPIResponse", lastTrack);

      if (!lastTrack) {
        throw new Error("No tracks found");
      }

      // Reset retry count on successful request
      this.retryCount = 0;

      return {
        name: lastTrack.name,
        artist: lastTrack.artist.name,
        album: lastTrack.album["#text"],
        albumArt: await this.handleAlbumCover(
          lastTrack.image?.find((x) => x.size === "large")?.["#text"],
        ),
        url: lastTrack.url,
        date: lastTrack.date?.["#text"] ?? "now",
        nowPlaying: Boolean(lastTrack["@attr"]?.nowplaying),
        loved: lastTrack.loved === "1",
      } as Track;
    } catch (error) {
      // Increment retry count and throw if we've exceeded max retries
      this.retryCount++;
      if (this.retryCount > Constants.MAX_RETRY_ATTEMPTS) {
        this.retryCount = 0;
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, Constants.RETRY_DELAY),
      );
      return this.fetchLatestScrobble();
    }
  }

  private async handleAlbumCover(cover?: string): Promise<string | null> {
    if (!cover) return null;

    // If the cover is a default one, return null
    if (
      Constants.LFM_DEFAULT_COVER_HASHES.some((hash) => cover.includes(hash))
    ) {
      return null;
    }

    return cover;
  }

  public getLastError(): number {
    return this.lastError;
  }

  public resetRetryCount(): void {
    this.retryCount = 0;
  }
}

// Export a singleton instance
export const lastfmClient = LastFMClient.getInstance();

/** Fetches the latest user's scrobble */
export async function fetchLatestScrobble(): Promise<Track> {
  return lastfmClient.fetchLatestScrobble();
}

/**
 * Handles album cover processing
 * @param cover The album cover given by Last.fm
 */
export async function handleAlbumCover(cover: string): Promise<string> {
  return lastfmClient.handleAlbumCover(cover);
}
