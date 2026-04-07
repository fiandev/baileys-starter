import nodemailer from "nodemailer";
import { env } from "../helpers/env";

const SMTP_HOST = env("SMTP_HOST", "");
const SMTP_PORT = parseInt(env("SMTP_PORT", "587"));
const SMTP_USER = env("SMTP_USERNAME", "");
const SMTP_PASS = env("SMTP_PASSWORD", "");
const SMTP_FROM = env("SMTP_FROM", "");

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

export interface SendMailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export async function sendMail({ to, subject, text, html }: SendMailOptions) {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        throw new Error("SMTP not configured");
    }

    return transporter.sendMail({
        from: SMTP_FROM || SMTP_USER,
        to,
        subject,
        text,
        html,
    });
}

export default transporter;