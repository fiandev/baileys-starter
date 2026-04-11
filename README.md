# Baileys Starter

A scalable, type-safe WhatsApp bot template built with TypeScript and Baileys. Designed for maintainability and developer experience—no stress, just clean code.

## Why Baileys Starter?

- **Strict TypeScript** - Full type safety with interfaces for commands, middlewares, and messages
- **Modular Architecture** - Easy to scale from a handful of commands to hundreds
- **Middleware Pipeline** - Reusable checks for auth, permissions, rate limiting
- **Arona CLI** - Scaffold new commands in seconds
- **Low Cortisol Development** - Clear patterns, predictable structure, no magic

## Features

Here is a detailed list of the bot's commands and their functionalities:

**General:**

- `menu`: Display the main menu.
- `ping`: Check the bot's responsiveness.
- `sticker`: Create a sticker from an image.

**Utility:**

- `afk`: Set yourself as AFK (Away From Keyboard).

**Middlewares:**

- `checkAfk`: Automatically replies when a user is AFK.

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/fiandev/baileys-starter.git
    ```
2.  Install **FFmpeg** (required for media processing):
    - Ubuntu/Debian: `sudo apt install ffmpeg`
    - macOS: `brew install ffmpeg`
    - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
3.  Install dependencies using your favorite package manager:
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    # or
    bun install
    ```

## Docker

1.  Create a `.env` file from `.env.example`:
    ```bash
    cp .env.example .env
    ```
2.  Build and run the container:
    ```bash
    docker-compose up --build
    ```

To stop the container:
```bash
docker-compose down
```

## Usage

1.  Build the project:
    ```bash
    npm run build
    ```
2.  Start the bot:
    ```bash
    npm run start
    ```
    or with pnpm:
    ```bash
    pnpm start
    ```
    or with bun:
    ```bash
    bun run start:bun
    ```

## Arona CLI

Arona is a CLI tool to quickly generate files for your bot.

### Usage

```bash
bun arona make:<type> <Name>
```

### Available Types

| Type        | Output Directory   |
|-------------|--------------------|
| `command`   | `src/commands`     |
| `config`    | `src/config`       |
| `middleware`| `src/middlewares`  |
| `helper`    | `src/helpers`      |
| `utils`     | `src/utils`        |

### Examples

Create a new command:
```bash
bun arona make:command Ping
```

Create a new middleware:
```bash
bun arona make:middleware CheckOwner
```

Create a new config:
```bash
bun arona make:config ApiKey
```

## Architecture

### Registry (`src/registry.ts`)

All commands and middlewares must be registered in `src/registry.ts`:

```typescript
export const commands = [ping, sticker, menu, afk];
export const middlewares = [checkAfk];
```

**Commands** are executed when a user sends a message matching the command name or aliases.

**Middlewares** are executed before every command. They can validate requests, modify data, or block execution by returning false. Useful for: authentication, permission checks, rate limiting, etc.

### Creating Commands

Commands are defined using the `Command` interface:

```typescript
import { type Command } from "../../types/Command";

export const myCommand: Command = {
  name: "mycommand",
  description: "Description here",
  usage: "<args>",
  cmd: ["mycommand", "alias"],
  category: "general",
  isMedia: false,
  isOnlyOwner: false,
  isOnlyGroup: false,
  isOnlyAdmin: false,
  isPremium: false,
  isAuth: false,
  async execute(sock, msg, args) {
    // Your logic here
  },
};
```

### Creating Middlewares

Middlewares are defined using the `Middleware` interface:

```typescript
import { type Middleware } from "../../types/Middleware";

export const myMiddleware: Middleware = {
  name: "mymiddleware",
  async execute(sock, msg) {
    // Return true to continue, false to block
    return true;
  },
  isAuth: false,
  isGroupOnly: false,
  isOnlyOwner: false,
  isOnlyAdmin: false,
};
```

## Configuration

This template uses two configuration sources:

### 1. Environment Variables (`.env`)

1.  Rename `.env.example` to `.env`.
2.  Fill in the required environment variables.

### 2. Static Configuration (`src/config/bot.ts`)

The primary static configuration is located in `src/config/bot.ts`. Edit this file to customize your bot's behavior:

```typescript
export const bot = {
  botName: "<your bot name>",
  authorName: "fiandev",
  prefix: /^(!|\/|\.|\$)/, // !, /, ., $
  argsSeparator: /(\,|\||\s)/, // , | space
  delayMessage: 1000, // 1s or 1000ms
  authors: ["<your phone number>"], // 629xxxxxxxxxx
  privateParticipants: ["xxxxxxxxxx@lid"], // xxxxxxxxx@lid
  privateGroups: ["xxxxxxxxxx@g.us", "xxxxxxxxxx@g.us"], // xxxxxxxxxx@g.us
  nsfw: false,
  notifyChannels: ["xxxxxxxxxx@g.us"], // xxxxxxxxxx@g.us
  premiums: ["<your phone number>"], // 629xxxxxxxxxx
  botNumber: "<your phone number>", // 629xxxxxxxxxx
  ephemeral: 86400, // 86400 = 1 day
};
```

## Folder Structure

```
.
├── src
│   ├── commands       # Command handlers
│   ├── config         # Static configurations
│   ├── exceptions     # Custom exceptions
│   ├── helpers        # Helper functions
│   ├── includes       # Included modules
│   ├── lib            # Libraries
│   ├── middlewares    # Middleware handlers
│   ├── types          # TypeScript types
│   └── utils          # Utility functions
├── types              # Global type definitions
├── index.ts           # Entry point
└── ...
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

MIT License - see [LICENSE](LICENSE) file.
