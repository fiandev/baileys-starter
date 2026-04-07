import { env } from "../helpers/env";

export interface LlmMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface LlmCompletion {
    choices: Array<{ message: { content: string } }>;
}

export class DeepSeekProvider {
    private apiKey: string;
    private baseUrl = "https://api.deepseek.com/chat/completions";
    private model = "deepseek-chat";

    constructor() {
        this.apiKey = env("LLM_APIKEY");
    }

    async chat(messages: LlmMessage[]): Promise<LlmCompletion> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                stream: false,
            }),
        });

        if (!response.ok) {
            console.error(response);
            throw new Error(`DeepSeek API error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            choices: [{ message: { content: data.choices?.[0]?.message?.content || "" } }],
        };
    }
}
