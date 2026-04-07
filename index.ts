import { config } from "dotenv";
import { Boom } from "@hapi/boom";
import { commands, middlewares } from "./src/registry";
import qrcode from "qrcode-terminal";
import { prisma } from "./src/lib/prisma";
import UnexpectedError from "./src/exceptions/UnexpectedError";
import { senderIdentity } from "./src/utils/senderIdentity";
import log, { saveLog } from "./src/utils/log";
import { t } from "./src/utils/translate";
import sleep from "./src/utils/sleep";
import Authenticate from "./src/lib/Authenticate";
import pino from "pino";
import { bot } from "./src/config/bot";
import { loadModules } from "./core";
import { senderNotification } from "./src/utils/senderNotification";
import type { Command } from "./types/Command";

(async () => {
  const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
  } = await loadModules();
  const { state, saveCreds } = await useMultiFileAuthState("./sessions");

  /**
   * Load environment variables
   */
  config({ path: "./.env" });
  config({ path: "./.env.development", override: true });
  config({ path: "./.env.production", override: true });

  /**
   * Load database
   */
  global.db = prisma;

  /**
   * Start bot
   *
   * @returns void
   */
  const startBot = async () => {
    const { version } = await fetchLatestBaileysVersion();
    const logger = pino({ level: "info" });
    const ephemeral = 86400; // 24 hours

    const sock = makeWASocket({
      version,
      logger,
      auth: state,
      browser: [`${bot.botName}`, "Chrome", "20"],
      markOnlineOnConnect: true,
      syncFullHistory: false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
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
        auth.update(sender.phone, {
          exp: sender.user.exp + 10n,
        })
      }

      if (!sender.isBot) {
        await saveLog(msg, sock, sender);
      }

      // development mode
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

      // Identify command
      const prefix = bot.prefix;
      const prefixMatch = message.match(prefix);

      log.info(
        `[${sender.name || "??"} | ${sender.jid}] Message ID: ${msg.key.id} | ${message}`,
      );

      const matchs = prefixMatch?.input?.replace(prefix, "").trim().split(" ");
      const cmd = matchs?.[0] || "";

      // Execute middlewares
      for (const middleware of middlewares) {
        if (middleware.isOnlyOwner && !sender.isOwner) continue;
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
            {
              text: `${command?.isOnlyGroup ? await t("This command is only for group") : await t("This command is only for owner")}`,
            },
            { quoted: msg },
          );
          return;
        }

        if (command?.isOnlyAdmin && !sender.isAdmin) {
          await sock.sendMessage(
            remoteJid,
            { text: await t("This command is only for admin") },
            { quoted: msg },
          );
          return;
        }

        if (command) {
          try {
            if (command.isOnlyOwner && !sender.isOwner) {
              await sock.sendMessage(
                remoteJid,
                { text: await t("This command is only for owner") },
                { quoted: msg },
              );
              return;
            }

            if (command.isAuth) {
              if (!await auth.check(sender.phone) && !msg.key.fromMe) {
                await sock.sendMessage(
                  sender.jid,
                  { text: await t("You're not registered.") },
                  { quoted: msg },
                );
                return;
              }
            }

            if (command.isPremium && !sender.isPremium) {
              if (!sender.user.limit) {
                await sock.sendMessage(
                  sender.jid,
                  { text: await t("You're not premium.") },
                  { quoted: msg },
                );
                return;
              }

              await auth.update(sender.phone, {
                limit: sender.user.limit - 1,
              });
            }

            await command.execute(sock, msg, args, auth);
            await sleep(bot.delayMessage);
          } catch (e: any) {
            if (e instanceof UnexpectedError) {
              if (sender.isBot || sender.isOwner) {
                await sock.sendMessage(
                  remoteJid,
                  { text: e.message },
                  { quoted: msg },
                );
              }
            }
          }
        }
      }

      await sleep(bot.delayMessage);
    });

    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("📲 Scan QR ini dengan WhatsApp:");
        qrcode.generate(qr, { small: true });
      }

      console.log("Connection status:", connection);

      if (connection === "open") {
        await sock.updateDefaultDisappearingMode(ephemeral);

        if (process.env.NODE_ENV === "production") {
          await senderNotification(sock, `Bot is now *online*!\n\ntime: ${new Date().toLocaleString()}`);
        }
      }

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== 401;
        if (shouldReconnect) startBot();
        else {
          for (let author of bot.authors) {
            await sock.sendMessage(`${author}@s.whatsapp.net`, {
              text: `Bot is now *offline*!\n\ntime: ${new Date().toLocaleString()}`,
            });
          }
        }
      }
    });
  };

  startBot();
})();

process.on("SIGINT", () => {
  process.exit();
});

process.on("SIGTERM", () => {
  process.exit();
});
