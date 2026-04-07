# Baileys Starter

Baileys Starter is a versatile WhatsApp bot built with TypeScript and powered by the Baileys library. It offers a wide range of features, from fun and games to powerful tools and utilities.

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
2.  Install dependencies using your favorite package manager:
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    # or
    bun install
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
│   ├── commands
│   ├── config
│   ├── exceptions
│   ├── helpers
│   ├── includes
│   ├── lib
│   ├── middlewares
│   ├── types
│   └── utils
├── types
├── index.ts
└── ...
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
