import moment from "moment";
import { type Command } from "../../types/Command";
import UnexpectedError from "../exceptions/UnexpectedError";
import { prisma } from "../lib/prisma";
import { os } from "../utils/os";

export const ping: Command = {
  name: "ping",
  cmd: ["ping", "p", "?"],
  description: "test ping",
  async execute(sock, msg) {
    try {
      let server = os();
      const users = await prisma.user.count();

      let text = `Pong!

  *Latency:* ${moment().diff(global.timestamp, "ms")} ms
  *Log Level:* ${sock.logger.level}
  *Registered Users:* ${users}
  *Server:* ${server.ip}
  *Platform:* ${server.platform}
  *Runtime:* ${server.runtime}
  *OS:* ${server.os}
  *CPU:* ${server.cpu}
  *Memory:* ${server.memory}
  *Uptime:* ${server.uptime}`;

      await sock.sendMessage(
        msg.key.remoteJid!,
        { text },
        { quoted: msg as any },
      );
    } catch (err) {
      console.log(err);
      throw new UnexpectedError("Gagal menangani command ping");
    }
  },
};
