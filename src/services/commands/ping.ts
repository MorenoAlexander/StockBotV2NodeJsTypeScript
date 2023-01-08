import { SlashCommandBuilder } from 'discord.js';
import Command from '../../interfaces/common/command';

export = [
  {
    data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
    execute(interaction) {
      interaction.reply('Pong.');
    },
  },
  {
    data: new SlashCommandBuilder().setName('pong').setDescription('Ping!'),
    execute(interaction) {
      interaction.reply('Ping!');
    },
  },
] as Command[];
