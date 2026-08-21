import { findByProps } from "@vendetta/metro";

export const Rest: any = findByProps("getAPIBaseURL", "get");

const CDN = "https://cdn.discordapp.com";

export async function apiGet(path: string, query?: Record<string, any>) {
    if (!Rest?.get) throw new Error("REST client not found");
    const cleanQuery: Record<string, any> = {};
    if (query) {
        for (const k of Object.keys(query)) {
            if (query[k] !== undefined && query[k] !== null && query[k] !== "") {
                cleanQuery[k] = query[k];
            }
        }
    }
    let res: any;
    try {
        res = await Rest.get({
            url: path,
            query: cleanQuery,
            oldFormErrors: true,
            rejectWithError: true,
        });
    } catch (e: any) {
        console.log(`[Discovery] GET ${path} threw:`, e?.message ?? e, e?.body ? JSON.stringify(e.body).slice(0, 300) : "");
        throw e;
    }
    const body = res?.body ?? res;
    return body;
}

export interface DiscoveryCategory {
    id: string;
    name: string;
}

export interface DiscoveryServer {
    id: string;
    name: string;
    description?: string | null;
    iconUrl?: string | null;
    bannerUrl?: string | null;
    memberCount?: number | null;
    presenceCount?: number | null;
    features?: string[];
}

function mediaUrl(id: any, hash: any, kind: "icon" | "banner", size: number): string | null {
    if (!id || !hash) return null;
    if (typeof hash === "string") {
        const ext = hash.startsWith("a_") ? "gif" : "png";
        return `${CDN}/${kind}s/${id}/${hash}.${ext}?size=${size}`;
    }
    return null;
}

function normalizeServer(raw: any): DiscoveryServer | null {
    if (!raw || typeof raw !== "object") return null;
    const id = String(raw.id ?? raw.guild_id ?? "");
    if (!id) return null;
    return {
        id,
        name: String(raw.name ?? "Unknown"),
        description: raw.description ?? null,
        iconUrl: raw.icon_url ?? mediaUrl(id, raw.icon, "icon", 256),
        bannerUrl: raw.banner_url ?? mediaUrl(id, raw.banner, "banner", 512),
        memberCount: raw.member_count ?? raw.approximate_member_count ?? null,
        presenceCount: raw.presence_count ?? raw.approximate_presence_count ?? null,
        features: Array.isArray(raw.features) ? raw.features : [],
    };
}

export function formatCount(n?: number | null): string {
    if (n == null) return "?";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 10_000) return `${Math.round(n / 1000)}K`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
}

function extractList(body: any): any[] {
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.guilds)) return body.guilds;
    if (Array.isArray(body?.servers)) return body.servers;
    if (Array.isArray(body?.results)) return body.results;
    if (Array.isArray(body?.items)) return body.items;
    if (body && typeof body === "object") {
        console.log("[Discovery] unexpected list shape, keys:", Object.keys(body).join(","));
    }
    return [];
}

export async function fetchCategories(): Promise<DiscoveryCategory[]> {
    try {
        const body = await apiGet("/discovery/categories", { primary_only: false });
        const raw = Array.isArray(body) ? body : body?.categories ?? [];
        return raw
            .filter((c: any) => c && c.id != null)
            .map((c: any) => ({
                id: String(c.id),
                name: String(c.name ?? ""),
            }));
    } catch (e) {
        console.log("[Discovery] categories failed:", e);
        return [];
    }
}

// Client parity: GlobalDiscoveryServersFeaturedSearchManager calls
// GET /discoverable-guilds with { offset, limit } and, for a category,
// { categories: [categoryId] }. Response body: { guilds, total }.
export async function fetchServers(categoryId?: string | null): Promise<DiscoveryServer[]> {
    const body = await apiGet("/discoverable-guilds", {
        categories: categoryId ? [categoryId] : undefined,
    });
    return extractList(body)
        .map(normalizeServer)
        .filter(Boolean) as DiscoveryServer[];
}

export async function searchServers(query: string): Promise<DiscoveryServer[]> {
    const body = await apiGet("/discoverable-guilds/search", { query });
    return extractList(body)
        .map(normalizeServer)
        .filter(Boolean) as DiscoveryServer[];
}
