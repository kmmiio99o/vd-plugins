import { findByProps } from "@vendetta/metro";

const TAG = "[ServerDrawer]";

export function patchMobileQuestDock(cleanups: (() => void)[]): boolean {
    const mod = findByProps("useMobileQuestDock");
    if (!mod.useMobileQuestDock) {
        console.log(TAG, "WARN: useMobileQuestDock not found");
        return false;
    }
    const orig = mod.useMobileQuestDock;
    mod.useMobileQuestDock = function (...args: any[]) {
        orig.apply(this, args);
        return {
            type: 1, // AdCreativeType.QUEST
            quest: {
                id: "server-drawer",
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
    cleanups.push(() => { mod.useMobileQuestDock = orig; });
    return true;
}
