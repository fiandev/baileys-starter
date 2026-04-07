import moment from "moment";
import { type Command } from "../../types/Command";
import UnexpectedError from "../exceptions/UnexpectedError";
import { prisma } from "../lib/prisma";
import { getRandomCharImagePath } from "../utils/random-chara";
import { os } from "../utils/os";
import { time } from "../utils/time";
import fs from "fs";

export const ping: Command = {
  name: "ping",
  cmd: ["ping", "p", "?"],
  description: "test ping",
  async execute(sock, msg) {
    try {
      let server = os();
      let now = time();
      const users = await prisma.user.count();
      server.memory = "16 GB";
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

      let imageBuffer = fs.readFileSync(getRandomCharImagePath());

      if (now.localeDay == "Jumat" && now.hour >= 11 && now.hour <= 12) {
        imageBuffer = fs.readFileSync("./assets/images/events/gak-jumatan.jpg");
      }

      await sock.sendMessage(
        msg.key.remoteJid!,
        {
          image: imageBuffer,
          caption: text,
        },
        { quoted: msg as any },
      );
    } catch (err) {
      console.log(err);

      throw new UnexpectedError("Gagal menangani command ping");
    }
  },
};
