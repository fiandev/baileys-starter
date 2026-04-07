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
