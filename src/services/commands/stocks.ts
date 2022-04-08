import { Message } from 'discord.js';
import Quote from '../../interfaces/stocks/quote';
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

// which is better? Not sure.
const asyncResponse = (action: string) => {
  return `Fetching your ${action}...`;
};

export = [
  {
    name: 'signup',
    description:
      'Register with stockbot and start playing with a simulate market!',
    async execute(message: Message, args: string[]) {
      const messageResponse = await message.reply(asyncResponse('new account'));
      if (args.length !== 0) {
        await message.reply('This command takes NO arguments!');
        return;
      }

      const Result = await SignUp(message.author);

      messageResponse.edit(Result);
    },
  },
  {
    name: 'stock',
    description: 'test',
    async execute(message: Message, args: string[]) {
      if (args.length === 0) {
        await message.reply('PLEASE INCLUDE A STOCK SYMBOL');
        return;
      }
      const SYMBOL = args[0].toUpperCase();

      GetQuote(SYMBOL).then((data: Quote) => {
        message.channel.send(
          `${SYMBOL}: $${data.c} ${formatPercentage(
            ((data.c - data.pc) / data.pc) * 100
          )}`
        );
      });
    },
  },
  {
    name: 'balance',
    description: "Gets user's current balance",
    async execute(message: Message) {
      const messageResponse = await message.reply(asyncResponse('balance'));
      const val = await GetBalance(message.author);

      messageResponse.edit(formatNumber(val));
    },
  },
  {
    name: 'portfolio',
    description: 'calculates your portfolio value',
    async execute(message: Message, args: string[]) {
      const messageResponse = await message.reply(asyncResponse('portfolio'));

      const result = await CalculatePortforlio(message.author);
      messageResponse.edit(result);
    },
  },
  {
    name: 'buy',
    description: 'calculates your portfolio value',
    async execute(message: Message, args: string[]) {
      try {
        const messageResponse = await message.reply(asyncResponse('stock'));
        const SYMBOL = args[0].toUpperCase();
        const quantity = parseInt(args[1]);

        const quote = await GetQuote(SYMBOL);

        const result = await BuyStock(message.author, quote, SYMBOL, quantity);

        messageResponse.edit(result);
        return;
      } catch (e) {
        throw e;
      }
    },
  },
  {
    name: 'sell',
    description: 'Sell a stock',
    async execute(message: Message, args: string[]) {
      try {
        const messageResponse = await message.reply(asyncResponse('SellOrder'));
        // if (args.length === 0) {
        //   await messageResponse.edit('No symbol specified')
        //   return
        // }
        const SYMBOL = args[0].toUpperCase();
        const quantity = parseInt(args[1]);
        const result = await SellStock(message.author, SYMBOL, quantity);

        messageResponse.edit(result);
      } catch (e: any) {
        logger.error(e.message);
        throw e;
      }
    },
  },
  {
    name: 'list',
    description: 'Lists the stocks/crypto in your portfolio',
    async execute(message: Message, args: string[]) {
      try {
        const messageResponse = await message.reply(
          asyncResponse(asyncResponse('stock list'))
        );
        const result = await ListStock(message.author);
        messageResponse.edit(result);
      } catch (e: any) {
        logger.info('Error while listing stocks: ' + e.message);
        throw e;
      }
    },
  },
];
