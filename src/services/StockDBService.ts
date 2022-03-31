import { User } from 'discord.js';
import Parse from 'parse/node';
import { v4 as uuidv4 } from 'uuid';
import Quote from '../interfaces/stocks/quote';
import StockLot from '../interfaces/stocks/StockLot';
import { formatNumber, formatPercentage } from '../utils/formatFunc';
import logger from '../utils/WinstonLogger';
import FinnhubService from './FinnhubService';

const finnhubClient = FinnhubService.getInstance(process.env.FINNHUB_API_KEY);

async function GetUserData(
  userId: string
): Promise<Parse.User<Parse.Attributes> | undefined> {
  try {
    return await new Parse.Query(Parse.User)
      .equalTo('discordID', userId)
      .first({ useMasterKey: true });
  } catch (e: any) {
    logger.error(e.message);
    return undefined;
  }
}

async function GetUserStocksAsArray(userId: string) {
  return new Parse.Query('StockLot')
    .equalTo('discordID', userId)
    .addDescending('symbol')
    .find();
}

async function createNewUser(user: User) {
  const newUser = new Parse.User();
  newUser.setUsername(user.username);
  const pass = uuidv4();
  newUser.setPassword(pass);
  newUser.set('discordID', user.id);
  newUser.set('cash', 1000.0);
  newUser.save(null, { useMasterKey: true });
  await (
    await user.createDM()
  ).send(
    `Welcome to StockBot. Your account has been created successfully. Use this pass code to access your account on the dashboard.${pass}`
  );

  return `Welcome to the market! Your starting balance is ${formatNumber(
    newUser.get('cash')
  )}`;
}

export async function SignUp(user: User): Promise<string> {
  // get user, if in database: reset balance; otherwise, make new user and set their properties.

  const userInDB: Parse.User<Parse.Attributes> | undefined = await GetUserData(
    user.id
  );

  if (userInDB) {
    const dm = await user.createDM();
    dm.send(
      'You seem to be already signed up. This action will reset your account. Please respond with Y/N.'
    );
    dm.awaitMessages((m) => /[yYnN]/.test(m.content) && !m.author.bot, {
      max: 1,
      errors: ['time'],
      time: 60000,
    })
      .then(async (collected) => {
        if (collected.first()?.content.startsWith('Y')) {
          try {
            const allStocks = await new Parse.Query('StockLot')
              .equalTo('discordID', user.id)
              .find();

            await Parse.Object.destroyAll(allStocks, { useMasterKey: true });
          } catch (err) {
            logger.error(err);
          }
          userInDB?.set('cash', 1000.0);
          userInDB?.save(null, { useMasterKey: true });

          await dm.send('You account has been reset successfully');
        } else {
          await dm.send("Okay. I've canceled your request.");
        }

        return `Welcome to the market! Your starting balance is ${formatNumber(
          userInDB?.get('cash')
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
  user: User,
  quote: Quote,
  quotesymbol: string,
  orderCount: number
): Promise<string> {
  const newStockLot = {
    ID: user.id,
    Date: new Date().toUTCString(),
    quantity: orderCount,
    priceBought: quote.c,
    symbol: quotesymbol,
    GUID: user.avatar,
  } as StockLot;
  const userData = await GetUserData(user.id);

  if (!userData) {
    throw new Error('User is not valid. Sign up first.');
  }

  let balance = userData.get('cash');
  const cost = newStockLot.priceBought * newStockLot.quantity;

  if (balance >= cost) {
    balance -= cost;
    userData.set('cash', balance);
    const stockLotPurchase = new (Parse.Object.extend(
      'StockLot'
    ))() as Parse.Object<Parse.Attributes>;
    stockLotPurchase.set('Date', new Date().toISOString());
    stockLotPurchase.set('discordID', user.id);
    stockLotPurchase.set('GUID', user.avatar);
    stockLotPurchase.set('priceBought', quote.c);
    stockLotPurchase.set('quantity', orderCount);
    stockLotPurchase.set('symbol', quotesymbol);

    userData.save(null, { useMasterKey: true });
    stockLotPurchase.save(null, { useMasterKey: true });
  } else {
    return `You cannot afford to purchase this, your balance is only ${formatNumber(
      balance
    )}`;
  }

  return `You've Successfully purchased ${orderCount} shares of ${quotesymbol} @ ${formatNumber(
    newStockLot.priceBought
  )}/share for a total cost of ${formatNumber(cost)}!`;
}

export async function SellStock(
  user: User,
  quotesymbol: string,
  orderCount: number
): Promise<string> {
  try {
    let stocksSold = 0.0;
    const userData = await GetUserData(user.id);
    const userStocks = await GetUserStocksAsMap(user.id, quotesymbol);
    const quote = await GetQuote(quotesymbol);

    const stockPromises = userStocks.map(async (stock) => {
      if (stock.get('quantity') >= orderCount - stocksSold) {
        stock.set('quantity', stock.get('quantity') - orderCount - stocksSold);
        stocksSold += orderCount - stocksSold;
      } else if (
        stock.get('quantity') <= orderCount - stocksSold &&
        stock.get('quantity') >= 1
      ) {
        stocksSold += stock.get('quantity');
        stock.set('quantity', 0);
      }

      if (stock.get('quantity') <= 0) {
        return stock.destroy({ useMasterKey: true });
      }
      return stock.save(null, { useMasterKey: true });
    });

    await Promise.all(stockPromises);

    let balance = userData?.get('cash') || 0.0;
    const credit = stocksSold * quote.c;
    balance += credit;
    userData?.set('cash', balance);
    await userData?.save(null, { useMasterKey: true });

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
export async function CalculatePortforlio(user: User): Promise<string> {
  const userStocks = await GetUserStocksAsArray(user.id);

  // caclulate total market value and costBasis
  let marketVal = 0.0;
  let costBasis = 0.0;
  const priceCache = new Map<string, number>();

  (
    await Promise.all(
      userStocks.map(async (stockLot: Parse.Object<Parse.Attributes>) => {
        const symbol = stockLot.get('symbol');
        let quote = null;
        if (!priceCache.has(symbol)) {
          quote = await GetQuote(symbol);
          priceCache.set(symbol, quote.c);
        }

        return {
          marketVal: stockLot.get('quantity') * (priceCache.get(symbol) || 0.0),
          costBasis: stockLot.get('quantity') * stockLot.get('priceBought'),
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

export async function GetBalance(user: User): Promise<number> {
  return (
    (
      await new Parse.Query(Parse.User).equalTo('discordID', user.id).first()
    )?.get('cash') || 0.0
  );
}

export async function ListStock(user: User): Promise<string> {
  let result = '```';
  const userStocks = await GetUserStocksAsArray(user.id);
  if (userStocks.length === 0) {
    return 'You do not hold any stocks in your portfolio. Go buy some!';
  }

  userStocks.forEach((stock) => {
    result += `${stock.get('quantity')} ${stock.get('symbol')} @ ${formatNumber(
      stock.get('priceBought')
    )}/share\n`;
  });

  result += '```';

  return result;
}

// #### PRIVATE FUNCTIONS ####

/**
 * creates a map of stocks with the same symbols. Primarily used by the Sell function
 * @param userId
 * @param symbol
 */
async function GetUserStocksAsMap(
  userId: string,
  symbol: string
): Promise<Parse.Object<Parse.Attributes>[]> {
  return new Parse.Query('StockLot')
    .equalTo('symbol', symbol)
    .equalTo('discordID', userId)
    .ascending('Date')
    .find();
}
