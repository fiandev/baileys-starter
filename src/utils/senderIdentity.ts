import type { GroupMetadata, GroupParticipant, NewsletterMetadata, proto, WASocket } from "baileys";
import { prisma } from "../lib/prisma";
import { bot } from "../config/bot";

export interface SenderIdentity {
  phone: string;
  from: string;
  user: {
    name: string;
    id: string;
    phone: string;
    age: number;
    isPremium: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  isAdmin: boolean;
  isGroup: boolean;
  isOwner: boolean;
  isPremium: boolean;
  isNewslater: boolean;
  groupName: string;
  group: GroupMetadata | null;
  newslatter: NewsletterMetadata | null;
  jid: string;
  rawPhone: string;
  isRegistered: boolean;
  type: string;
  isBot: boolean;
  name: string;
  personalJid: string;
}

export async function senderIdentity(message: proto.IWebMessageInfo, sock: WASocket) {
  const senderJid = message.key?.remoteJid!;
  const isGroup = senderJid?.endsWith("@g.us") || false;
  const isNewslater = senderJid.includes("@newsletter") || false;

  let from = isGroup ? message.key?.participant : message.key?.remoteJid;

  if (isGroup && (message.key as any).participantAlt) {
    from = (message.key as any).participantAlt;
  } else if (!isGroup && (message.key as any).remoteJidAlt) {
    from = (message.key as any).remoteJidAlt;
  }

  const groupMetadata = isGroup ? await sock.groupMetadata(senderJid) : null;
  const newsMetadata = isNewslater ? await sock.newsletterMetadata("jid", senderJid) : null;

  const phone = from?.split("@")[0] || "";
  const user = await prisma.user.findUnique({ where: { phone } });

  const config = bot;
  const authors = config.authors;
  const isPremium = user?.isPremium || false;
  const isOwner = authors.includes(phone);
  const isAdmin = groupMetadata ?
    groupMetadata?.participants?.find((v: GroupParticipant) => v.id === message.key.id)?.isAdmin : false;

  return {
    phone,
    from,
    user,
    isAdmin,
    isGroup,
    isOwner,
    isNewslater,
    isPremium,
    groupName: groupMetadata?.subject || "",
    group: groupMetadata || null,
    newslatter: newsMetadata || null,
    jid: senderJid,
    rawPhone: from,
    isRegistered: !!user,
    type: isGroup ? "group" : "user",
    isBot: message.key?.fromMe || false,
    name: user ? user.name : message.pushName,
    personalJid: isGroup ? message.key?.participant : message.key?.remoteJid,
  };
}
