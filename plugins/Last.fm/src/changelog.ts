interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "2.1.0",
    date: "2024-01-15",
    changes: ["Add changelog display to Last.fm plugin settings"],
  },
  {
    version: "2.0.0",
    date: "2025-09-12",
    changes: ["Fix settings scrolling"],
  },
  {
    version: "1.3.0",
    date: "2025-09-12",
    changes: ["fix reanimated"],
  },
  {
    version: "1.2.0",
    date: "2025-09-12",
    changes: ["test"],
  },
  {
    version: "1.1.0",
    date: "2025-09-12",
    changes: ["fixed reanimated issue??"],
  },
];

export const currentVersion = "2.0.0";
