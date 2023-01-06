/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-dynamic-require */
import Discord, { ClientOptions, Collection, Events, Routes } from 'discord.js';
import type { Application, Request, Response } from 'express';
import fs from 'fs';
import Command from '../interfaces/common/command';
import logger from '../utils/WinstonLogger';

export class DiscordManager extends Discord.Client {
  commands: Collection<string, Command> | null;

  app!: Application;

  public constructor(
    options: ClientOptions = {
      intents: 0,
    }
  ) {
    super(options);
    this.commands = null;

    this.on('ready', () => {
      logger.info(
        `Discord client established as ${
          this?.user?.tag != null ? this.user.tag : 'No user'
        }`
      );
    });

    // commands
    this.collectCommands();
  }

  collectCommands() {
    this.commands = new Collection();

    const commandFiles = fs
      .readdirSync(`${__dirname}/commands`)
      .filter((file) => file.endsWith('.js'));

    commandFiles.forEach((file) => {
      // eslint-disable-next-line global-require
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // eslint-disable-next-line global-require
      const commands: Command[] = require(`${__dirname}/commands/${file}`);
      commands.forEach((cmd) => {
        this.commands?.set(cmd.data.name, cmd);
      });
    });
  }

  logIn(apiKey: string) {
    this.login(apiKey).then(
      (success: string) => {
        logger.info(
          `Discord client connection successfully established: ${success}`
        );
      },
      (rejected: unknown) => {
        logger.error(rejected);
      }
    );
  }

  setUp(app: Application) {
    this.app = app;

    this.on('message', async (message) => {
      let args = [];
      if (
        !message.content.startsWith(process.env.PREFIX as string) ||
        message.author.bot
      )
        return;

      args = message.content
        .slice((process.env.PREFIX as string).length)
        .trim()
        .split(/ +/);

      const command = args?.shift()?.toLowerCase();
      try {
        if (!this.commands?.has(command || '')) {
          await message.channel.send('No such command exists. Sorry!');
          return;
        }
        await this.commands?.get(command || '')?.execute(message, args);
      } catch (error) {
        logger.error(`Error during message:${error}`);
        await message.reply(
          'An error occurred while attempting to execute command. Sumting Wong!'
        );
      }
    });

    this.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      logger.log('info', `Interaction: ${interaction.commandName}`);
      const command = this.commands?.get(interaction.commandName);
      if (!command) {
        interaction.reply('No such command exists. Sorry!');
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    });

    return true;
  }

  registerCommands() {
    try {
      if (!process.env.DISCORD_ID) {
        throw new Error('No Discord ID provided. Cannot register commands.');
      }

      if (!this.commands) {
        throw new Error('No commands to register.');
      }

      const commandData = this.commands?.map((command) =>
        command.data.toJSON()
      );
      this.rest.put(Routes.applicationCommands(process.env.DISCORD_ID || ''), {
        body: commandData,
      });
    } catch (error) {
      logger.error(`Error registering commands: ${error}`);
    }
  }
}
export default DiscordManager;
