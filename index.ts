import { config } from "dotenv";
import { makeMessageHandler } from "./src/lib/handlers";
import { prisma } from "./src/lib/prisma";
import pino from "pino";
import { bot } from "./src/config/bot";
import { loadModules } from "./core";
import { senderNotification } from "./src/utils/senderNotification";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";

config({ path: "./.env" });
config({ path: "./.env.development", override: true });
config({ path: ".env.production", override: true });

global.db = prisma;

const ephemeral = 86400;

(async () => {
  const { default: makeWASocket, fetchLatestBaileysVersion, useMultiFileAuthState } = await loadModules();
  const { state, saveCreds } = await useMultiFileAuthState("./sessions");

  let reconnect = true;

  const startBot = async () => {
    const { version } = await fetchLatestBaileysVersion();
    const logger = pino({ level: "info" });

    const sock = makeWASocket({
      version,
      logger,
      auth: state,
      browser: [bot.botName, "Chrome", "20"],
      markOnlineOnConnect: true,
      syncFullHistory: false,
    });

    const { handleMessage } = makeMessageHandler(sock);

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("messages.upsert", ({ messages }) => handleMessage(messages));
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("📲 Scan QR ini dengan WhatsApp:");
        qrcode.generate(qr, { small: true });
      }

      console.log("Connection status:", connection);

      if (connection === "open") {
        sock.updateDefaultDisappearingMode(ephemeral);
        if (process.env.NODE_ENV === "production") {
          senderNotification(sock, `Bot is now *online*!\n\ntime: ${new Date().toLocaleString()}`);
        }
      }

      if (connection === "close") {
        reconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== 401;
        if (reconnect) startBot();
        else {
          for (const author of bot.authors) {
            sock.sendMessage(`${author}@s.whatsapp.net`, {
              text: `Bot is now *offline*!\n\ntime: ${new Date().toLocaleString()}`,
            });
          }
        }
      }
    });

    return sock;
  };

  startBot();
})();

process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());