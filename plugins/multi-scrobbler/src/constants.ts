import { ServiceConfig, ServiceType } from "../../defs";

const Constants = {
  DEFAULT_APP_NAME: "Music",
  DEFAULT_TIME_INTERVAL: 5,
  // Discord application ID
  APPLICATION_ID: "1054951789318909972",
  // Don't check more than once every 3 seconds to avoid getting rate limited
  MIN_UPDATE_INTERVAL: 3,
  // How many times to retry failed API calls
  MAX_RETRY_ATTEMPTS: 3,
  // Wait 5 seconds between retries
  RETRY_DELAY: 5000,

  // Configuration for each supported service
  SERVICES: {
    lastfm: {
      name: "Last.fm",
      baseUrl: "http://ws.audioscrobbler.com/2.0",
      requiresApiKey: true,
      requiresToken: false,
    },
    librefm: {
      name: "Libre.fm",
      baseUrl: "http://libre.fm/api",
      requiresApiKey: true,
      requiresToken: false,
    },
    listenbrainz: {
      name: "ListenBrainz",
      baseUrl: "http://api.listenbrainz.org/1",
      requiresApiKey: false,
      requiresToken: true,
    },
  } as Record<ServiceType, ServiceConfig>,

  // Last.fm/Libre.fm use these hashes for their generic album covers
  DEFAULT_COVER_HASHES: [
    "2a96cbd8b46e442fc41c2b86b821562f",
    "c6f59c1e5e7240a4c0d427abd71f3dbb",
  ],

  // Plugin defaults
  DEFAULT_SETTINGS: {
    username: "",
    apiKey: "",
    appName: "Music",
    timeInterval: 5,
    showTimestamp: true,
    listeningTo: true,
    ignoreSpotify: true,
    ignoreYouTubeMusic: true,
    verboseLogging: false,
    service: undefined as ServiceType | undefined,
    librefmUsername: "",
    librefmApiKey: "",
    listenbrainzUsername: "",
    listenbrainzToken: "",
  },

  // Last.fm/Libre.fm API error codes
  API_ERROR_CODES: {
    2: "Invalid service",
    3: "Invalid method",
    4: "Invalid format",
    5: "Invalid parameters",
    6: "Invalid resource specified",
    7: "Invalid session key",
    8: "Invalid API key",
    9: "Invalid session",
    10: "Invalid API signature",
    11: "Service offline",
    13: "Invalid method signature supplied",
    16: "Service temporarily unavailable",
    26: "Suspended API key",
    29: "Rate limit exceeded",
  } as Record<number, string>,
} as const;

export default Constants;
