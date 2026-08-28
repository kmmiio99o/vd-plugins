import { find, findByProps } from "@vendetta/metro";

let userFn: any = undefined;
let userResolved = false;
export function getUser(): any {
    if (userResolved) return userFn;
    userFn =
        (find((m: any) => typeof m?.getCurrentUser === "function") as any)?.getCurrentUser
        ?? (findByProps("getCurrentUser") as any)?.getCurrentUser
        ?? (findByProps("getCurrentUser") as any)?.default?.getCurrentUser
        ?? null;
    userResolved = true;
    return userFn;
}

let mac: any = undefined;
let macResolved = false;
export function getMac(): any {
    if (macResolved) return mac;
    mac =
        (find((m: any) => typeof m?.deleteMessage === "function") as any)
        ?? (findByProps("deleteMessage", "editMessage") as any)
        ?? (findByProps("startEditMessageRecord") as any)
        ?? null;
    macResolved = true;
    return mac;
}

let replyFn: any = undefined;
let replyResolved = false;
export function getReply(): any {
    if (replyResolved) return replyFn;
    replyFn =
        (find((m: any) => typeof m?.createPendingReply === "function") as any)?.createPendingReply
        ?? (findByProps("createPendingReply") as any)?.createPendingReply
        ?? null;
    replyResolved = true;
    return replyFn;
}

