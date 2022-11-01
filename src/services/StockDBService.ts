import { PrismaClient, StockLot, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import type { User as DiscordUser } from 'discord.js';
import Quote from '../interfaces/stocks/quote';
import { formatNumber, formatPercentage } from '../utils/formatFunc';
import logger from '../utils/WinstonLogger';
import FinnhubService from './FinnhubService';

const prismaClient = new PrismaClient();

const finnhubClient = FinnhubService.getInstance(process.env.FINNHUB_API_KEY);

async function GetUserData(userId: string): Promise<User | null> {
  try {
    return await prismaClient.user.findFirst({ where: { discordId: userId } });
  } catch (error) {
    logger.error(error);
    return null;
  }
}

async function GetUserStocksAsArray(userId: string) {
  return prismaClient.stockLot.findMany({
    where: { userId },
    orderBy: { stockSymbol: 'desc' },
  });
}

/**
 * creates a array of stock lots  with the same symbols. Primarily used by the Sell function
 * @param userId
 * @param symbol
 */
async function GetUserStocksAsMap(
  userId: string,
  symbol: string
): Promise<StockLot[]> {
  return prismaClient.stockLot.findMany({
    where: { userId, stockSymbol: symbol },
    orderBy: { date: 'asc' },
  });
}

async function createNewUser(user: DiscordUser) {
  const newUser = await prismaClient.user.create({
    data: {
      discordId: user.id,
      username: user.username,
      cash: 1000.0,
    },
  });
  await (
    await user.createDM()
  ).send(
    `Welcome to StockBot. Your account has been created successfully. Your starting balance is $1000.00.`
  );

  return `Welcome to the market! Your starting balance is ${formatNumber(
    newUser.cash.toNumber()
  )}`;
}

export async function SignUp(user: DiscordUser): Promise<string> {
  // get user, if in database: reset balance; otherwise, make new user and set their properties.

  let userInDB: User | null = await GetUserData(user.id);

  if (userInDB) {
    const dm = await user.createDM();
    dm.send(
      'You seem to be already signed up. This action will reset your account, are you sure?. Please respond with Y/N.'
    );
    dm.awaitMessages((m) => /[yYnN]/.test(m.content) && !m.author.bot, {
      max: 1,
      errors: ['time'],
      time: 60000,
    })
      .then(async (collected) => {
        if (collected.first()?.content.startsWith('Y')) {
          try {
            await prismaClient.stockLot.deleteMany({
              where: { userId: user.id },
            });
          } catch (err) {
            logger.error(err);
          }

          userInDB = await prismaClient.user.update({
            where: { discordId: user.id },
            data: { cash: 1000.0 },
          });
          await dm.send('You account has been reset successfully');
        } else {
          await dm.send("Okay. I've canceled your request.");
        }

        return `Welcome to the market! Your starting balance is ${formatNumber(
          userInDB?.cash.toNumber() || 0
        )}`;
      })
      .catch((collected) =>
        dm.send(`This request has failed due to ${collected.size}`)
      );
    return `Processing your request... Check your DMs.`;
  }
  // create new user and set properties.
  return createNewUser(user);
}

export async function GetQuote(SYMBOL: string) {
  return finnhubClient.Quote(SYMBOL);
}

export async function BuyStock(
  user: DiscordUser,
  quote: Quote,
  quotesymbol: string,
  orderCount: number
): Promise<string> {
  const userData = await GetUserData(user.id);

  if (!userData) {
    throw new Error('User is not valid. Sign up first.');
  }

  let balance = userData.cash.toNumber();
  const cost = quote.c * orderCount;

  if (balance >= cost) {
    balance -= cost;
    await prismaClient.user.update({
      where: { discordId: user.id },
      data: { cash: new Decimal(balance) },
    });

    await prismaClient.stockLot.create({
      data: {
        userId: user.id,
        date: new Date(),
        quantity: orderCount,
        priceBought: new Decimal(quote.c),
        stockSymbol: quotesymbol,
      },
    });

    return `You've Successfully purchased ${orderCount} shares of ${quotesymbol} @ ${formatNumber(
      quote.c
    )}/share for a total cost of ${formatNumber(cost)}!`;
  }

  return `You cannot afford to purchase this, your balance is only ${formatNumber(
    balance
  )}`;
}

export async function SellStock(
  user: DiscordUser,
  quotesymbol: string,
  orderCount: number
): Promise<string> {
  try {
    let stocksSold = 0.0;
    const userData = await GetUserData(user.id);
    const userStocks = await GetUserStocksAsMap(user.id, quotesymbol);
    const quote = await GetQuote(quotesymbol);

    const stockPromises = userStocks.map(async (stock) => {
      let currentQuantity = stock.quantity;
      if (currentQuantity >= orderCount - stocksSold) {
        currentQuantity = currentQuantity - orderCount - stocksSold;
        stocksSold += orderCount - stocksSold;
      } else if (
        stock.quantity <= orderCount - stocksSold &&
        stock.quantity >= 1
      ) {
        stocksSold += stock.quantity;
        currentQuantity = 0;
      }

      if (currentQuantity <= 0) {
        return prismaClient.stockLot.delete({
          where: { id: stock.id },
        });
      }
      return prismaClient.stockLot.update({
        where: { id: stock.id },
        data: { quantity: currentQuantity },
      });
    });

    await Promise.all(stockPromises);

    let balance = userData?.cash.toNumber() || 0.0;
    const credit = stocksSold * quote.c;
    balance += credit;

    await prismaClient.user.update({
      where: { discordId: user.id },
      data: { cash: new Decimal(balance) },
    });

    return `Sold ${stocksSold} shares of ${quotesymbol} @ ${formatNumber(
      quote.c
    )}/sh for a total of ${formatNumber(credit)}!`;
  } catch (e: any) {
    logger.error(e.message);
    return 'Error';
  }
}

/**
 * Fetches user's stocks, calculates the total portfolio value &
 * @param user
 */
export async function CalculatePortforlio(user: DiscordUser): Promise<string> {
  const userStocks = await GetUserStocksAsArray(user.id);

  // caclulate total market value and costBasis
  let marketVal = 0.0;
  let costBasis = 0.0;
  const priceMap = new Map<string, number>();

  (
    await Promise.all(
      userStocks.map(async (stockLot: StockLot) => {
        const symbol = stockLot.stockSymbol;
        let quote = null;
        if (!priceMap.has(symbol)) {
          quote = await GetQuote(symbol);
          priceMap.set(symbol, quote.c);
        }

        return {
          marketVal: stockLot.quantity * (priceMap.get(symbol) || 0.0),
          costBasis: stockLot.quantity * stockLot.priceBought.toNumber(),
        };
      })
    )
  ).forEach((lot) => {
    marketVal += lot.marketVal;
    costBasis += lot.costBasis;
  });

  const PnL = ((marketVal - costBasis) / costBasis) * 100;

  return `${user.username}'s portfolio value is ${formatNumber(
    marketVal
  )} ${formatPercentage(PnL)}`;
}

export async function GetBalance(user: DiscordUser): Promise<number> {
  return (
    (
      await prismaClient.user.findUnique({
        where: { discordId: user.id },
      })
    )?.cash.toNumber() || 0.0
  );
}

export async function ListStock(user: DiscordUser): Promise<string> {
  let result = '```';
  const userStocks = await GetUserStocksAsArray(user.id);
  if (userStocks.length === 0) {
    return 'You do not hold any stocks in your portfolio. Go buy some!';
  }

  userStocks.forEach((stock) => {
    result += `${stock.quantity} ${stock.stockSymbol} @ ${formatNumber(
      stock.priceBought.toNumber()
    )}/share\n`;
  });

  result += '```';

  return result;
}
