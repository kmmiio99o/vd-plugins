import { React, ReactNative as RN } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { plugin } from "@vendetta";
import { getStorage } from "../../Settings";

export default function RPCPreview() {
  useProxy(plugin.storage);
  const [previewTrack, setPreviewTrack] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentProgress, setCurrentProgress] = React.useState(0);
  const [usingFallback, setUsingFallback] = React.useState(false);

  // Fallback preview data
  const fallbackTrack = {
    name: "Bohemian Rhapsody",
    artist: "Queen",
    artists: ["Queen"],
    album: "A Night at the Opera",
    image: null,
    nowPlaying: true,
    duration: 354,
    startTime: Math.floor(Date.now() / 1000) - 120,
  };

  // Helper function to parse artist data from Last.fm
  const parseArtists = (artistData: any): string[] => {
    if (!artistData) return ["Unknown Artist"];

    // Case 1: Already an array of strings
    if (Array.isArray(artistData)) {
      return artistData.filter((a) => a && typeof a === "string");
    }

    // Case 2: Object with "#text" field (Last.fm standard)
    if (artistData["#text"]) {
      const artistText = artistData["#text"];
      // Split by comma, semicolon, or "&" and clean up
      return artistText
        .split(/[,;&]/)
        .map((artist: string) => artist.trim())
        .filter((artist: string) => artist.length > 0);
    }

    // Case 3: Plain string
    if (typeof artistData === "string") {
      return artistData
        .split(/[,;&]/)
        .map((artist: string) => artist.trim())
        .filter((artist: string) => artist.length > 0);
    }

    return ["Unknown Artist"];
  };

  // Helper function to format artists for display
  const formatArtists = (artists: string[]): string => {
    if (!artists || artists.length === 0) return "Unknown Artist";
    if (artists.length === 1) return artists[0];
    if (artists.length === 2) return `${artists[0]} & ${artists[1]}`;
    return `${artists.slice(0, -1).join(", ")} & ${artists[artists.length - 1]}`;
  };

  React.useEffect(() => {
    const fetchPreviewData = async () => {
      if (!getStorage("username") || !getStorage("apiKey")) {
        // Use fallback if no credentials
        setPreviewTrack(fallbackTrack);
        setUsingFallback(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${getStorage("username")}&api_key=${getStorage("apiKey")}&format=json&limit=1`,
        );
        const data = await response.json();

        if (
          data.recenttracks &&
          data.recenttracks.track &&
          data.recenttracks.track.length > 0
        ) {
          const track = data.recenttracks.track[0];
          const artists = parseArtists(track.artist);

          let duration = 180;
          try {
            const primaryArtist = artists[0] || "Unknown Artist";
            const trackInfoResponse = await fetch(
              `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${getStorage("apiKey")}&artist=${encodeURIComponent(primaryArtist)}&track=${encodeURIComponent(track.name)}&format=json&username=${getStorage("username")}`,
            );
            const trackInfo = await trackInfoResponse.json();
            if (trackInfo.track && trackInfo.track.duration) {
              duration = Math.floor(trackInfo.track.duration / 1000);
            }
          } catch (error) {
            console.log("Could not fetch track duration, using default");
          }

          setPreviewTrack({
            name: track.name || "Unknown Track",
            artist: formatArtists(artists),
            artists: artists,
            album: track.album?.["#text"] || "Unknown Album",
            image:
              track.image?.[2]?.["#text"] ||
              track.image?.[1]?.["#text"] ||
              null,
            nowPlaying: track["@attr"]?.nowplaying === "true",
            duration: duration,
            startTime:
              track["@attr"]?.nowplaying === "true"
                ? Math.floor(Date.now() / 1000) - 60
                : null,
          });
          setUsingFallback(false);
        } else {
          // No tracks found, use fallback
          setPreviewTrack(fallbackTrack);
          setUsingFallback(true);
        }
      } catch (error) {
        console.error("Failed to fetch preview data, using fallback:", error);
        // Use fallback on error
        setPreviewTrack(fallbackTrack);
        setUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviewData();
  }, [getStorage("username"), getStorage("apiKey")]);

  React.useEffect(() => {
    if (!previewTrack?.nowPlaying || !getStorage("showTimestamp")) {
      return;
    }

    const interval = setInterval(() => {
      if (previewTrack.startTime && previewTrack.duration) {
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - previewTrack.startTime;
        const progress = Math.min(elapsed / previewTrack.duration, 1);
        setCurrentProgress(progress);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [previewTrack, getStorage("showTimestamp")]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPreviewText = () => {
    let text = "";

    if (getStorage("showAlbumInTooltip") && previewTrack?.album) {
      text += `on ${previewTrack.album}`;
    }

    if (getStorage("showDurationInTooltip") && previewTrack?.duration) {
      const durationText = ` • ${formatTime(previewTrack.duration)}`;
      if (text) {
        text += durationText;
      } else {
        text = formatTime(previewTrack.duration);
      }
    }

    return text || "No tooltip text";
  };

  const getCurrentProgressData = () => {
    if (!previewTrack?.duration) return { current: 0, total: 0, progress: 0 };

    if (previewTrack.nowPlaying) {
      const current = currentProgress * previewTrack.duration;
      return {
        current: current,
        total: previewTrack.duration,
        progress: currentProgress,
      };
    } else {
      return {
        current: previewTrack.duration * 0.3,
        total: previewTrack.duration,
        progress: 0.3,
      };
    }
  };

  const activityType = getStorage("listeningTo") ? "Listening to" : "Playing";
  const appName = getStorage("appName", "Music");

  if (isLoading) {
    return (
      <RN.View style={styles.container}>
        <RN.View style={styles.loadingContent}>
          <RN.View style={styles.loadingSpinner} />
          <RN.Text style={styles.loadingText}>Loading preview...</RN.Text>
        </RN.View>
      </RN.View>
    );
  }

  if (!previewTrack) {
    return (
      <RN.View style={styles.container}>
        <RN.Text style={styles.centeredText}>Unable to load preview</RN.Text>
      </RN.View>
    );
  }

  const progressData = getCurrentProgressData();
  const previewText = getPreviewText();

  return (
    <RN.View style={styles.previewContainer}>
      <RN.View style={styles.header}>
        <RN.Text style={styles.activityType}>
          {activityType} {appName}
        </RN.Text>
        <RN.Text style={styles.rpcPreviewText} numberOfLines={1}>
          RPC Preview
        </RN.Text>
      </RN.View>

      <RN.View style={styles.content}>
        <RN.View style={styles.albumArt}>
          {previewTrack.image ? (
            <RN.Image
              source={{ uri: previewTrack.image }}
              style={styles.albumImage}
              resizeMode="cover"
            />
          ) : (
            <RN.Text style={styles.musicIcon}>🎵</RN.Text>
          )}
        </RN.View>

        <RN.View style={styles.trackInfo}>
          <RN.Text style={styles.trackName} numberOfLines={1}>
            {previewTrack.name}
          </RN.Text>
          <RN.Text style={styles.artistName} numberOfLines={1}>
            {previewTrack.artist}
          </RN.Text>
          {getStorage("showLargeText") && previewText !== "No tooltip text" && (
            <RN.Text style={styles.tooltipText} numberOfLines={1}>
              {previewText}
            </RN.Text>
          )}

          {getStorage("showTimestamp") && previewTrack.duration && (
            <RN.View style={styles.progressContainer}>
              <RN.Text style={styles.timeText}>
                {formatTime(progressData.current)}
              </RN.Text>
              <RN.View style={styles.progressBar}>
                <RN.View
                  style={[
                    styles.progressFill,
                    { width: `${progressData.progress * 100}%` },
                  ]}
                />
              </RN.View>
              <RN.Text style={styles.timeText}>
                {formatTime(progressData.total)}
              </RN.Text>
            </RN.View>
          )}
        </RN.View>
      </RN.View>
    </RN.View>
  );
}

const styles = RN.StyleSheet.create({
  container: {
    backgroundColor: "#1e1f22",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3a3c41",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#5865f2",
    borderTopColor: "transparent",
    marginBottom: 8,
  },
  previewContainer: {
    backgroundColor: "#1e1f22",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3a3c41",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  albumArt: {
    width: 80,
    height: 80,
    backgroundColor: "#2b2d31",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#40444b",
    overflow: "hidden",
    flexShrink: 0,
  },
  trackInfo: {
    flex: 1,
    minWidth: 0,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: "#2b2d31",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 2,
    backgroundColor: "#5865f2",
    borderRadius: 3,
  },
  loadingText: {
    color: "#949ba4",
    fontSize: 14,
    fontWeight: "500",
  },
  centeredText: {
    color: "#949ba4",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  activityType: {
    color: "#dbdee1",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  rpcPreviewText: {
    color: "#80848e",
    fontSize: 12,
    fontStyle: "italic",
    flexShrink: 0,
  },
  albumImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  musicIcon: {
    color: "#80848e",
    fontSize: 32,
  },
  trackName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  artistName: {
    color: "#b5bac1",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  tooltipText: {
    color: "#80848e",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 6,
  },
  timeText: {
    color: "#80848e",
    fontSize: 11,
    fontWeight: "500",
    minWidth: 35,
    textAlign: "center",
  },
});
