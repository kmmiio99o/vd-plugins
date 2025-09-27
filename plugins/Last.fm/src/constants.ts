const Constants = {
  DEFAULT_APP_NAME: "Music",
  DEFAULT_TIME_INTERVAL: 5,
  /** The application ID of the Discord's developer app */
  APPLICATION_ID: "1054951789318909972",
  /** The minimum update interval in seconds to prevent rate limiting */
  MIN_UPDATE_INTERVAL: 3,
  /** Maximum retry attempts for API calls */
  MAX_RETRY_ATTEMPTS: 3,
  /** Retry delay in milliseconds */
  RETRY_DELAY: 5000,
  /** Base URL for Last.fm API */
  LFM_API_BASE_URL: "http://ws.audioscrobbler.com/2.0",
  /** These are the default album covers that are used by Last.fm */
  LFM_DEFAULT_COVER_HASHES: [
    "2a96cbd8b46e442fc41c2b86b821562f",
    "c6f59c1e5e7240a4c0d427abd71f3dbb",
  ],
  /** Default settings */
  DEFAULT_SETTINGS: {
    username: "",
    apiKey: "",
    appName: "Music",
    timeInterval: 5,
    showTimestamp: true,
    listeningTo: true,
    ignoreSpotify: true,
    verboseLogging: false,
  } /** GitHub repository URL */,
  GITHUB_URL: "https://github.com/kmmiio99o/letup",
  /** GitHub commits URL */
  GITHUB_COMMITS_URL: "https://github.com/kmmiio99o/letup/commits/main/",
} as const;

export default Constants;
