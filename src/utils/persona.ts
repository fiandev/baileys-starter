import { existsSync, readFileSync } from "fs";
import { join } from "path";

const PERSONA_DIR = join(__dirname, "../agents/persona");

export function getPersonaPrompt(char: string): string {
    const SELECTED_PERSONA_DIR = join(PERSONA_DIR, char);

    if (!existsSync(SELECTED_PERSONA_DIR)) {
        throw new Error(`Persona ${char} not found`);
    }

    const singleFile = join(SELECTED_PERSONA_DIR, "PERSONA.md");
    if (existsSync(singleFile)) {
        return readFileSync(singleFile, "utf-8");
    }

    const identity = readFileSync(join(SELECTED_PERSONA_DIR, "IDENTITY.md"), "utf-8");
    const soul = readFileSync(join(SELECTED_PERSONA_DIR, "SOUL.md"), "utf-8");
    const tools = readFileSync(join(SELECTED_PERSONA_DIR, "TOOLS.md"), "utf-8");

    return `${identity}\n\n${soul}\n\n${tools}`;
}