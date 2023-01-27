import { SlashCommandBuilder } from 'discord.js';
import { z } from 'zod';
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
    async execute(interaction) {
      await interaction.reply(asyncResponse('new account'));

      const Result = await SignUp(interaction.user);

      await interaction.editReply(Result);
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('stock')
      .setDescription('Get a quote for a stock')
      .addStringOption((option) =>
        option
          .setName('symbol')
          .setDescription('stock symbol')
          .setRequired(true)
      ),
    async execute(interaction) {
      try {
        await interaction.deferReply();
        const SYMBOL = z
          .string()
          .min(1)
          .transform((v) => v.toUpperCase())
          .parse(interaction.options.getString('symbol'));

        const data = await GetQuote(SYMBOL);
        await interaction.editReply(
          `${SYMBOL}: $${data.c} ${formatPercentage(
            ((data.c - data.pc) / data.pc) * 100
          )}`
        );
      } catch (error) {
        interaction.reply('Error getting quote');
        logger.error(error);
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('balance')
      .setDescription("Gets users's current balance"),
    async execute(interaction) {
      try {
        await interaction.reply('Fetching your balance...');
        const val = await GetBalance(interaction.user);

        await interaction.editReply(formatNumber(val));
      } catch (e: unknown) {
        logger.error(`Error while getting user balance: ${e}`);
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('portfolio')
      .setDescription('calculates your portfolio value'),
    async execute(interaction) {
      try {
        await interaction.reply('Calculating your portfolio...');
        const result = await CalculatePortforlio(interaction.user);
        await interaction.editReply(result);
      } catch (e: unknown) {
        logger.error(`Error calculating portfolio: ${e}`);
        await interaction.editReply(
          'Error calculating portfolio... Please try again later'
        );
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('buy')
      .setDescription('Buy stocks from the market')
      .addStringOption((option) =>
        option
          .setName('symbol')
          .setDescription('The stock ticker to buy')
          .setRequired(true)
      )
      .addStringOption((input) =>
        input
          .setName('quantity')
          .setDescription('The quantity of stocks to buy')
          .setRequired(true)
      ),
    execute: async (interaction) => {
      try {
        await interaction.reply('Buying your stock...');
        const SYMBOL = z
          .string()
          .min(1)
          .transform((v) => v.toUpperCase())
          .parse(interaction.options.getString('symbol'));
        const quantity = z
          .number()
          .positive()
          .parse(
            parseInt(interaction.options.getString('quantity') || '1', 10)
          );

        const quote = await GetQuote(SYMBOL);

        const result = await BuyStock(
          interaction.user,
          quote,
          SYMBOL,
          quantity
        );

        await interaction.editReply(result);
      } catch (e: unknown) {
        logger.error(`Error while buying stocl: ${e}`);
        await interaction.editReply(
          'Error while buying your stock... Please try again later.'
        );
      }
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
        await interaction.reply(`Processing your Sell order...`);
        const SYMBOL = z
          .string()
          .min(1)
          .transform((v) => v.toUpperCase())
          .parse(interaction.options.getString('symbol'));

        const quantity = z
          .number()
          .positive()
          .parse(
            parseInt(interaction.options.getString('quantity') || '0', 10)
          );

        const result = await SellStock(interaction.user, SYMBOL, quantity);

        await interaction.editReply(result);
      } catch (e: unknown) {
        await interaction.editReply('Error occurred while selling your stock');
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
