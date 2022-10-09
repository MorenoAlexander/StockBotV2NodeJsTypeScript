import type { Message } from 'discord.js';

type Command = {
  name: string;
  description: string;
  // eslint-disable-next-line no-unused-vars
  execute: (args: Message) => void;
};

export default Command;
