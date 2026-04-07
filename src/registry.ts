import { ping } from "./commands/ping";
import { sticker } from "./commands/sticker";
import { menu } from "./commands/menu";
import { checkAfk } from "./middlewares/checkAfk";
import { afk } from "./commands/utility/afk";

export const commands = [
    ping,
    sticker,
    menu,
    afk
];

export const middlewares = [
    checkAfk
];