import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

type Command = {
  data: SlashCommandBuilder;
  // eslint-disable-next-line no-unused-vars
  execute: (message: ChatInputCommandInteraction) => void;
};

export default Command;
