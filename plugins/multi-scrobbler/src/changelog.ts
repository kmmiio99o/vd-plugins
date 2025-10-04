interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
    {
        version: "3.0.0",
        date: "2025-01-21",
        changes: [
            "Complete plugin rewrite with multi-service support",
            "Added support for Last.fm, Libre.fm, and ListenBrainz",
            "Replaced toast notifications with comprehensive console logging",
            "Enhanced timestamp handling with proper start/end times",
            "Improved error handling and retry logic",
            "Added service validation and connection testing",
            "New settings UI with per-service configuration",
            "Better credential management for multiple services",
            "Enhanced verbose logging for debugging",
            "Improved activity updates with service detection",
            "Added dynamic app name with track variables",
            "Better album art handling and fallbacks",
            "Comprehensive status monitoring and reporting",
        ],
    },
    {
        version: "2.3.0",
        date: "2025-09-19",
        changes: [
            "1. I TRIED SO HARD 2. remove backend error 3. factor settings tab 4. factor V2 5. factor V3 6. factor V4 7. factor V5 8. factor V6 9. Full settings refactor :3",
        ],
    },
    {
        version: "2.2.0",
        date: "2025-09-13",
        changes: ["Remember kids! Do not sniff crack!"],
    },
    {
        version: "2.0.0",
        date: "2025-09-13",
        changes: ["Fix settings scrolling"],
    },
    {
        version: "1.3.0",
        date: "2025-09-13",
        changes: ["fix reanimated"],
    },
    {
        version: "1.2.0",
        date: "2025-09-13",
        changes: ["test"],
    },
    {
        version: "1.1.0",
        date: "2025-09-12",
        changes: ["fixed reanimated issue??"],
    },
];

export const currentVersion = "3.0.0";
