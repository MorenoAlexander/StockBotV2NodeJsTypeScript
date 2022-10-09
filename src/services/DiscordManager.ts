/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-dynamic-require */
import Discord, { ClientOptions } from 'discord.js';
import type { Application } from 'express';
import fs from 'fs';
import Command from '../interfaces/common/command';
import logger from '../utils/WinstonLogger';

export class DiscordManager extends Discord.Client {
  commands: Discord.Collection<string, Command> | null;

  app!: Application;

  public constructor(options: ClientOptions = {}) {
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
    this.commands = null;
    this.commands = new Discord.Collection();

    const commandFiles = fs
      .readdirSync(`${__dirname}/commands`)
      .filter((file) => file.endsWith('.js'));

    commandFiles.forEach((file) => {
      // eslint-disable-next-line global-require
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // eslint-disable-next-line global-require
      const commands: Command[] = require(`${__dirname}/commands/${file}`);
      commands.forEach((cmd) => {
        this.commands?.set(cmd.name, cmd);
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

    this.app.get('/tests', (_req: any, res: any) => {
      res.send('<h1>DISCORD REGISTERED</h1>');
    });

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
        await this.commands?.get(command || '')?.execute(message);
      } catch (error) {
        logger.error(`Error during message:${error}`);
        await message.reply(
          'An error occurred while attempting to execute command. Sumting Wong!'
        );
      }
    });

    return true;
  }
}

export default DiscordManager;
