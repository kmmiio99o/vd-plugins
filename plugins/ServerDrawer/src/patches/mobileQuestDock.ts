import { patchByPropWithRetry } from "./retry";

export function patchMobileQuestDock(cleanups: (() => void)[]): boolean {
    return patchByPropWithRetry(cleanups, "useMobileQuestDock", (orig) => {
        return function (this: any, ...args: any[]) {
            orig.apply(this, args);
            return {
                type: 1, // AdCreativeType.QUEST
                quest: {
                    id: "server-drawer",
                    assets: { questBarHeroVideo: null, questBarHero: null },
                    config: {
                        quest_content_type: 0,
                        assets: { questBarHeroVideo: null, questBarHero: null },
                        features: [],
                    },
                    userStatus: { enrolledAt: "2099-01-01", claimedAt: null },
                    benefits: { rewards: [] },
                    guildId: "0",
                    tasks: [],
                },
            };
        };
    });
}
