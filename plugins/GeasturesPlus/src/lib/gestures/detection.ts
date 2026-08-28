import { storage } from "@vendetta/plugin";
import { deleteMessage, editMessage, replyTo, isOwnMessage } from "./actions";

const DEFAULT_EDIT_WINDOW = 75;
const TRIPLE_WINDOW = 1500;

let editTimer: ReturnType<typeof setTimeout> | null = null;
let clearTimer: ReturnType<typeof setTimeout> | null = null;
let pendingId: string | null = null;
let pendingMessage: any = null;
let pendingChannel: any = null;
let justDeletedId: string | null = null;
let justDeletedAt: number = 0;

const JUST_DELETED_WINDOW = 3000;

function editWindowMs(): number {
    if (!storage.tripleTapDelete) return 0;
    return storage.doubleWindowMs > 0 ? storage.doubleWindowMs : DEFAULT_EDIT_WINDOW;
}

function wasJustDeleted(id: string | null): boolean {
    return !!id && justDeletedId === id && (Date.now() - justDeletedAt) < JUST_DELETED_WINDOW;
}

function clearAll() {
    if (editTimer) clearTimeout(editTimer);
    if (clearTimer) clearTimeout(clearTimer);
    editTimer = null;
    clearTimer = null;
    pendingId = null;
    pendingMessage = null;
    pendingChannel = null;
}

function commitEdit() {
    const m = pendingMessage;
    const c = pendingChannel;
    if (!m) return;
    if (wasJustDeleted(m?.id)) return;
    const own = isOwnMessage(m);
    if (own && !storage.replyToOwn) editMessage(m, c);
    else replyTo(m, c);
}

// Called from the native double-tap hook each time Discord recognises a double-tap.
// Two double-taps on the SAME message within TRIPLE_WINDOW = a triple-tap -> delete.
// A lone double-tap commits to edit/reply after editWindowMs().
export function onDoubleTap(message: any, channel: any) {
    if (!message) return;
    const id = message?.id;
    if (wasJustDeleted(id)) {
        clearAll();
        return;
    }
    const isSecond = pendingId !== null && pendingId === id;

    if (isSecond) {
        clearAll();
        const own = isOwnMessage(message);
        if (storage.tripleTapDelete && own) {
            justDeletedId = id;
            justDeletedAt = Date.now();
            deleteMessage(message, channel);
        }
        return;
    }

    if (pendingId !== null) clearAll();
    pendingId = id;
    pendingMessage = message;
    pendingChannel = channel;
    editTimer = setTimeout(() => {
        editTimer = null;
        commitEdit();
    }, editWindowMs());
    clearTimer = setTimeout(() => {
        clearTimer = null;
        pendingId = null;
        pendingMessage = null;
        pendingChannel = null;
    }, TRIPLE_WINDOW);
}

export function resetDetection() {
    clearAll();
    justDeletedId = null;
    justDeletedAt = 0;
}
