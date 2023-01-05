import { Message, SlashCommandBuilder } from 'discord.js';
import ICrypto from '../../interfaces/crypto/crypto';
import { formatPercentage } from '../../utils/formatFunc';
import logger from '../../utils/WinstonLogger';
import { BuyCrypto, GetCryptoQuote, SellCrypto } from '../CryptoDBService';

export = [
  {
    data: new SlashCommandBuilder()
      .setName('crypto')
      .setDescription('get a quote for a crypto currency'),
    async execute(message: Message, args: string[]) {
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
      .setDescription('buy crypto currency'),
    async execute(message: Message, args: string[]) {
      try {
        const messageResponse = await message.reply(
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
    name: 'crypto-sell',
    description: 'Sell Crypto Currency',
    async execute(message: Message, args: string[]) {
      try {
        const messageResponse = await message.reply(
          'Selling your crypto currency...'
        );
        const SYMBOL = args[0].toUpperCase();
        const quantity = parseFloat(args[1]);

        await messageResponse.edit(
          await SellCrypto(message.author, quantity, SYMBOL)
        );
      } catch (e) {
        logger.error(e);
      }
    },
  },
];
