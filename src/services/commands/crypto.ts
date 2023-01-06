import {
  ChatInputCommandInteraction,
  CommandInteraction,
  CommandInteractionOption,
  Interaction,
  SlashCommandBuilder,
} from 'discord.js';
import { number, z } from 'zod';
import Command from '../../interfaces/common/command';
import ICrypto from '../../interfaces/crypto/crypto';
import { formatPercentage } from '../../utils/formatFunc';
import logger from '../../utils/WinstonLogger';
import { BuyCrypto, GetCryptoQuote, SellCrypto } from '../CryptoDBService';

export = [
  {
    data: new SlashCommandBuilder()
      .setName('crypto')
      .setDescription('get a quote for a crypto currency'),
    async execute(interaction) {
      if (args.length === 0) {
        await message.reply('PLEASE INCLUDE A CRYPTO SYMBOL');
        return;
      }
      const SYMBOL = args[0].toUpperCase();

      GetCryptoQuote(SYMBOL).then((data: ICrypto) => {
        message.channel.send(
          `${SYMBOL}: $${data.c} ${formatPercentage(
            (((data.c as number) - (data.o as number)) / (data.o as number)) *
              100
          )}`
        );
      });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('crypto-buy')
      .setDescription('buy crypto currency')
      .addStringOption((option) =>
        option.setName('stock').setDescription('stock symbol').setRequired(true)
      ),
    async execute(interaction: ChatInputCommandInteraction) {
      try {
        const messageResponse = await interaction.reply(
          'Buying your crypto currency...'
        );
        const SYMBOL = args[0].toUpperCase();
        const quantity = parseFloat(args[1]);

        await messageResponse.edit(
          await BuyCrypto(message.author, quantity, SYMBOL)
        );
      } catch (e) {
        logger.error(e);
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName('crypto-sell')
      .setDescription('sell crypto currency')
      .addStringOption((option) =>
        option.setName('stock').setDescription('stock symbol').setRequired(true)
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
];
