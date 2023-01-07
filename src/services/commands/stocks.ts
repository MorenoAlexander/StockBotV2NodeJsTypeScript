import { Message, SlashCommandBuilder } from 'discord.js';
import Command from '../../interfaces/common/command';
import { formatNumber, formatPercentage } from '../../utils/formatFunc';
import logger from '../../utils/WinstonLogger';
import {
  BuyStock,
  CalculatePortforlio,
  GetBalance,
  GetQuote,
  ListStock,
  SellStock,
  SignUp,
} from '../StockDBService';

const asyncResponse = (action: string, preText = 'Fetching your') => {
  return `${preText} ${action}...`;
};

export = [
  {
    data: new SlashCommandBuilder()
      .setName('signup')
      .setDescription(
        'Register with stockbot and start playing with a simulate market!'
      ),
    async execute(message: Message, args?: string[]) {
      const messageResponse = await message.reply(asyncResponse('new account'));
      if (args?.length !== 0) {
        await message.reply('This command takes NO arguments!');
        return;
      }

      const Result = await SignUp(message.author);

      await messageResponse.edit(Result);
    },
  },
  {
    data: new SlashCommandBuilder().setName('stock').setDescription('test'),
    async execute(message: Message, args: string[]) {
      if (args.length === 0) {
        await message.reply('PLEASE INCLUDE A STOCK SYMBOL');
        return;
      }
      const SYMBOL = args[0].toUpperCase();

      const data = await GetQuote(SYMBOL);
      await message.channel.send(
        `${SYMBOL}: $${data.c} ${formatPercentage(
          ((data.c - data.pc) / data.pc) * 100
        )}`
      );
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('balance')
      .setDescription("Gets users's current balance"),
    async execute(message: Message) {
      const messageResponse = await message.reply(asyncResponse('balance'));
      const val = await GetBalance(message.author);

      await messageResponse.edit(formatNumber(val));
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('portfolio')
      .setDescription('calculates your portfolio value'),
    async execute(message: Message) {
      const messageResponse = await message.reply(asyncResponse('portfolio'));

      const result = await CalculatePortforlio(message.author);
      await messageResponse.edit(result);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('buy')
      .setDescription('Buy stocks from the market'),
    async execute(message: Message, args: string[]) {
      const messageResponse = await message.reply(asyncResponse('stock'));
      const SYMBOL = args[0].toUpperCase();
      const quantity = parseInt(args[1], 10);

      const quote = await GetQuote(SYMBOL);

      const result = await BuyStock(message.author, quote, SYMBOL, quantity);

      await messageResponse.edit(result);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('sell')
      .setDescription('Sell a stock')
      .addStringOption((option) =>
        option
          .setName('symbol')
          .setDescription('The stocker ticker to sell')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('quantity')
          .setDescription('The quanity of stocks to sell')
          .setRequired(true)
      ),
    async execute(interaction) {
      try {
        const messageResponse = await message.reply(asyncResponse('SellOrder'));
        const SYMBOL = args[0].toUpperCase();
        const quantity = parseInt(args[1], 10);
        const result = await SellStock(message.author, SYMBOL, quantity);

        await messageResponse.edit(result);
      } catch (e: unknown) {
        logger.error(e);
        throw e;
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('list')
      .setDescription('List the stocks/crypo in your portfolio'),
    async execute(interaction) {
      try {
        await interaction.reply('Getting your stock list...');
        const result = await ListStock(interaction.user);
        await interaction.editReply(result);
      } catch (e: unknown) {
        logger.info(`Error while listing stocks: ${e}`);
        throw e;
      }
    },
  },
] as Command[];
