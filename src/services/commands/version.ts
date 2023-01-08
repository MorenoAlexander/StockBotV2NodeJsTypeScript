import { Message, SlashCommandBuilder } from 'discord.js';

export = [
  {
    data: new SlashCommandBuilder()
      .setName('version')
      .setDescription('returns the current version of Stock Bot'),
    execute(message: Message) {
      return message.channel.send(
        `VERSION: ${process.env.VERSION}, DATE: ${process.env.DATE}`
      );
    },
  },
];
