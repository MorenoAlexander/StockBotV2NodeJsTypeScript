import { Message } from 'discord.js';

export = [
  {
    name: 'version',
    description: 'returns the current version of Stock Bot',
    execute(message: Message) {
      return message.channel.send(
        `VERSION: ${process.env.VERSION}, DATE: ${process.env.DATE}`
      );
    },
  },
];
