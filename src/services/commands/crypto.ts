import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { z } from 'zod';
import Command from '../../interfaces/common/command';
import ICrypto from '../../interfaces/crypto/crypto';
import { formatPercentage } from '../../utils/formatFunc';
import logger from '../../utils/WinstonLogger';
import { BuyCrypto, GetCryptoQuote, SellCrypto } from '../CryptoDBService';

export = [
  {
    data: new SlashCommandBuilder()
      .setName('crypto')
      .setDescription('get a quote for a crypto currency')
      .addStringOption((option) =>
        option
          .setName('symbol')
          .setDescription('crypto symbol')
          .setRequired(true)
      ),
    execute: async (interaction) => {
      try {
        await interaction.deferReply();
        const SYMBOL = z
          .string()
          .min(1)
          .trim()
          .transform((val) => val.toUpperCase())
          .parse(interaction.options.getString('symbol'));

        const data = await GetCryptoQuote(SYMBOL);

        logger.info(JSON.stringify(data));

        interaction.editReply(
          `${SYMBOL}: $${data.c} ${formatPercentage(
            (((data.c as number) - (data.o as number)) / (data.o as number)) *
              100
          )}`
        );
      } catch (error) {
        logger.error(error);
        await interaction.editReply(
          '`Error getting crypto currency quote... Please try again later.'
        );
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('crypto-buy')
      .setDescription('buy crypto currency')
      .addStringOption((option) =>
        option
          .setName('symbol')
          .setDescription('crypto symbol')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('quantity')
          .setDescription('Number of tokens to buy')
          .setRequired(true)
      ),
    execute: async (interaction) => {
      try {
        await interaction.reply('Buying your crypto currency...');

        const SYMBOL = z
          .string()
          .min(1)
          .trim()
          .transform((val) => val.toUpperCase())
          .parse(interaction.options.getString('symbol'));

        const quantity = z
          .number()
          .positive()
          .parse(parseFloat(interaction.options.getString('quantity') || '1'));

        await interaction.editReply(
          await BuyCrypto(interaction.user, quantity, SYMBOL)
        );
      } catch (e) {
        logger.error(`Error buying crypto currency: ${JSON.stringify(e)}`);
        await interaction.editReply(
          'Error buying crypto currency... Please try again later.'
        );
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('crypto-sell')
      .setDescription('sell crypto currency')
      .addStringOption((option) =>
        option
          .setName('symbol')
          .setDescription('stock symbol')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option.setName('quantity').setDescription('quantity').setRequired(true)
      ),
    execute: async (interaction: ChatInputCommandInteraction) => {
      try {
        await interaction.reply('Selling your crypto currency...');

        const SYMBOL = z
          .string()
          .min(1)
          .trim()
          .transform((v) => v.toUpperCase())
          .parse(interaction?.options?.getString('stock'));

        // zod schema to transform a string to a number and ensure that it is positive
        const quantity = z
          .number()
          .positive()
          .parse(
            parseInt(interaction?.options?.getString('quantity') || '1', 10)
          );

        await interaction.editReply(
          await SellCrypto(interaction.user, quantity, SYMBOL)
        );
      } catch (e) {
        logger.error(e);
      }
    },
  },
] as Command[];
