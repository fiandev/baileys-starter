import { type Command } from "../../types/Command";
import { bot } from "../config/bot";
import { reportError } from "../utils/reporting";
import Sticker from "../lib/Sticker";
import { loadModules } from "../../core";
import { Readable } from "stream";

export const sticker: Command = {
  name: "sticker",
  description: "create sticker",
  cmd: ["sticker", "s", "st"],
  // isMedia: true,
  category: "tools",
  async execute(sock, msg) {
    const { downloadMediaMessage } = await loadModules();
    try {
      let isImage: any = msg.message?.imageMessage;
      let isVideo: any = msg.message?.videoMessage;

      const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (quoted) {
        isImage =
          (quoted?.imageMessage?.mimetype?.search ? "image" : "") || false;
        isVideo =
          (quoted?.videoMessage?.mimetype?.search ? "video" : "") || false;
      }

      if (!isImage && !isVideo) {
        await sock.sendMessage(msg.key?.remoteJid!, {
          text: "Kirim gambar/video atau reply ke media dengan *.sticker*",
        });
        return;
      }

      const messageToProcess = quoted
        ? {
            key: msg.message!.extendedTextMessage!.contextInfo!.stanzaId,
            message: quoted,
          }
        : msg;
      const mediaStream = await downloadMediaMessage(
        messageToProcess as any,
        "stream",
        {},
        {
          reuploadRequest: sock.updateMediaMessage,
          logger: sock.logger,
        },
      );
      const stickerBuffer = await Sticker.convertToSticker(
        msg as any,
        mediaStream as Readable,
      );

      await sock.sendMessage(
        msg.key?.remoteJid!,
        {
          sticker: stickerBuffer,
        },
        {
          quoted: msg as any,
        },
      );
    } catch (error: any) {
      await reportError(sock, error);
    }
  },
};
