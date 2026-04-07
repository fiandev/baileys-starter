import { type Command } from "../../../types/Command";
import { senderIdentity } from "../../utils/senderIdentity";
import { prisma } from "../../lib/prisma";
import log from "../../utils/log";

export const afk: Command = {
  name: "afk",
  description: "Set yourself as AFK",
  usage: ".afk [reason]",
  cmd: ["afk"],
  isMedia: false,
  category: "utility",
  isOnlyGroup: false,
  async execute(sock, msg, args) {
    const identity = await senderIdentity(msg, sock);

    if (!identity.isRegistered) {
      await sock.sendMessage(msg.key.remoteJid!, {
        text: "You must register first. Use .register",
      }, { quoted: msg as any });
      return;
    }

    const reason = args.join(" ") || "AFK";

    const existingAfk = await prisma.afkHistory.findFirst({
      where: {
        userId: identity.user!.id,
        endTime: { lte: new Date() },
      },
      orderBy: { startTime: "desc" },
    });

    if (!existingAfk) {
      await prisma.afkHistory.create({
        data: {
          userId: identity.user!.id,
          reason,
          startTime: new Date(),
          endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      await prisma.afkHistory.update({
        where: { id: existingAfk.id },
        data: {
          reason,
          startTime: new Date(),
          endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }

    await sock.sendMessage(msg.key.remoteJid!, {
      text: `✅ *AFK Mode Activated*\n\n*Reason:* ${reason}\n\nYou'll be marked as AFK until you send a message again.`,
    }, { quoted: msg as any });

    log.info(`[afk] User ${identity.phone} set AFK: ${reason}`);
  },
};