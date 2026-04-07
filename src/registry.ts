import { ping } from "./commands/ping";
import { sticker } from "./commands/sticker";
import { menu } from "./commands/menu";
import { afk } from "./commands/utility/afk";

import { checkAfk } from "./middlewares/checkAfk";

/**
 * Command Registry
 * 
 * All bot commands must be registered here.
 * Commands are executed when a user sends a message matching the command name or aliases.
 * 
 * @see types/Command.ts for Command interface
 */
export const commands = [
    ping,
    sticker,
    menu,
    afk
];

/**
 * Middleware Registry
 * 
 * Middlewares are executed before every command.
 * They can validate requests, modify data, or block execution by returning false.
 * Useful for: authentication, permission checks, rate limiting, etc.
 * 
 * @see types/Middleware.ts for Middleware interface
 */
export const middlewares = [
    checkAfk
];