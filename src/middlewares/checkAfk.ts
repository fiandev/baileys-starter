import { type Middleware } from "../../types/Middleware";
import { senderIdentity } from "../utils/senderIdentity";
import { prisma } from "../lib/prisma";
import { bot } from "../config/bot";

export const checkAfk: Middleware = {
    name: "check-afk",
    isAuth: false,
    execute: async (sock, msg) => {
        try {
            if (msg.key.fromMe) return true;

            const identity = await senderIdentity(msg, sock);
            if (!identity.isRegistered) return true;

            const afkHistory = await prisma.afkHistory.findFirst({
                where: {
                    userId: identity.user!.id,
                    endTime: { gt: new Date() },
                },
                orderBy: { startTime: "desc" },
            });

            if (afkHistory) {
                await prisma.afkHistory.update({
                    where: { id: afkHistory.id },
                    data: { endTime: new Date() },
                });

                const duration = Date.now() - afkHistory.startTime.getTime();
                const hours = Math.floor(duration / (1000 * 60 * 60));
                const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

                await sock.sendMessage(msg.key.remoteJid!, {
                    text: `👋 *Welcome back, ${identity.name}!*\n\n⏱️ *AFK Duration:* ${hours}h ${minutes}m\n📝 *Reason:* ${afkHistory.reason}`,
                }, { quoted: msg as any });

                return false;
            }

            return true;
        } catch (e) {
            console.error(e);
            return true;
        }
    },
};