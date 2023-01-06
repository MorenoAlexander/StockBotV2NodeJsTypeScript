import { Message, SlashCommandBuilder } from 'discord.js';

export = [
  {
    data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
    execute(message: Message) {
      message.channel.send('Pong.');
    },
  },
  {
    data: new SlashCommandBuilder().setName('pong').setDescription('Ping!'),
    execute(message: Message) {
      message.channel.send('Ping!');
    },
  },
];
