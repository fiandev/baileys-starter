import Logger from "@ptkdev/logger";
import type { WAMessage, WASocket } from "baileys";
import { env } from "../helpers/env";
import { dirname } from "path";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { type SenderIdentity } from "./senderIdentity";

const log = new Logger();

export const saveLog = async (msg: WAMessage, sock: WASocket, sender: SenderIdentity) => {
    const LOG_DIR = dirname(env("LOG_PATH"));
    const time = new Date();
    const date = time.toISOString().split("T")[0];
    const LOG_FILE = `${LOG_DIR}/${date}.log`;
    const message =
        msg?.message?.conversation ||
        msg?.message?.extendedTextMessage?.text ||
        msg?.message?.imageMessage?.caption ||
        msg?.message?.videoMessage?.caption ||
        "";

    if (!existsSync(LOG_DIR)) {
        mkdirSync(LOG_DIR, { recursive: true });
    }

    let logMessage = `[${time.toLocaleString()}]: ${message.trim().replace(/\n/g, " ")} name=${sender.name} jid=${sender.personalJid}`;

    if (sender.isNewslater) {
        logMessage += ` newslatterName=${sender.newslatter?.name} newslatterJid=${sender.jid}`;
    }

    if (sender.isGroup) {
        logMessage += ` groupName=${sender.groupName} groupJid=${sender.jid}`;
    }

    appendFileSync(LOG_FILE, `\n${logMessage}`, "utf-8");

    log.info(logMessage);
}

export const getLogs = (limit: number = 0): string[] => {
    const LOG_DIR = dirname(env("LOG_PATH"));
    const time = new Date();
    const date = time.toISOString().split("T")[0];
    const LOG_FILE = `${LOG_DIR}/${date}.log`;

    if (existsSync(LOG_FILE)) {
        let logs = [];
        let content = readFileSync(LOG_FILE, "utf-8");
        logs = content.split("\n").reverse();

        if (limit) logs = logs.slice(0, limit);

        return logs;
    }

    return [];
}

export default log;