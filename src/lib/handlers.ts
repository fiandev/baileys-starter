import { commands, middlewares } from "../registry";
import UnexpectedError from "../exceptions/UnexpectedError";
import { senderIdentity } from "../utils/senderIdentity";
import log from "../utils/log";
import { t } from "../utils/translate";
import sleep from "../utils/sleep";
import Authenticate from "./Authenticate";
import { bot } from "../config/bot";
import type { Command } from "../../types/Command";
import type { WASocket } from "baileys";

const makeMessageHandler = (sock: WASocket) => {
  const handleMessage = async (messages: any[]) => {
    const msg = messages[0];
    const message =
      msg?.message?.conversation ||
      msg?.message?.extendedTextMessage?.text ||
      msg?.message?.imageMessage?.caption ||
      msg?.message?.videoMessage?.caption || "";
    const sender = await senderIdentity(msg, sock);
    const auth = new Authenticate();

    if (msg.key.fromMe || !msg.message || msg.message.stickerMessage) {
      return;
    }

    if (sender.isRegistered) {
      auth.update(sender.phone, { exp: sender.user.exp + 10n });
    }

    if (!sender.isBot) {
      const { saveLog } = await import("../utils/log");
      await saveLog(msg, sock, sender);
    }

    if (process.env.APP_ENV !== "production") {
      const jid = msg.key.remoteJidAlt?.split("@")[0] || msg.key.remoteJid?.split("@")[0];
      const participant = msg.key.participant || "unknown participant";
      const isOwnerPrivateMessage = bot.authors.includes(jid);
      const isPrivateGroup = bot.privateGroups.includes(msg.key.remoteJid);

      if (sender.isGroup) {
        if (!isPrivateGroup) {
          return console.info(`[development]: "${sender.name}" on group not author skipped`, msg.key.remoteJid);
        }
      } else {
        if (!isOwnerPrivateMessage) {
          return console.info(`[development]: "${sender.name}" on pm not author skipped`, participant);
        }
      }
    }

    global.timestamp = new Date().getTime();
    const remoteJid = msg.key.remoteJid!;
    const prefix = bot.prefix;
    const prefixMatch = message.match(prefix);

    log.info(`[${sender.name || "??"} | ${sender.jid}] Message ID: ${msg.key.id} | ${message}`);

    const matchs = prefixMatch?.input?.replace(prefix, "").trim().split(" ");
    const cmd = matchs?.[0] || "";

    for (const middleware of middlewares) {
      if (middleware.isOnlyOwner && !sender.isOwner) continue;
      if (middleware.isOnlyAdmin && !sender.isAdmin) continue;
      if (middleware.isGroupOnly && !sender.isGroup) continue;
      if (middleware.isAuth && !sender.isRegistered) continue;
      if (cmd) continue;

      let isNext = await middleware.execute(sock, msg);
      if (!isNext) break;
    }

    if (!matchs) return;

    const args = [...matchs].slice(1);
    const command = commands.find((c: Command) => c.cmd.includes(cmd!));

    if (prefixMatch) {
      if (
        (command?.isOnlyGroup && !sender.isGroup) ||
        (command?.isOnlyOwner && !sender.isOwner)
      ) {
        await sock.sendMessage(
          remoteJid,
          { text: `${command?.isOnlyGroup ? await t("This command is only for group") : await t("This command is only for owner")}` },
          { quoted: msg },
        );
        return;
      }

      if (command?.isOnlyAdmin && !sender.isAdmin) {
        await sock.sendMessage(remoteJid, { text: await t("This command is only for admin") }, { quoted: msg });
        return;
      }

      if (command) {
        try {
          if (command.isOnlyOwner && !sender.isOwner) {
            await sock.sendMessage(remoteJid, { text: await t("This command is only for owner") }, { quoted: msg });
            return;
          }

          if (command.isAuth) {
            if (!await auth.check(sender.phone) && !msg.key.fromMe) {
              await sock.sendMessage(sender.jid, { text: await t("You're not registered.") }, { quoted: msg });
              return;
            }
          }

          if (command.isPremium && !sender.isPremium) {
            if (!sender.user.limit) {
              await sock.sendMessage(sender.jid, { text: await t("You're not premium.") }, { quoted: msg });
              return;
            }
            await auth.update(sender.phone, { limit: sender.user.limit - 1 });
          }

          await command.execute(sock, msg, args, auth);
          await sleep(bot.delayMessage);
        } catch (e: any) {
          if (e instanceof UnexpectedError) {
            if (sender.isBot || sender.isOwner) {
              await sock.sendMessage(remoteJid, { text: e.message }, { quoted: msg });
            }
          }
        }
      }
    }

    await sleep(bot.delayMessage);
  };

  return { handleMessage };
};

export { makeMessageHandler };