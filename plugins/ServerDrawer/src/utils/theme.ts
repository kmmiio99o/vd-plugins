import { findByProps, findByStoreName } from "@vendetta/metro";

const Flux = findByProps("useStateFromStores");
const colors = findByProps("colors", "unsafe_rawColors")?.colors;
const ExpandedGuildFolderStore = findByStoreName("ExpandedGuildFolderStore");

export function useTheme() {
    return {
        text: colors?.TEXT_NORMAL ?? "#dbdee1",
        folder: "#5865f2",
        hover: colors?.STATE_LAYER_PRESS ?? "rgba(255,255,255,0.06)",
    };
}

export function useFolderExpanded(folderId: string | number): boolean {
    return Flux?.useStateFromStores?.(
        [ExpandedGuildFolderStore],
        () => {
            const folders = ExpandedGuildFolderStore?.getExpandedFolders?.();
            return folders instanceof Set ? folders.has(folderId) : false;
        },
        [folderId],
    ) ?? false;
}

export interface GuildNode {
    type: string;
    id: string | number;
    name?: string;
    color?: number | null;
    expanded?: boolean;
    children: GuildNode[];
}
