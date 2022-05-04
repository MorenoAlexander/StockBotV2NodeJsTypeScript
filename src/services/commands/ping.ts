import { Message } from 'discord.js';

export = [
  {
    name: 'ping',
    description: 'Pong!',
    execute(message: any) {
      message.channel.send('Pong.');
    },
  },
  {
    name: 'pong',
    description: 'Ping!',
    execute(message: Message) {
      message.channel.send('Ping!');
    },
  },
];
