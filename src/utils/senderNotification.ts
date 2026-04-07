import { type WASocket, type proto } from "baileys";
import { bot } from "../config/bot";

export const senderNotification = async (sock: WASocket, text: string) => {
  for (let channel of bot.notifyChannels) {
    await sock.sendMessage(channel, {
      text,
    });
  }
};
