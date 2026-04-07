import { type WASocket, type proto } from "baileys";
import { bot } from "../config/bot";

export const reportError = async (sock: WASocket, error: Error) => {
  for (let author of bot.authors) {
    await sock.sendMessage(`${author}@s.whatsapp.net`, {
      text: `Bot encountered an error!\n\n
error: _${error.message}_
stack: _${error.stack}_
time: ${new Date().toLocaleString()}`,
    });
  }
};
