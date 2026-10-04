import { findByProps, findByStoreName } from "@vendetta/metro";
import { ReactNative } from "@vendetta/metro/common";
import { logger } from "@vendetta";

const UserStore = findByStoreName("UserStore");

interface NativeFileManager {
    writeFile(directory: "cache", path: string, data: string, encoding: "base64"): Promise<string>;
    removeFile(directory: "cache", path: string): Promise<unknown>;
}

function isFileManager(module: unknown): module is NativeFileManager {
    return (
        typeof module === "object" &&
        module !== null &&
        "writeFile" in module &&
        typeof (module as NativeFileManager).writeFile === "function" &&
        "removeFile" in module &&
        typeof (module as NativeFileManager).removeFile === "function"
    );
}

function getFileManager(): NativeFileManager {
    const turboProxy = Reflect.get(globalThis, "__turboModuleProxy");
    const nativeProxy = Reflect.get(globalThis, "nativeModuleProxy");

    for (const name of ["NativeFileModule", "RTNFileManager", "DCDFileManager"]) {
        // An unavailable TurboModule may throw instead of returning null.
        if (typeof turboProxy === "function") {
            try {
                const module: unknown = turboProxy(name);
                if (isFileManager(module)) return module;
            } catch {
                // TurboModule unavailable here, keep trying the next candidate.
            }
        }
        if (nativeProxy && typeof nativeProxy === "object") {
            const module: unknown = Reflect.get(nativeProxy, name);
            if (isFileManager(module)) return module;
        }
        const module: unknown = ReactNative.NativeModules[name];
        if (isFileManager(module)) return module;
    }

    throw new Error("No supported Discord file module was found.");
}

function getApiBase(): string {
    const api = findByProps("getAPIBaseURL", "del");
    let base = api?.getAPIBaseURL?.();
    if (typeof base === "string") {
        if (base.startsWith("//")) base = `https:${base}`;
        if (base.startsWith("https://") && base.includes("/api/")) {
            return base.replace(/\/$/, "");
        }
    }
    return "https://discord.com/api/v9";
}

const BASE64_ALPHABET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// btoa is not available in Hermes, so encode manually.
function bytesToBase64(bytes: Uint8Array): string {
    let out = "";
    for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i];
        const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
        const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;

        out += BASE64_ALPHABET[b0 >> 2];
        out += BASE64_ALPHABET[((b0 & 3) << 4) | (b1 >> 4)];
        out += i + 1 < bytes.length ? BASE64_ALPHABET[((b1 & 15) << 2) | (b2 >> 6)] : "=";
        out += i + 2 < bytes.length ? BASE64_ALPHABET[b2 & 63] : "=";
    }
    return out;
}

async function fetchPetPetBase64(avatarUrl: string): Promise<string> {
    const response = await fetch(
        `https://api.popcat.xyz/pet?image=${encodeURIComponent(avatarUrl)}`,
    );
    if (!response.ok) {
        throw new Error(`Failed to generate petpet GIF: ${response.status}`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    const signature = String.fromCharCode(...bytes.subarray(0, 6));
    if (signature !== "GIF89a" && signature !== "GIF87a") {
        throw new Error("The petpet API did not return a GIF.");
    }

    return bytesToBase64(bytes);
}

async function sendPetPetAttachment(channelId: string, base64Data: string): Promise<void> {
    const files = getFileManager();
    const token = findByProps("getToken")?.getToken?.();
    if (!token) throw new Error("Unable to resolve authorization token.");

    const tempPath = `vendetta/petpet/${Date.now()}-${Math.random().toString(16).slice(2)}.gif`;
    const filePath = await files.writeFile("cache", tempPath, base64Data, "base64");

    try {
        if (typeof filePath !== "string" || !filePath) {
            throw new Error("Unable to save the petpet GIF.");
        }

        const uri = filePath.startsWith("file://") ? filePath : `file://${filePath}`;
        const form = new FormData();
        form.append(
            "payload_json",
            JSON.stringify({
                content: "",
                channel_id: channelId,
                type: 0,
                attachments: [{ id: "0", filename: "petpet.gif" }],
                nonce: Date.now().toString(),
            }),
        );
        form.append("files[0]", { uri, type: "image/gif", name: "petpet.gif" } as any);

        const response = await fetch(`${getApiBase()}/channels/${channelId}/messages`, {
            method: "POST",
            headers: { Authorization: token },
            body: form,
        });
        if (!response.ok) {
            throw new Error(`Failed to send petpet attachment: ${response.status}`);
        }
    } finally {
        try {
            await files.removeFile("cache", tempPath);
        } catch (error) {
            logger.error("[PetPet] Failed to remove temporary GIF:", error);
        }
    }
}

export const petPetCommand = {
    name: "petpet",
    displayName: "petpet",
    description: "PetPet someone",
    displayDescription: "PetPet someone",
    options: [
        {
            name: "user",
            description: "The user (or their id) to be patted",
            type: 6,
            required: true,
            displayName: "user",
            displayDescription: "The user (or their id) to be patted",
        },
    ],
    execute: async (args: any, ctx: any) => {
        try {
            const user = await UserStore.getUser(args[0].value);
            if (!user) throw new Error("Unable to find the selected user.");

            const channelId = ctx.channel.id ?? ctx.channel.channel_id;
            if (!channelId) throw new Error("Unable to resolve the current channel.");

            const avatarUrl = user
                .getAvatarURL(128)
                .replace(/\.webp(?=\?|$)/, ".png");

            const base64Gif = await fetchPetPetBase64(avatarUrl);
            await sendPetPetAttachment(channelId, base64Gif);

            return null;
        } catch (error) {
            logger.error("[PetPet] Error:", error);
            return {
                type: 4,
                data: {
                    content: "❌ Failed to send petpet. The image API or upload may be down.",
                    flags: 64,
                },
            };
        }
    },
    applicationId: "-1",
    inputType: 1,
    type: 1,
};
