import { prisma } from "../lib/prisma";
import { bot } from "../config/bot";

export function ensureDB() {
    if (!global.db) {
        console.log("[DB Helper] Global.db not found, initializing...");
        global.db = prisma;
    }
    return global.db;
}

export async function safeGetConfig(key: string, defaultValue: string): Promise<string> {
    const db = ensureDB();
    const config = await db.botConfig.findUnique({ where: { key } });
    
    if (!config) {
        console.log(`[DB Helper] Key "${key}" not found, setting default:`, defaultValue);
        await db.botConfig.create({ data: { key, value: defaultValue } });
        return defaultValue;
    }
    
    return config.value;
}

export async function initializeDefaults() {
    const db = ensureDB();
    
    const configKeys = Object.keys(bot);
    for (const key of configKeys) {
        const value = String(bot[key as keyof typeof bot]);
        const existing = await db.botConfig.findUnique({ where: { key } });
        if (!existing) {
            console.log(`[DB Helper] Initializing '${key}' with default:`, value);
            await db.botConfig.create({ data: { key, value } });
        }
    }
    
    console.log("[DB Helper] Defaults initialized");
}

export async function debugDB() {
    const db = ensureDB();
    console.log("=== DATABASE DEBUG INFO ===");
    console.log("Instance exists:", !!global.db);
    const users = await db.user.findMany();
    const configs = await db.botConfig.findMany();
    const autoReplies = await db.autoReplyChat.findMany();
    console.log("Users count:", users.length);
    console.log("Configs:", configs);
    console.log("Auto replies:", autoReplies);
    console.log("========================");
}
