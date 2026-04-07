import { env } from "../helpers/env";
import fs from "fs";
import path from "path";

export interface LlmMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface LlmCompletion {
    choices: Array<{ message: { content: string } }>;
}

export class LlmProvider {
    private apiKey: string;
    private baseUrl = "https://api.deepseek.com/chat/completions";
    private storagePath: string;

    constructor() {
        this.apiKey = env("RETHINK_APIKEY");
        this.storagePath = path.join(process.cwd(), "storage");
    }

    listStorageFiles(): string[] {
        const files: string[] = [];

        const readDir = (dir: string, base: string = "") => {
            if (!fs.existsSync(dir)) return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const relPath = base ? `${base}/${entry.name}` : entry.name;
                if (entry.isDirectory()) {
                    readDir(path.join(dir, entry.name), relPath);
                } else {
                    files.push(relPath);
                }
            }
        };

        readDir(this.storagePath);
        return files;
    }

    readStorageFile(relativePath: string): string | null {
        const fullPath = path.join(this.storagePath, relativePath);
        if (!fs.existsSync(fullPath)) return null;
        try {
            return fs.readFileSync(fullPath, "utf-8");
        } catch {
            return null;
        }
    }

    writeStorageFile(relativePath: string, content: string): boolean {
        const fullPath = path.join(this.storagePath, relativePath);
        try {
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(fullPath, content, "utf-8");
            return true;
        } catch {
            return false;
        }
    }

    deleteStorageFile(relativePath: string): boolean {
        const fullPath = path.join(this.storagePath, relativePath);
        if (!fs.existsSync(fullPath)) return false;
        try {
            fs.unlinkSync(fullPath);
            return true;
        } catch {
            return false;
        }
    }

    async chat(messages: LlmMessage[]): Promise<LlmCompletion> {
        const systemPrompt = messages.findLast(m => m.role === "system")?.content || "";
        const userMessage = messages.findLast(m => m.role === "user")?.content || "";

        const histories = messages
            .slice(0, -1);

        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-oss-20b",
                temperature: 2,
                prompt: !histories ? systemPrompt : userMessage,
                history: [...histories],
            }),
        });

        if (!response.ok) {
            console.error(response);
            throw new Error(`LLM API error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            choices: [{ message: { content: data.content || "" } }],
        };
    }
}